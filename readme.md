# Voting System Blockchain app using Hyperledger Sawtooth

Problem statement:
People in a constituency voting for these 3 parties: A, B, C

# Transactions involved
- Add party 
- Add Voter
- Voter votes to a party

# Business rules
- A voter can not vote more than once
- A voter who is not known to blockchain can not vote
- A voter has to vote a known party recorded in the blockchain

# Code structure
## Transaction processor
Folder [tp](/tp) contains the code of transaction processor. The file [handler.js](./tp/handler.js) contains the main transaction processing logic. 

## Client
Folder [client](./client) contains the code of the client, which is responsible to send the transaction to our blockchain app.  

## Explorer
This folder has code that demonstrates how we can query the blockchain system and get the data stored there.

# Pre requisites
- Mac/Windows/Linux with Docker. I am using a Mac with Docker for Mac installed in it. Also docker-compose orchestrator. 
- I use Visual Studio code Editor to develop/debug the solution.

# Initialising the Hyperledger Sawtooth Core
Run the following command:

Bring up the embedded terminal in VSCode and run:
```
cd /to/the/folder/that/contains/this/repo
docker-compose  -f  ./docker-compose.yml up
```

# Attaching our tp to the blockchain
Fire up another terminal, and go to the tp folder
```
cd  /path/to/tp folder
node node index.js  
```
You should see an output:

```
Welcome to Voting system
Connecting to Sawtooth validator at tcp://localhost:4004
Connected to tcp://localhost:4004
Registration of [voting_system 1.0] succeeded
```
Do not terminate the terminal window.

# Issuing transactions
## Valid transactions
### Registering a party with partyId name 'A'.
Fire up another terminal window. Go to the client folder and execute the commands as shown.

```
cd /to/client/folder
//Registering a party with name A. 
node sendRequest.js '{"action":"addParty", "partyId":"A"}'
```
Upon running the above command, you should see the following immediately:

```
{
  "link": "http://localhost:8008/batch_statuses?id=51ae3c01a5e9765a19e7ccc6192e8da82bbcc4a7d024ffed0341ba25097e8fff0011830859f2c5d86fdda4d26a4d8d3ffa5e2ef99e320bbedc7879591197de8d"
}
{
  "data": [
    {
      "id": "51ae3c01a5e9765a19e7ccc6192e8da82bbcc4a7d024ffed0341ba25097e8fff0011830859f2c5d86fdda4d26a4d8d3ffa5e2ef99e320bbedc7879591197de8d",
      "invalid_transactions": [],
      "status": "PENDING"
    }
  ],
  "link": "http://localhost:8008/batch_statuses?id=51ae3c01a5e9765a19e7ccc6192e8da82bbcc4a7d024ffed0341ba25097e8fff0011830859f2c5d86fdda4d26a4d8d3ffa5e2ef99e320bbedc7879591197de8d"
}

```
This shows that the transaction is accepted and is being processed. The blockchain nodes( validator) will process the incoming transaction by invoking the tp registered, and during the processing the status of the transaction will be in `PENDING` state

Soon after the transaction is processed and commited, you will the following:
```
{
  "data": [
    {
      "id": "51ae3c01a5e9765a19e7ccc6192e8da82bbcc4a7d024ffed0341ba25097e8fff0011830859f2c5d86fdda4d26a4d8d3ffa5e2ef99e320bbedc7879591197de8d",
      "invalid_transactions": [],
      "status": "COMMITTED"
    }
  ],
  "link": "http://localhost:8008/batch_statuses?id=51ae3c01a5e9765a19e7ccc6192e8da82bbcc4a7d024ffed0341ba25097e8fff0011830859f2c5d86fdda4d26a4d8d3ffa5e2ef99e320bbedc7879591197de8d"
}

```
Since transaction was valid as per the transaction processor, it will be committed into a block in the blockchain. You can see the status turning into 'COMMITTED'

### Registering a voter
```
node sendRequest.js '{"action":"addVoter", "voterId":"1"}'
```

### Registering a vote by a user
```
node sendRequest.js '{"action":"addVote", "partyId":"A", "voterId":"1"}'

```

## Invalid transactions
Suppose we try to add the same party again, that should be marked as an invalid transaction by tp. This operation is invalid, as the party is already registered.

```
node sendRequest.js '{"action":"addParty", "partyId":"A"}'
```
You will see the following result following a 'PENDING` status:
```
{
  "data": [
    {
      "id": "978e9a438c0e4639fc24dae9c895c2c03ddfaca778061ea5f98ff5f395fc14fa2a731024c8a47dc4c0600982d41978fd919eee1473094cb1abb1dd4c3467d298",
      "invalid_transactions": [
        {
          "id": "63836a0726e46c4c41f62474a4d95a805dd173dd0d58e2dc6c8095ca169b2dc41ed78668a98e746bb03b9de7f25321f7c15a4161549f347e8a702be9865cff7e",
          "message": "Party  A already exists!"
        }
      ],
      "status": "INVALID"
    }
  ],
  "link": "http://localhost:8008/batch_statuses?id=978e9a438c0e4639fc24dae9c895c2c03ddfaca778061ea5f98ff5f395fc14fa2a731024c8a47dc4c0600982d41978fd919eee1473094cb1abb1dd4c3467d298"
}
```
Observe that the TP has marked the transaction  as invalid. 

Feel free to experiment with the above commands with different payload and see what the TP does.

# Querying and exploring the blockchain store data written by the TP
```
cd to/folder/explorer
node index.js
```
You can see the data something like this:

```
Voters
=================

{"voted":true,"voterId":"1"}

Votes
=================

{"partyId":"A","voterId":"1"}

PARTIES
=================

{"partyId":"A","votes":1}
{"partyId":"B","votes":0}
```

