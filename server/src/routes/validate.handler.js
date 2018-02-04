const authHandler = require('./auth.handler');
const sequelize = require('../database');

module.exports = (req, res) => {
    let token = req.header('Authorization');
    if (!token) {
        res.sendStatus(401);
        return;
    }
    token = token.replace(/^Bearer /, '');
    authHandler.verityToken(token)
        .then(userUuid => sequelize.models.User.findOne({ where: { uuid: userUuid } }))
        .then(user => authHandler.getToken(user).then(token => {
            res.json({ user: user.safe(), token });
        }))
        .catch(err => res.sendStatus(401));
};
