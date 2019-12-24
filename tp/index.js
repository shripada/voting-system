const { TransactionProcessor } = require('sawtooth-sdk/processor');
const VotingSystemHandler = require('./handler');
const transactionProcessor = new TransactionProcessor('tcp://localhost:4004');

transactionProcessor.addHandler(new VotingSystemHandler());
transactionProcessor.start();

console.log(`Welcome to Voting system`);
console.log(`Connecting to Sawtooth validator at tcp://localhost:4004`);
