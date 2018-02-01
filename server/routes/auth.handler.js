const fs = require('fs'), path = require('path');

const router = require('express').Router();

router.use(require('body-parser').json());
router.use(require('cookie-parser')());

const jwt = require('jsonwebtoken');
const sequelize = require('../server').sequelize;

const keys = {
    private: fs.readFileSync(path.join(__dirname, 'private.pem')),
    public: fs.readFileSync(path.join(__dirname, 'public.pem'))
}

router.post('/', (req, res) => {
    const {username, password} = req.body || {};

    if (!username || !password) res.sendStatus(400);

    sequelize.models.User.findOne({where: {username: body.username}})
        .then(user => {
            if (!user) res.sendStatus(401);
            else if (!user.verifyPassword(password)) res.sendStatus(401);
            else {
                const userSafe = Object.assign({}, user.dataValues);
                delete userSafe.password;
                delete userSafe.passwordUpdatedAt;
                jwt.sign(userSafe, keys.private, {algorithm: 'RS256'})
                    .then(token => res.json({user, token}))
                    .catch(err => {
                        console.log('Error while signing usedata to a key', err);
                        res.sendStatus(500);
                    });
            }
        })
});