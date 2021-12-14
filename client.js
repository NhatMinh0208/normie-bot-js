const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [new Intents((1 << 15) - 1)] });

module.exports = {
    client: client,
};