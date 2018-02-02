const bcrypt = require('bcrypt');

module.exports = (sequelize, datatypes) => {
    const User = sequelize.define('User', {
        uuid: {
            type: datatypes.UUID,
            defaultValue: datatypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: datatypes.STRING,
            allowNull: false,
            unique: true
        },
        administrator: {
            type: datatypes.BOOLEAN,
            defaultValue: false,
        },
        password: {
            type: datatypes.STRING,
            allowNull: false,
        },
        passwordUpdatedAt: datatypes.DATE,
        accepted: {
            type: datatypes.BOOLEAN,
            defaultValue: false,
        }
    });

    User.addHook('beforeBulkCreate', 'hashAllPasswords', (users, options) => {
        users.forEach(user => {
            user.setDataValue('password', bcrypt.hashSync(user.getDataValue('password'), bcrypt.genSaltSync()));
            user.setDataValue('passwordUpdatedAt', new Date());
        });

        return users;
    });

    User.addHook('beforeCreate', 'hashPassword', (user, options) => {
        user.setDataValue('password', bcrypt.hashSync(user.getDataValue('password'), hash.genSaltSync()));
        user.setDataValue('passwordUpdatedAt', new Date());
        return user;
    });

    User.prototype.changePassword = function (password) {
        this.setDataValue('password',  bcrypt.hashSync(password, bcrypt.genSaltSync()));
        this.setDataValue('passwordUpdatedAt', new Date());
        return this.save();
    }

    User.prototype.verifyPassword = function (password) {
        return bcrypt.compareSync(password, this.getDataValue('password'));
    }

    User.prototype.safe = function () {
        const safe = Object.assign({}, this.dataValues);
        delete safe.password;
        delete safe.passwordUpdatedAt;
        return safe;
    }

    return User;
};