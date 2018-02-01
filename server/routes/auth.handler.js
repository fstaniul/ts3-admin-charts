const fs = require('fs'), path = require('path');

const router = require('express').Router();

router.use(require('body-parser').json());
router.use(require('cookie-parser')());

const jwt = require('jsonwebtoken');
const sequelize = require('../database');

const keys = {
    private: fs.readFileSync(path.join(__dirname, 'private.pem')),
    public: fs.readFileSync(path.join(__dirname, 'public.pem'))
}

function sign(user) {
    const userSafe = Object.assign({}, user.dataValues);
    delete userSafe.password;
    delete userSafe.passwordUpdatedAt;

    let resolve, reject, promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    jwt.sign({ user: userSafe }, keys.private, { algorithm: 'RS256', expiresIn: '7d' }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
    });

    return promise;
}

function verify(token) {
    // console.log(`Calling verify with token ${token}`);

    let resolve, reject, promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    }).then(data => sequelize.models.User.findOne({ where: { uuid: data.user.uuid } })
        .then(user => {
            const timeOftokenCreation = new Date(data.iat * 1000);
            // console.log('Time of token creation: ', timeOftokenCreation);
            // console.log('Users password updated at: ', user.passwordUpdatedAt);
            if (!user) throw new Error('User with given UUID not found!');
            else if (user.passwordUpdatedAt > timeOftokenCreation) throw new Error('User password changed after the token generation!');
            else return data.user.uuid;
        }));

    jwt.verify(token, keys.public, { algorithms: ['RS256'] }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
    });

    return promise;
}

exports.auth = (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) res.sendStatus(400);

    sequelize.models.User.findOne({ where: { username } })
        .then(user => {
            if (!user) res.sendStatus(401);
            else if (!user.verifyPassword(password) || !user.accepted) res.sendStatus(401);
            else {
                sign(user)
                    .then(token => res.json({token, status: 'success', error: 0}))
            }
        })
};

exports.verify = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) res.sendStatus(401);
    else {
        token = token.replace(/^Bearer /, '');
        verify(token)
            .then(uuid => {
                req.uuid = uuid;
                next();
            })
            .catch(err => res.sendStatus(401));
    }
}

exports.isAdmin = (req, res, next) => {
    if (!req.uuid) res.sendStatus(401);
    else {
        sequelize.models.User.findOne({where: {uuid: req.uuid}})
            .then(user => {
                if (!user || !user.accepted) res.sendStatus(401);
                else if (!user.administrator) res.sendStatus(403);
                else next();
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    }
}

exports.isAdminForPost = (req, res, next) => {
    if (req.method === 'POST') exports.isAdmin(req, res, next);
    else next();
}

exports.signUp = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) req.sendStatus(400);
    sequelize.models.User.findOrCreate({where: {username}, defaults: {username, password}})
        .spread((user, created) => {
            if (created) res.json({status: 'success', message: `Created account ${username}`, error: 0});
            else res.json({status: 'error', error: 1, message: `Client with username ${username} already exists!`});
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        })
}