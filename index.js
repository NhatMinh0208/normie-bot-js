require('dotenv').config();
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'nhello') {
        await interaction.reply('Hello world!');
    }
    else if (commandName === 'nserver') {
        await interaction.reply('Server info.');
    }
    else if (commandName === 'nuser') {
        await interaction.reply('User info.');
    }
});

// Login to Discord with your client's token
client.login(token);