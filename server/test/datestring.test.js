const assert = require('assert');

//copied from source code: (api.route.js)
function parseDatestring(datestring, timestring) {
    timestring = timestring || "00:00:00.000";
    const rstime = /^(\d{2}:\d{2}:\d{2})(\.\d{3})?$/.exec(timestring);
    const time = rstime[1] || "00:00:00", millis = rstime[2] || '.000';
    return /^\d{4}-\d{2}-\d{2}$/.test(datestring) ? new Date(`${datestring}T${time}${millis}+01:00`) : null;
}

describe('#parseDatestring()', () => {
    it('Should parse 2018-07-03 to 2018-07-03T00:00:00.000+01:00', () => {
        const date = parseDatestring('2018-07-03');
        assert.equal(date.toISOString(), new Date('2018-07-03T00:00:00.000+01:00').toISOString());
    });
    it('Should parse 2018-07-03, 22:18:03 to 2018-07-03T22:18:03.000+01:00', () => {
        const date = parseDatestring('2018-07-03', '22:18:03');
        assert.equal(date.toISOString(), new Date('2018-07-03T22:18:03.000+01:00').toISOString());
    })
    it('Should parse 2018-07-03, 22:18:03.124 to 2018-07-03T22:18:03.124+01:00', () => {
        const date = parseDatestring('2018-07-03', '22:18:03.124');
        assert.equal(date.toISOString(), new Date('2018-07-03T22:18:03.124+01:00').toISOString());
    })
})