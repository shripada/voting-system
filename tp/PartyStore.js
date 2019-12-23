var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class PartyStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    addVoteToParty(partyId) {
        return this.getParty(partyId)
            .then(party => {
                party.votes += 1;
                return this.addParty(party);
            })
            .catch(() => {
                console.log('Failed to add ${vote} to ${partyId}');
            });
    }

    addParty(party) {
        let address = partyAddress(party.partyId);
        let partyInfo = { partyId: party.partyId, votes: party.votes ? party.votes : 0 };
        let serialised = serialise(partyInfo);
        console.log(serialised);
        let data = Buffer.from(serialised);

        return this.context
            .setState({ [address]: data }, this.timeout)
            .then(() => {
                console.log('Successfully added party info:', party);
            })
            .catch(error => console.log('error:', error));
    }

    partyExists(partyId) {
        var address = partyAddress(partyId);
        return this.context.getState([address], this.timeout).then(function(partyInfo) {
            const party = partyInfo[address][0];
            if (party == undefined || party == null) {
                return false;
            } else {
                return true;
            }
        });
    }

    getParty(partyId) {
        var address = partyAddress(partyId);
        return this.context
            .getState([address], this.timeout)
            .then(function(partyInfo) {
                const partyData = partyInfo[address];
                if (Buffer.isBuffer(partyData)) {
                    const json = partyData.toString();
                    const party = JSON.parse(json);
                    return party;
                } else {
                    return undefined;
                }
            })
            .catch(error => {
                return undefined;
            });
    }
}

const partyAddress = partyId => TP_NAMESPACE + '01' + _hash(partyId).substring(0, 62);

module.exports = PartyStore;
