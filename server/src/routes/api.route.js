const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authHandler = require('./auth.handler');
const Op = require('sequelize').Op;
const sequelize = require('../database');

const router = express.Router();

router.use(bodyParser.json());
router.use(cookieParser());

router.use(authHandler.verify);
router.use(authHandler.isAdminForPost);

function parseDatestring(datestring) {
    return /^\d{4}-\d{2}-\d{2}$/.test(datestring) ? new Date(`${datestring}T00:00:00.000+01:00`) : null;
}

router.route('/users')
    .get((req, res, next) => {
        sequelize.models.User.findAll()
            .then(users => users.map(user => user.safe()))
            .then(users => res.json({users, status: 'success', error: 0}))
    });

router.route('/reg/:id')
    .get((req, res, next) => {
        let id = req.params.id;
        let from = req.query.from, to = req.query.to;

        if (!id || !from || !to) {
            res.sendStatus(400);
            return;
        }
        from = parseDatestring(from);
        to = parseDatestring(to);
        if (!from || !to) {
            res.sendStatus(400);
            return;
        }

        //If from is after to change them
        if (from > to) {
            let temp = to;
            to = from;
            from = temp;
        }

        sequelize.models.Client.findAll({
            where: {
                registrationDate: {
                    [Op.gt]: from,
                    [Op.lt]: to,
                }
            },
            include: {
                model: sequelize.models.Teamspeak3Administrator,
                where: {
                    databaseId: id,
                }
            }
        })
        // .then(clients => clients.map(client => {
        //     client.registrationDate.setHours(0, 0, 0, 0);
        //     return client;
        // }))
        .then(clients => res.json(clients))
    })

router.all('*', (req, res) => {
    res.sendStatus(404);
});

router.use((err, req, res, next) => {
    console.log(err);
    res.status(err.code || 500);
    res.json({ message: err.message });
});

module.exports = router;