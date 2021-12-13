require('dotenv').config();

const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('close')
		.setDescription('Manually closes a vote.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The id of the vote message')
                .setRequired(true)),
        async execute(interaction) {
    }
};