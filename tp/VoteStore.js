var { _hash } = require('./lib');
var { TP_NAMESPACE } = require('./constants');
var serialise = require('./serialiser');

class VoteStore {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    addVote(vote) {
        let address = voteAddress(vote.voterId);
        let data = Buffer.from(serialise(vote));

        return this.context
            .setState({ [address]: data }, this.timeout)
            .then(() => {
                console.log('Successfully added vote info:', vote);
            })
            .catch(error => console.log('error:', error));
    }

    voteExists(voterId) {
        var address = voteAddress(voterId);
        return this.context.getState([address], this.timeout).then(function(voteInfo) {
            const vote = voteInfo[address];
            if (Buffer.isBuffer(vote)) {
                return true;
            } else {
                return false;
            }
        });
    }

    getVote(voterId) {
        var address = voteAddress(voterId);
        return this.context.getState([address], this.timeout).then(function(voteInfo) {
            const vote = voteInfo[address][0];
            if (Buffer.isBuffer(vote)) {
                const json = voteInfo.toString();
                const vote = JSON.parse(json);
                return vote;
            } else {
                return false;
            }
        });
    }
}

const voteAddress = voterId => TP_NAMESPACE + '10' + _hash(voterId).substring(0, 62);

module.exports = VoteStore;
