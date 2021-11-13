require('dotenv').config();
const fs = require('fs');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

let commands = [];
const commandFiles = fs.readdirSync('./events/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./events/commands/${file}`);
	commands.push(command.data);
}

commands = commands.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);