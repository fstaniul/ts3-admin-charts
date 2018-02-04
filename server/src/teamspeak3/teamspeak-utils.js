const Teamspeak3Connector = require('./teamspeak-connector');

Array.prototype.flatMap = function () {
    return this.reduce((acc, xs) => xs.forEach(x => acc.push(x)) || acc, []);
}

// NOTE: In every prototype mthod when using __innerSend remember to disconnect after connecting!

// Teamspeak3Connector.prototype.getAdministratorsInGroups = function (groups) {
//     this.connect();

//     const administrators = groups.map(groupId => this.__innerSend('servergroupclientlist', {sgid: groupId}).data)
//         .filter(x => !!x)
//         .flatMap()
//         .map(admin => admin.cldbid)
//         .map(adminId => this.__innerSend('clientdbinfo', {cldbid: adminId}).data)
//         .flatMap()
//         // .reduce((acc, xs) => xs.forEach(x => acc.push(x)) || acc, [])
//         // .map(x => {console.log(x); return x});

//     this.disconnect();

//     return administrators;
// }

Teamspeak3Connector.prototype.getAdministratorsInGroups = function (groups) {
    this.connect();

    const administrators = groups.map(group => {
        let id = typeof group === 'number' ? group : group.id;
        let data = this.__innerSend('servergroupclientlist', {sgid: id}).data;
        if (group.limit) data = data.splice(0, group.limit);
        return data;
    })
    .filter(x => !!x)
    .flatMap()
    .map(admin => admin.cldbid)
    .map(adminId => this.__innerSend('clientdbinfo', {cldbid: adminId}).data)
    .flatMap();

    this.disconnect();

    return administrators;
}