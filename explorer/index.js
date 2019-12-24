//We will simply fetch contents of blockchain and display them here..
const lget = require('lodash/get');
const axios = require('axios');

const instance = axios.create({
    baseURL: 'http://localhost:8008/',
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
});

instance
    .get('/state', {
        params: {
            address: '71c0c001',
        },
    })
    .then(response => {
        let data = lget(response, 'data.data');
        console.log('\nPARTIES\n=================\n');
        for (party of data) {
            const partyData = party.data;
            const buf = Buffer.from(partyData, 'base64');
            console.log(buf.toString());
        }
    });

instance
    .get('/state', {
        params: {
            address: '71c0c000',
        },
    })
    .then(response => {
        let data = lget(response, 'data.data');
        console.log('\nVoters\n=================\n');
        for (party of data) {
            const partyData = party.data;
            const buf = Buffer.from(partyData, 'base64');
            console.log(buf.toString());
        }
    });

instance
    .get('/state', {
        params: {
            address: '71c0c010',
        },
    })
    .then(response => {
        let data = lget(response, 'data.data');
        console.log('\nVotes\n=================\n');
        for (party of data) {
            const partyData = party.data;
            const buf = Buffer.from(partyData, 'base64');
            console.log(buf.toString());
        }
    });
