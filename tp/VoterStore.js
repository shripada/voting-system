var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class VoterStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    addVoter(voter) {
        let address = voterAddress(voter.voterId);
        let stateEntriesToSend = {};
        let voterInfo = {};
        voterInfo['voterId'] = voter.voterId;
        voterInfo.voted = false;
        let data = Buffer.from(serialise(voterInfo));

        return this.context
            .setState({ [address]: data }, this.timeout)
            .then(() => {
                console.log('Successfully added voter info:', voter);
            })
            .catch(error => console.log('error:', error));
    }

    voterExists(voterId) {
        var address = voterAddress(voterId);
        return this.context
            .getState([address], this.timeout)
            .then(votersInfo => {
                const voter = votersInfo[address];
                if (Buffer.isBuffer(voter)) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(error => {
                return false;
            });
    }

    getVoter(voterId) {
        var address = voterAddress(voterId);
        return this.context.getState([address], this.timeout).then(function(votersInfo) {
            const voter = votersInfo[address];
            if (Buffer.isBuffer(voter)) {
                const json = voter.toString();
                voterObj = JSON.parse(json);
                return voterObj;
            } else {
                return undefined;
            }
        });
    }

    addVote(vote) {
        let address = voterAddress(vote.voterId);
        let stateEntriesToSend = {};
        let voterInfo = {};
        voterInfo['id'] = vote.voterId;
        voterInfo.voted = true;
        voterInfo.votedTo = vote.votedTo;

        let data = Buffer.from(serialise(voterInfo));

        return this.context
            .setState({ [address]: data }, this.timeout)
            .then(() => {
                console.log('Successfully added voter info:', voter);
            })
            .catch(error => console.log('error:', error));
    }

    hasVoted(voterId) {
        return this.getVoter(voterId).then(voterInfo => {
            if (voterInfo) return voterInfo.voted;
            else return false;
        });
    }
}
const voterAddress = voterId => TP_NAMESPACE + '00' + _hash(voterId).substring(0, 62);

module.exports = VoterStore;
