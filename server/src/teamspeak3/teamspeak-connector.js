const netlinkwrapper = require('netlinkwrapper');
const __MAX_BYTES = 4096;

function parseTeamspeak3Data(data) {
    if (data.indexOf('|') > -1) { //check if array data is present
        return data.split('|').map(d => parseTeamspeak3Data(d));
    }

    const result = {};
    data.split(' ')
        .map(kvp => kvp.split('='))
        .forEach(split => result[split[0]] = decodeTS3String(split.slice(1).join('=')));

    return result;
}

function encodeTS3String(string) {
    return string
        .replace(/\\/g, '\\\\')
        .replace(/ /g, '\\s')
        .replace(/\//g, '\\/')
        .replace(/\|/g, '\\p')
        .replace('\b', '\\b')
        .replace(/\f/g, '\\f')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\a/g, '\\a')
        .replace(/\v/g, '\\v')
}

function decodeTS3String(string) {
    return string
        .replace(/\\\\/g, '\\[$mksave]')
        .replace(/\\s/g, ' ')
        .replace(/\\\//g, '/')
        .replace(/\\p/g, '|')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\a/g, '\a')
        .replace(/\\v/g, '\v')
        .replace(/\\\[\$mksave\]/g, '\\');
}

class Teamspeak3Connector {
    constructor(port, host, login, password, serverId) {
        this.port = port;
        this.host = host;
        this.login = login;
        this.password = password;
        this.serverId = serverId;
    }

    connect() {
        if (this.netlink) return;

        const netlink = new netlinkwrapper();
        netlink.connect(this.port, this.host);
        netlink.blocking(true);
        this.netlink = netlink;

        let data = netlink.read(__MAX_BYTES);
        if (!/^TS3/.test(data)) throw new Error('server does not responds like a teamspeak 3 server');

        data = this.__innerSend(`login ${this.login} ${this.password}`);
        if (data.error.id !== 0) throw new Error(data.error.msg);
        data = this.__innerSend(`use ${this.serverId}`);
        if (data.error.id !== 0) throw new Error(data.error.msg);
    }

    disconnect() {
        this.netlink.disconnect();
        delete this.netlink;
    }

    __innerSend(command, args) {
        let commands = command;
        if (args) commands += ' ' + Object.keys(args).map(k => `${k}=${encodeTS3String(`${args[k]}`)}`).join(' ');
        commands += '\n\r';
        this.netlink.write(commands);

        let data = [];
        let lastRead = this.netlink.read(__MAX_BYTES);
        while (!/^error/.test(lastRead)) {
            const spl = lastRead.split('\n\r');
            data.push(spl[0]);
            if (spl[1]) lastRead = spl[1];
            else lastRead = this.netlink.read(__MAX_BYTES);
        }

        let errorRS = /^error id=(\d+) msg=(.*)/.exec(lastRead.replace(/\n\r$/, ''));
        const error = { id: +errorRS[1], msg: errorRS[2] };

        const strData = data.join('').replace(/\n\r$/, '').split('|');

        return {
            data: /^help/.test(command) ? data : data.length > 0 ? strData.map(x => parseTeamspeak3Data(x)) : undefined, // if it is help command then do not parse the response just return data as-is
            error
        }
    }

    send(command, args) {
        this.connect();

        const data = this.__innerSend(command, args);

        this.disconnect();

        return data;
    }
}

module.exports = Teamspeak3Connector;
