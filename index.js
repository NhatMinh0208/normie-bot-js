require('dotenv').config();
// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
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
        const curTime = Date.now();
        const result = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Hello World!')
            .addField('Latency (ms):', (curTime - interaction.createdTimestamp).toString());
        await interaction.reply({ embeds: [result], ephemeral: false });
    }
    else if (commandName === 'nserver') {
        const result = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Server Info')
            .addfield('Server name:', interaction.guild.name)
            .addfield('Total members:', interaction.guild.memberCount.toString());
        await interaction.reply({ embeds: [result], ephemeral: false });
    }
    else if (commandName === 'nuser') {
        const result = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('User Info')
            .addfield('Your tag:', interaction.user.tag)
            .addfield('Your ID:', interaction.user.id);
        await interaction.reply({ embeds: [result], ephemeral: false });
    }
});

// Login to Discord with your client's token
client.login(token);