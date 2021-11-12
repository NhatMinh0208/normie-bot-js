const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nhello')
		.setDescription('Replies with "Hello World!", as well as the current latency.'),
	async execute(interaction) {
        const curTime = Date.now();
        const result = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Hello World!')
            .addField('Latency (ms):', (curTime - interaction.createdTimestamp).toString());
        await interaction.reply({ embeds: [result], ephemeral: false });
	},
};