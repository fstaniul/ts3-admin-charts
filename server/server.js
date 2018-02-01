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
    const apiRouter = require('./routes/api.route');

    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/api', apiRouter);

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    app.use((err, req, res, next) => {
        if (err == 404 || err.code == 404 || err.responseCode == 404)
            res.sendFile(path.join(__dirname, 'public', '404.html'));
        else next(err);
    });

    return new Promise((resolve, reject) => {
        const port = process.env.PORT || config.port || 3000;
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
            resolve();
        });
    });
}