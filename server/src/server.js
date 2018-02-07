module.exports = exports = {};

require('console.table');
const fs = require('fs');
const path = require('path');

const bodyParser = require('body-parser');

const config = require('../config.json');
const logReader = require('./teamspeak3/log-reader');

const express = require('express');
const Sequelize = require('sequelize'), Op = Sequelize.Op;
const sqlite3 = require('sqlite3');

const app = exports.app = express();
const http = exports.http = require('http').Server(app);
const io = exports.io = require('socket.io')(http);
const sequelize = exports.sequelize = require('./database');

sequelize.InitializedPromise.then(() => {
        const apiRouter = require('./routes/api.route');
        const authHandler = require('./routes/auth.handler');
        const validateTokenHandler = require('./routes/validate.handler.js');

        app.use(express.static(path.join(__dirname, '..', 'public')));

        app.post('/auth', bodyParser.json(), authHandler.auth);
        app.get('/validate', validateTokenHandler);
        app.use('/api', apiRouter);

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
        });
        app.use((err, req, res, next) => {
            if (err == 404 || err.code == 404 || err.responseCode == 404)
                res.sendFile(path.join(__dirname, 'public', '404.html'));
            else next(err);
        });

        return logReader.extractFolder(config.teamspeak.logFolder)
            .then(() => console.log(`Data from logs saved in the database!\n`))
            .then(() => setupServer());
    })
    .then(() => {
        const timeoutTime = new Date(Date.now() + 86400000);
        timeoutTime.setHours(0, 0, 0, 0);
        const timeoutMillis = timeoutTime.getTime() - Date.now();
        console.log(`Next log reading planned for: ${timeoutTime.toISOString()}. It will be executed in approximately ${timeoutMillis}ms\n`);
        setTimeout(() => setupLogReaderInterval(), timeoutMillis);
    });

function setupServer() {
    return new Promise((resolve, reject) => {
        const port = process.env.PORT || config.port || 3000;

        setupSocketIO(io);

        http.listen(port, () => {
            console.log(`Server listening on port ${port}\n`);
            resolve();
        });
    })
    .catch(err => console.log(err) || process.exit());
}


function setupLogReaderInterval() {
    setInterval(() => {
        logReader.extractFolder(config.teamspeak.logFolder)
            .then(() => console.log(`${timeAsString()} :: Data from logs saved in the database!`));
    }, 86400000)
}

function timeAsString() {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function setupSocketIO(io) {

}
