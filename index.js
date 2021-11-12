require('dotenv').config();
const fs = require('fs');
// Require the necessary discord.js classes

const { Client, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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

// Login to Discord with your client's token
client.login(token);