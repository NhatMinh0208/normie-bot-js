const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { updMemCell } = require('../../../db/ops.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('set')
		.setDescription('Set the memory cell at the location specified to the string specified.')
        .addIntegerOption(option =>
            option.setName('location')
                .setDescription('The location of the memory cell to set.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('The string to set the memory cell to.')
                .setRequired(true)),
	async execute(interaction) {
        console.log('Set recieved');
        const loc = interaction.options.get('location').value;
        const str = interaction.options.get('content').value;
        await updMemCell(loc, str);
        await interaction.reply('The string in the memory cell at the location ' + loc.toString() + ' has been set to: ' + str);
	},
};
