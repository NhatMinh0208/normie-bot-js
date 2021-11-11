const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuser')
		.setDescription('Replies with user info.'),
	async execute(interaction) {
        const result = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('User Info')
            .addField('Your tag:', interaction.user.tag)
            .addField('Your ID:', interaction.user.id);
        await interaction.reply({ embeds: [result], ephemeral: false });
	},
};