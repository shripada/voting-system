var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class VoterStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    async addVoter(voter) {
        let address = voterAddress(voter.voterId);
        let voterInfo = {};
        voterInfo['voterId'] = voter.voterId;
        voterInfo.voted = voter.voted ? true : false;
        let data = Buffer.from(serialise(voterInfo));
        return await this.context.setState({ [address]: data }, this.timeout);
    }

    async voterExists(voterId) {
        var address = voterAddress(voterId);
        const votersInfo = await this.context.getState([address], this.timeout);
        const voter = votersInfo[address];
        if (Buffer.isBuffer(voter)) {
            return true;
        } else {
            return false;
        }
    }

    async getVoter(voterId) {
        var address = voterAddress(voterId);
        const votersInfo = await this.context.getState([address], this.timeout);
        const voter = votersInfo[address];
        if (Buffer.isBuffer(voter)) {
            const json = voter.toString();
            let voterObj = JSON.parse(json);
            return voterObj;
        } else {
            return undefined;
        }
    }

    async addVote(vote) {
        let address = voterAddress(vote.voterId);
        let voterInfo = {};
        voterInfo['id'] = vote.voterId;
        voterInfo.voted = true;
        voterInfo.votedTo = vote.votedTo;

        let data = Buffer.from(serialise(voterInfo));

        return await this.context.setState({ [address]: data }, this.timeout);
    }

    async hasVoted(voterId) {
        const voterInfo = await this.getVoter(voterId);
        if (voterInfo) return voterInfo.voted;
        else return false;
    }
}
const voterAddress = voterId => TP_NAMESPACE + '00' + _hash(voterId).substring(0, 62);

module.exports = VoterStore;
