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
        password: {
            type: datatypes.STRING,
            allowNull: false,
        },
        passwordUpdatedAt: datatypes.DATE,
    }, {
        hooks: {
            beforeCreate: (user) => {
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync());
                user.passwordUpdatedAt = new Date();
                return user;
            }
        }
    });

    User.prototype.changePassword = (password) => {
        this.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
        this.passwordUpdatedAt = new Date();
        return this;
    }

    User.prototype.verifyPassword = (password) => {
        return bcrypt.compareSync(password, this.password);
    }

    return User;
};