const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nserver')
		.setDescription('Replies with server info.'),
	async execute(interaction) {
        const result = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Server Info')
            .addField('Server name:', interaction.guild.name)
            .addField('Total members:', interaction.guild.memberCount.toString());
        await interaction.reply({ embeds: [result], ephemeral: false });
	},
};