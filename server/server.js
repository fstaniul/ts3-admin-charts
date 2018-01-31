const fs = require('fs');
const path = require('path');

const config = require('./config.json');

const express = require('express');
const Sequelize = require('sequelize'), Op = Sequelize.Op;
const sqlite3 = require('sqlite3');

const app = express();
const sequelize = new Sequelize({
    database: 'ts3_admin_charts',
    dialect: 'sqlite',
    storage: 'sqlite3.database',
    operatorsAliases: false,
    logging: initSequelizeLogging(),
    define: {
        timestamps: false,
    }
});

module.exports = exports = {
    app,
    sequelize
};

setupSequelize();

function initSequelizeLogging() {
    const pathToLogFolder = path.join(__dirname, config.logFolder || 'logs');
    if (!fs.existsSync(pathToLogFolder)) fs.mkdirSync(pathToLogFolder);
    const writeStream = fs.createWriteStream(path.join(pathToLogFolder, 'sequelize.log'));
    return (data, options) => writeStream.write(`${data}\n`);
}

function setupSequelize(sqlite3Error) {

    fs
        .readdirSync(path.join(__dirname, 'models'))
        .filter(f => /\.model\.js$/.test(f))
        .map(f => path.join(__dirname, 'models', f))
        .forEach(f => sequelize.import(f))

    Object.keys(sequelize.models)
        .map(key => sequelize.models[key])
        .forEach(m => m.associate && m.associate(sequelize.models));

    sequelize.authenticate()
        .then(() => sequelize.sync({
            force: !!process.env.DEBUG || !!config.DEBUG
        }))
        .then(() => setupApp())
        .catch((err) => {
            console.log(err);
            console.log(`Application failed to initialize, will close now!`);
            process.exit(1);
        });
}

function setupApp() {
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    app.use((err, req, res, next) => {
        if (err == 404 || err.code == 404 || err.responseCode == 404)
            res.sendFile(path.join(__dirname, 'public', '404.html'));
        else next(err);
    });

    const logReader = require('./teamspeak3/log-reader');
    logReader.extractFolder(path.join(__dirname, 'logs'))
        .then(() => sequelize.models.Client.findAll({
            where: {
                registrationDate: {
                    [Op.gt]: new Date(2018,0, 30, 0, 0, 0),
                    [Op.lt]: new Date(2018,0, 31, 0, 0, 0)
                }
            },
            include: [{model: sequelize.models.Teamspeak3Administrator, where: {databaseId: 42230}}]
        }))
        .then((client) => {
            console.log(client.length);
        })
        // .then(() => sequelize.models.Client.findAll())
        // .then((clients) => console.log(clients))
        .catch((err) => console.log(err.SequelizeTimeoutError || err));
}