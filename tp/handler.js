const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions');
const cbor = require('cbor');
const PartyStore = require('./PartyStore');
const VoterStore = require('./VoterStore');
const VoteStore = require('./VoteStore');

var { TP_FAMILY, TP_NAMESPACE } = require('./constants');

class SimpleStoreHandler extends TransactionHandler {
    constructor() {
        super(TP_FAMILY, ['1.0'], [TP_NAMESPACE]);
    }

    handleAddPartyTransaction(context, payload) {
        const partyStore = new PartyStore(context);
        //Check if party is already present?
        return partyStore.partyExists(payload.partyId).then(exists => {
            if (exists) {
                throw new InvalidTransaction(`Party  ${payload.partyId} already exists!`);
            } else {
                return partyStore
                    .addParty(payload)
                    .then(() => {
                        console.log('success');
                    })
                    .catch(() => {
                        throw new InvalidTransaction(`Party  ${payload.partyId} could not be added!`);
                    });
            }
        });
    }

    handleAddVoterTransaction(context, payload) {
        const voterStore = new VoterStore(context);
        //Voter should have not been added already
        return voterStore.voterExists(payload.voterId).then(exists => {
            if (exists) {
                throw new InvalidTransaction(`Voter  with id: ${payload.voterId} already exists!`);
            } else {
                return voterStore.addVoter(payload).catch(() => {
                    throw new InvalidTransaction(`Voter  ${payload.voterId} could not be added!`);
                });
            }
        });
    }

    handleAddVoteTransaction(context, payload) {
        const voteStore = new VoteStore(context);
        //Voter should have not been added already
        return voteStore.voteExists(payload.voterId).then(exists => {
            if (exists) {
                throw new InvalidTransaction(`Voter  with id: ${payload.voterId} has already voted!`);
            } else {
                const voterStore = new VoterStore(context);
                return voterStore
                    .voterExists(payload.voterId)
                    .then(votererExists => {
                        if (!votererExists) {
                            throw new InvalidTransaction(
                                `Voter  ${payload.voterId}' is not in records, rejecting the vote!`
                            );
                        }
                        return voteStore
                            .addVote(payload)
                            .then(() => {
                                //Also update the vote count for the relevant party
                                const partyStore = new PartyStore(context);
                                return partyStore.addVoteToParty(payload.partyId);
                            })
                            .catch(() => {
                                throw new InvalidTransaction(`Voter  ${payload.voterId}'s vote could not be added!`);
                            });
                    })
                    .catch(error => {
                        throw new InvalidTransaction(`Voter  ${payload.voterId}'s vote could not be added!`);
                    });
            }
        });
    }

    apply(transactionProcessRequest, context) {
        let payload = cbor.decode(transactionProcessRequest.payload);
        switch (payload.action) {
            case 'addParty':
                return this.handleAddPartyTransaction(context, payload);
                break;
            case 'addVoter':
                return this.handleAddVoterTransaction(context, payload);
            case 'addVote':
                return this.handleAddVoteTransaction(context, payload);
            default:
                throw new InvalidTransaction(
                    `Action must be add voter, add party,  add vote, and not ${payload.action}`
                );
        }
    }
}

module.exports = SimpleStoreHandler;
