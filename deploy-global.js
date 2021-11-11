require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [
	new SlashCommandBuilder().setName('nhello').setDescription('Replies with "Hello World!", as well as the current latency.'),
	new SlashCommandBuilder().setName('nserver').setDescription('Replies with server info.'),
	new SlashCommandBuilder().setName('nuser').setDescription('Replies with user info.'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands globally.'))
	.catch(console.error);