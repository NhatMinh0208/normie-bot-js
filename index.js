require('dotenv').config();
const fs = require('fs');
// Require the necessary discord.js classes
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const { client } = require('./client.js');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, async (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, async (...args) => event.execute(...args));
	}
}


// For more information on ways to initialize Storage, please see
// https://googleapis.dev/nodejs/storage/latest/Storage.html

async function connectDB() {
    await require('./db/models').connect();
    console.log('Connected to DB!');
}

connectDB().catch(console.error);


async function processVotes() {
  const voteList = await require('./db/vote').getNonClosedVotes();
  for (const vote of voteList) {
    const currentTime = (new Date()).getTime();
    if (currentTime > vote.endTime) {
      require('./events/commands/nvote/close').closeVote(vote.messageId, process.env.CLIENT_ID);
    }
    else {
      setTimeout(() => {require('./events/commands/nvote/close').closeVote(vote.messageId, process.env.CLIENT_ID);}, vote.endTime - currentTime);
    }
  }
}

processVotes().catch(console.error);

// Login to Discord with your client's token
client.login(token);
