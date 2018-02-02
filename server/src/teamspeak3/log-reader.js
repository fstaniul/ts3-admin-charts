const fs = require('fs');
const path = require('path');
const sequelize = require('../database');

const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\.\d{6}\|INFO    \|VirtualServer \|1  \|client \(id:(\d+)\) was added to servergroup '(.*)'\(id:(641|789)\) by client '(.*)'\(id:(\d+)\)$/;
const datestringRegex = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/;

const util = require('util');
const readdir = util.promisify(fs.readdir), readFile = util.promisify(fs.readFile);

function parseDateString (dateString) {
    return datestringRegex.test(dateString) ? new Date(dateString.replace(datestringRegex, '$1T$2.000+01:00')) : null;
}

/**
 * Extracts data from a single line using regex.
 * If regex does not match the line null is returned.
 * @param {string} line 
 */
function extractDataFromLine(line) {
    let data = regex.exec(line);
    if (!data) return null;
    // console.log(`Extracting data from line: ${line}`);
    return { date: parseDateString(data[1]), clientId: data[2], adminNickname: data[5], adminId: data[6] };
}

/**
 * Extracts data from a single line using regex.
 * @param {string} fileData String containg data from a single teamspeak 3 log file.
 */
function extractDataFromFile(fileData) {
    return fileData
        .split('\n')
        .map(line => extractDataFromLine(line))
        .filter(data => !!data)
}

/**
 * Purges data from already registered clients. Data should be sorted by the date attribute!
 * Clients is an array of numbers containing already registered clients before this data is handled, this should
 * be get from the database.
 * @param {Array<{date, clientId, adminNickname, adminId}>} data Data extracted from file.
 * @param {Array<number>} clients Already registered clients array.
 */
function purgeAlreadyRegisteredClients(data, clients) {
    const alreadyRegistered = {};
    clients.forEach(client => alreadyRegistered[client] = true);

    return data
        .map(record => {
            if (alreadyRegistered[record.clientId]) return null;
            alreadyRegistered[record.clientId] = true;
            return record;
        })
        .filter(record => !!record);
}

/**
 * Returns a promise with map of Teamspeak3Administrator models mapped by databaseId.
 * Plain object that is used as map of:  databaseId -> Teamspeak3Administrator model that represents single database row.
 * If admin ids found in dataset are not already present in the database this method will insert the remaining needed teamspeak3administrator
 * informations into database using informations present in data set so it is not duplicated.
 * @param {{[id]: {id, nickname, clients}}} adminsInDataset the data set from log files
 */
function asyncGetAdminModelsPresentInDataSet(adminsInDataset) {
    const adminModels = {}; Object.keys(adminsInDataset).map(key => adminModels[key] = adminsInDataset[key].nickname) //Save each admin in a id:name map
    return sequelize.models.Teamspeak3Administrator.findAll({
        where: {
            databaseId: Object.keys(adminModels) //Since we dont keep it as an array but rather plain object used here as a id:name map.
        }
    })
        .then((admins) => { //Admins that are already present in database
            admins.forEach(admin => adminModels[admin.databaseId] = admin); //Save each model found in database instead of name
            const adminsToCreate = Object.keys(adminModels)
                .filter(key => typeof adminModels[key] === 'string') //Filter those admin ids that were not found in database
                .map(key => ({ databaseId: key, nickname: adminModels[key] })); //Map them to database object representation
            if (adminsToCreate.length === 0) return []; //Since no more admins to create we can just return empty array so next then will get it as if it were processed by sequelize
            return sequelize.models.Teamspeak3Administrator.bulkCreate(adminsToCreate); //Create admin records in database and return this promise up
        })
        .then((admins) => { //Admins that were just created so now all of administrators present in dataset should be in the database, so return map of each model with its databaseId
            admins.forEach(admin => adminModels[admin.databaseId] = admin); //Save rest of models in database
            return adminModels;
        });
}

function createAdminRegisteredRecordFromDataset(data) {
    // console.log(data);

    const adminRegistered = {};
    data.forEach(record => { //Map records to registered per each admin for easier manipulation in the database!
        if (!adminRegistered[record.adminId]) {
            adminRegistered[record.adminId] = {
                id: record.adminId,
                nickname: record.adminNickname,
                clients: []
            };
        }

        adminRegistered[record.adminId].clients.push({ id: record.clientId, date: record.date });
    });

    // console.dir('Admin Registered Records:');
    // console.dir(adminRegistered);

    return adminRegistered;
}

/**
 * this method saves the data to database. Dataset should be already purged from dublicate values of clients.
 * Before calling this method call {#purgeAlreadyRegisteredClients(data, clients)} passing already registered client ids array as 2nd parameter.
 * Clients should also be retrived from a database (the clients cannot be present in database!)
 * 
 * This method is asonchrynus and thus will return a promise after it finishes its actions
 * @param {Array<{date, clientId, adminId, adminNickname}>} data Clean dataset that should be saved in the database for later referance.
 */
function asyncSaveDatasetIntoDatabase(data) {
    const adminRegisteredRecords = createAdminRegisteredRecordFromDataset(data);

    return asyncGetAdminModelsPresentInDataSet(adminRegisteredRecords)
        .then((adminModels) => asyncSaveClientsForEachAdministratorInDatabase(adminModels, adminRegisteredRecords))
}

function asyncSaveClientsForEachAdministratorInDatabase(adminModels, adminRecords) {
    const promises = Object.keys(adminRecords).map(key => adminRecords[key])
        .map(record => {
            const clientRows = record.clients.map(client => ({databaseId: client.id, registrationDate: client.date})); //map to database rows
            return sequelize.models.Client.bulkCreate(clientRows)
                .then(clients => adminModels[record.id].setClients(clients));
        });

    return Promise.all(promises);
}

function asyncExtractDataFromLogFiles(logFiles) {
    const promises = logFiles.map(filename => readFile(filename, 'utf8'));
    return Promise.all(promises)
        .then((filesData) => filesData.map(fileData => extractDataFromFile(fileData)))
        .then((datas) => datas.reduce((list, x) => list.concat(x), []))
        .then(dataset => 
            sequelize.models.Client.findAll()
                .then((clients) => clients.map(client => client.databaseId))
                .then((clientIds) => purgeAlreadyRegisteredClients(dataset, clientIds))
                .then((cleanDataset) => asyncSaveDatasetIntoDatabase(cleanDataset))
        )
}

/**
 * Extracts data from folder matching all log files.
 * @param {string} folderPath 
 */
function asyncExtractDataFromLogFolder (folderPath) {
    const fileNameRegex = /^ts3server_\d{4}-\d{2}-\d{2}__\d{2}_\d{2}_\d{2}\.\d{6}_1\.log$/;

    return readdir(folderPath)
        .then(files => files.map(filename => path.join(folderPath, filename)))
        .then(files => asyncExtractDataFromLogFiles(files))
}

module.exports = {
    extractFiles: asyncExtractDataFromLogFiles,
    extractFolder: asyncExtractDataFromLogFolder
};