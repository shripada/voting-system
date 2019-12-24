var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class VoteStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    async addVote(vote) {
        let address = voteAddress(vote.voterId);
        let voteInfo = {};
        voteInfo.voterId = vote.voterId;
        voteInfo.partyId = vote.partyId;
        let data = Buffer.from(serialise(voteInfo));

        return await this.context.setState({ [address]: data }, this.timeout);
    }

    async voteExists(voterId) {
        const address = voteAddress(voterId);
        const voteInfo = await this.context.getState([address], this.timeout);
        const vote = voteInfo[address];
        if (Buffer.isBuffer(vote)) {
            return true;
        } else {
            return false;
        }
    }

    async getVote(voterId) {
        const address = voteAddress(voterId);
        const voteInfo = await this.context.getState([address], this.timeout);
        const vote = voteInfo[address][0];
        if (Buffer.isBuffer(vote)) {
            const json = voteInfo.toString();
            const vote = JSON.parse(json);
            return vote;
        } else {
            return false;
        }
    }
}

const voteAddress = voterId => TP_NAMESPACE + '10' + _hash(voterId).substring(0, 62);

module.exports = VoteStore;
