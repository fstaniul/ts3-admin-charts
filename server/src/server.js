require('console.table');
const fs = require('fs');
const path = require('path');

const config = require('./config.json');
const logReader = require('./teamspeak3/log-reader');

const express = require('express');
const Sequelize = require('sequelize'), Op = Sequelize.Op;
const sqlite3 = require('sqlite3');

const app = express();
const sequelize = require('./database');

sequelize.InitializedPromise.then(() => {
    const apiRouter = require('./routes/api.route');

    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.post('/auth', require('body-parser').json(), require('./routes/auth.handler').auth);
    app.use('/api', apiRouter);

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    app.use((err, req, res, next) => {
        if (err == 404 || err.code == 404 || err.responseCode == 404)
            res.sendFile(path.join(__dirname, 'public', '404.html'));
        else next(err);
    });

    return logReader.extractFolder(config.teamspeak.logFolder)
        .then(() => console.log(`Data from logs saved in the database!`))
        .then(() => new Promise((resolve, reject) => {
            const port = process.env.PORT || config.port || 3000;
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
                resolve();
            });
        }));
});