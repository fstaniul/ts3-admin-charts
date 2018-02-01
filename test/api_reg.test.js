const rauth = require('request-promise').defaults({json: true, baseUrl: 'http://localhost:3000'});
const rapi = require('request-promise').defaults({json: true, baseUrl: 'http://localhost:3000/api'});

function authenticateAsUser () {
    return rauth.post('/auth', {
        body: {username: "user", password: "password"}
    })
    .then(data => data.token);
}

function authenticateAsAdmin () {
    return rauth.post('/auth', {
        body: {username: "user", password: "administrator_password_1234"}
    })
    .then(data => data.token);
}

describe('/auth', () => {
    it('Authenticates user properly! Test data is user:password', (done) => {
        rauth.post('/auth', {
            body: {
                username: "user",
                password: "password"
            }
        }).then(res => {
            done();
        })
        .catch(err => done(err));
    });
});

describe('/api/reg/:id', () => {
    it('Returns users registered by administrator with id 42230 from 2018-01-25 to 2018-01-30', done => {
        const id = 42230, from = '2018-01-25', to = '2018-01-30';
        const dateFrom = new Date(2018, 0, 25), dateTo = new Date(2018, 0, 30);
        authenticateAsUser().then(token => {
            const url = `/reg/${id}?from=${from}&to=${to}`;
            rapi.get(url, {headers: {'Authorization': token}})
                .then(data => {
                    // console.log(data);
                    if (data.length == 0) throw new Error('Registered clients not found! It should return a lot of data!');
                    const invalidDates = data.map(client => client.registrationDate).filter(date => date > dateTo || date < dateFrom);
                    if (invalidDates.length > 0) throw new Error('Returned dates are not in the requested range! ' + url);
                    else done();
                })
                .catch(err => done(err));
        })
    })
})

