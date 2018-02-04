const fs = require('fs'), path = require('path');
const Sequelize = require('sequelize');
const config = require('./config.json');

const sequelize = new Sequelize({
    database: 'ts3_admin_charts',
    dialect: 'sqlite',
    storage: path.join(__dirname, 'sqlite3.db'),
    operatorsAliases: false,
    logging: initSequelizeLogging()
});

function initSequelizeLogging() {
    const pathToLogFolder = path.join(__dirname, '..', config.logFolder || 'logs');
    if (!fs.existsSync(pathToLogFolder)) fs.mkdirSync(pathToLogFolder);
    const writeStream = fs.createWriteStream(path.join(pathToLogFolder, 'sequelize.log'));
    return (data, options) => writeStream.write(`${data}\n`);
}

function setupSequelize() {
    fs
        .readdirSync(path.join(__dirname, 'models'))
        .filter(f => /\.model\.js$/.test(f))
        .map(f => path.join(__dirname, 'models', f))
        .forEach(f => sequelize.import(f))

    Object.keys(sequelize.models)
        .map(key => sequelize.models[key])
        .forEach(m => m.associate && m.associate(sequelize.models));

    return sequelize.authenticate()
        .then(() => sequelize.sync({
            // force: !!process.env.DEBUG || !!config.DEBUG
        }))
        .then(() => createAccounts())
        .catch((err) => {
            console.log(err);
            console.log(`Application failed to initialize, will close now!`);
            process.exit(1);
        });
}

function getPasswordFromConfig(username, accounts) {
    return accounts[username].password || accounts[username] || "password"
}

function createAccounts() {
    const accounts = ((config || {}).database || {}).accounts || {};
    const accountRows = Object.keys(accounts)
        .map(key => ({
            username: key,
            password: getPasswordFromConfig(key, accounts),
            administrator: !!accounts[key].administrator,
            accepted: true,
        }))

    return sequelize.models.User.findAll()
        // .then((x) => console.log(x) || x)
        .then(existingUsers => {
            if (!existingUsers || existingUsers.length < 1) return [];

            console.log('Already existing accounts in database: ')
            console.table(existingUsers.map(user => ({
                USERNAME: user.username,
                ADMIN: user.administrator,
                ACCEPTED: user.accepted
            })));

            const existingUsernames = existingUsers.map(user => user.username);

            const passwordChangePromiseses = existingUsers
            .filter(user => !!accounts[user.username])
            .filter(user => !user.verifyPassword(getPasswordFromConfig(user.username, accounts)))
                .map(user => {
                    console.log(`Changing ${user.username} password to ${getPasswordFromConfig(user.username, accounts)}`)
                    return user.changePassword(getPasswordFromConfig(user.username, accounts))
                });

            if (passwordChangePromiseses.length > 0)
                return Promise.all(passwordChangePromiseses).then(() => existingUsernames);
            else return existingUsernames;
        })
        // .then((x) => console.log(x) || x)        
        .then(existingUsernames => accountRows.filter(account => !existingUsernames.includes(account.username)))
        // .then((x) => console.log(x) || x)        
        .then(accountsToCreate => sequelize.models.User.bulkCreate(accountsToCreate))
        // .then((x) => console.log(x) || x)        
        .then(createdAccounts => {
            if (!createdAccounts || createdAccounts.length < 1) return;
            console.log('Newly created accounts from config:')
            console.table(createdAccounts.map(acc => ({
                USERNAME: acc.username,
                PASSWORD: accounts[acc.username].password || accounts[acc.username] || 'password',
                ADMIN: acc.administrator,
                ACCEPTED: acc.accepted
            })))
        });
}

module.exports = exports = sequelize;

exports.InitializedPromise = new Promise((resolve, reject) => {
    setupSequelize().then(resolve);
});

