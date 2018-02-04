const config = require('../config.json');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authHandler = require('./auth.handler');
const Op = require('sequelize').Op;
const sequelize = require('../database');

const router = express.Router();

const teamspeak3 = require('../teamspeak3/teamspeak3instace');

router.use(cookieParser());

function parseDatestring(datestring) {
    return /^\d{4}-\d{2}-\d{2}$/.test(datestring) ? new Date(`${datestring}T00:00:00.000+01:00`) : null;
}

const __server = require('../server');

router.route('/users')
    .get(authHandler.verify,
    authHandler.isAdmin,
    (req, res, next) => {
        sequelize.models.User.findAll()
            .then(users => users.map(user => user.safe()))
            .then(users => res.json({ users, status: 'success', error: 0 }))
    })
    .post(bodyParser.json(),
        (req, res) => {
        const { username, password, passwordRepeat } = req.body;

        if (!username || !password || !passwordRepeat) res.sendStatus(400);
        if (passwordRepeat !== password) res.sendStatus(400);

        sequelize.models.User.findOrCreate({ where: { username }, defaults: { username, password } })
            .spread((user, created) => {
                if (!created) {
                    res.sendStatus(300);
                    return;
                }
                else {
                    res.json(user.safe());

                    const io = __server.io;
                    io.emit('users-new', user.safe());

                    sequelize.models.User.count({where: {accepted: false}})
                        .then(count => io.emit('users-accepted', count));
                }
            });
    })
    .patch(bodyParser.json(),
        authHandler.verify,
    authHandler.isAdmin,
    (req, res) => {
        const { uuid, accepted, administrator } = req.body;

        if (!uuid) {
            res.sendStatus(400);
            return;
        }

        sequelize.models.User.findOne({ where: { uuid: uuid } })
            .then(user => {
                let emitAccepted = false;
                if (typeof accepted != 'undefined') {
                    if (user.accepted !== accepted) emitAccepted = true;
                    user.accepted = !!accepted;
                }
                if (typeof administrator != 'undefined') {
                    user.administrator = !!administrator;
                }

                if (emitAccepted) sequelize.models.User.count({where: {accepted: false}})
                    .then(count => io.emit('users-accepted', count));

                user.save().then(user => {
                    res.json(user.safe())
                    
                    const io = __server.io;
                    io.emit('users-updated', user.safe());
                });
            });
    });

router.route('/users/:id')
    .patch(
        bodyParser.json(),
        authHandler.verify,
    (req, res) => {
        if (req.uuid !== req.params.id) {
            res.sendStatus(403);
            return;
        }

        const { password, passwordRepeat } = req.body;

        if (!password || !passwordRepeat || password !== passwordRepeat) {
            res.sendStatus(400);
            return;
        }

        sequelize.models.User.findOne({ where: { uuid: req.uuid } })
            .then(user => user.changePassword(password))
            .then(user => authHandler.getToken(user).then(token => {
                res.json({ user: user.safe(), token });
            }))
            .catch(err => console.log(err));
    })
    .delete(authHandler.verify,
    authHandler.isAdmin,
    (req, res) => {
        const { id } = req.params;
        if (!id) res.sendStatus(400);
        else {
            sequelize.models.User.destroy({ where: { uuid: id } })
                .then((count) => {
                    res.json({ deleted: count, success: count > 0 })
                    const io = __server.io;
                    io.emit('users-deleted', {uuid: id});

                    sequelize.models.User.count({where: {accepted: false}})
                        .then(count => io.emit('users-accepted', count));
                });
        }
    }
    );

router.route('/ts3admins')
    .get(authHandler.verify,
    (req, res) => {
        const admins = teamspeak3.getAdministratorsInGroups(config.teamspeak.adminGroups)
            .map(rawAdmin => ({ databaseId: rawAdmin.client_database_id, nickname: rawAdmin.client_nickname }));
        res.json({ administrators: admins })
    })

router.get('/unaccepted-users', authHandler.verify, (req, res) => {
    sequelize.models.User.count({where: {accepted: false}})
        .then(count => res.json({count}));
});

router.route('/reg')
    .get(authHandler.verify,
    (req, res, next) => {
        let from = req.query.from, to = req.query.to;
        let ids = req.query.ids ? req.query.ids.split(' ').map(id => +id) : undefined;

        if (!ids || !from || !to) {
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

        sequelize.models.Teamspeak3Administrator.findAll({ where: { databaseId: ids } })
            .then(teamspeak3Administrators =>
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
                            databaseId: ids,
                        }
                    }
                }).then(clients => {
                    const rebuildData = {};
                    for (let client of clients) {
                        const ts3admin = client.Teamspeak3Administrator;
                        if (!rebuildData[ts3admin.databaseId]) {
                            rebuildData[ts3admin.databaseId] = {
                                nickname: ts3admin.nickname,
                                databaseId: ts3admin.databaseId,
                                dates: {}
                            }
                        }
                        const dates = rebuildData[ts3admin.databaseId].dates;
                        const date = /^(\d{4}-\d{2}-\d{2})/.exec(client.registrationDate.toISOString())[1];
                        if (!dates[date]) {
                            dates[date] = 1;
                        } else dates[date] = dates[date] + 1;
                    }

                    const response = {
                        labels: [],
                        data: []
                    };

                    const oneDay = 86400000;
                    for (let time = new Date(from.getTime() + 7200000); time < to; time = new Date(time.getTime() + oneDay)) {
                        response.labels.push(/^(\d{4}-\d{2}-\d{2})/.exec(time.toISOString())[1]);
                    }

                    for (let admin of teamspeak3Administrators) {
                        const adminData = {
                            label: `Zarejestrowani przez ${admin.nickname}`,
                            count: []
                        };

                        response.labels.forEach(date => {
                            const count = rebuildData[admin.databaseId] && rebuildData[admin.databaseId].dates && rebuildData[admin.databaseId].dates[date] || 0;
                            adminData.count.push(count);
                        });

                        response.data.push(adminData);
                    }

                    // console.log(response);

                    res.json(response);
                })
            );
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
