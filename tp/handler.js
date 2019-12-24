const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const cbor = require('cbor');
const PartyStore = require('./PartyStore');
const VoterStore = require('./VoterStore');
const VoteStore = require('./VoteStore');

var { TP_FAMILY, TP_NAMESPACE } = require('./constants');

class VotingSystemHandler extends TransactionHandler {
    constructor() {
        super(TP_FAMILY, ['1.0'], [TP_NAMESPACE]);
    }

    async handleAddPartyTransaction(context, payload) {
        const partyStore = new PartyStore(context);
        const partyExists = await partyStore.partyExists(payload.partyId);
        if (partyExists) {
            throw new InvalidTransaction(`Party  ${payload.partyId} already exists!`);
        } else {
            return await partyStore.addParty(payload);
        }
    }

    async handleAddVoterTransaction(context, payload) {
        const voterStore = new VoterStore(context);
        const voterExists = await voterStore.voterExists(payload.voterId);
        if (voterExists) {
            throw new InvalidTransaction(`Voter  with id: ${payload.voterId} already exists!`);
        } else {
            return await voterStore.addVoter(payload);
        }
    }

    async handleAddVoteTransaction(context, payload) {
        const voteStore = new VoteStore(context);

        const voteExists = await voteStore.voteExists(payload.voterId);
        if (voteExists) {
            throw new InvalidTransaction(`Voter  with id: ${payload.voterId} has already voted!`);
        } else {
            const voterStore = new VoterStore(context);
            const voterExists = await voterStore.voterExists(payload.voterId);
            if (!voterExists) {
                throw new InvalidTransaction(`Voter  ${payload.voterId}' is not in records, rejecting the vote!`);
            }

            await voteStore.addVote(payload);
            const partyStore = new PartyStore(context);
            const partyExists = await partyStore.partyExists(payload.partyId);
            if (!partyExists) {
                throw new InvalidTransaction(`Party  ${payload.partyId}' is not in records, rejecting the vote!`);
            }
            await partyStore.addVoteToParty(payload.partyId);
            return await voterStore.addVoter({ voterId: payload.voterId, voted: true });
        }
    }

    async apply(transactionProcessRequest, context) {
        let payload = cbor.decode(transactionProcessRequest.payload);
        switch (payload.action) {
            case 'addParty':
                return await this.handleAddPartyTransaction(context, payload);
            case 'addVoter':
                return await this.handleAddVoterTransaction(context, payload);
            case 'addVote':
                return await this.handleAddVoteTransaction(context, payload);
            default:
                throw new InvalidTransaction(
                    `Action must be add voter, add party,  add vote, and not ${payload.action}`
                );
        }
    }
}

module.exports = VotingSystemHandler;
