module.exports = (sequelize, datatypes) => {
    const Client = sequelize.define('Client', {
        databaseId: {
            type: datatypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        registrationDate: datatypes.DATE
    });

    Client.associate = (models) => {
        Client.belongsTo(models.Teamspeak3Administrator);
        models.Teamspeak3Administrator.hasMany(Client);
    }
}