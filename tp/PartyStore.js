var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class PartyStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    async addVoteToParty(partyId) {
        let party = await this.getParty(partyId);
        party.votes += 1;
        return await this.addParty(party);
    }

    async addParty(party) {
        const address = partyAddress(party.partyId);
        let partyInfo = { partyId: party.partyId, votes: party.votes ? party.votes : 0 };
        let serialised = serialise(partyInfo);
        console.log(serialised);
        let data = Buffer.from(serialised);
        return await this.context.setState({ [address]: data }, this.timeout);
    }

    async partyExists(partyId) {
        const address = partyAddress(partyId);
        let partyInfo = await this.context.getState([address], this.timeout);
        const party = partyInfo[address][0];
        if (party == undefined || party == null) {
            return false;
        } else {
            return true;
        }
    }

    async getParty(partyId) {
        const address = partyAddress(partyId);
        let partyInfo = await this.context.getState([address], this.timeout);
        const partyData = partyInfo[address];
        if (Buffer.isBuffer(partyData)) {
            const json = partyData.toString();
            const party = JSON.parse(json);
            return party;
        } else {
            return undefined;
        }
    }
}

const partyAddress = partyId => TP_NAMESPACE + '01' + _hash(partyId).substring(0, 62);

module.exports = PartyStore;
