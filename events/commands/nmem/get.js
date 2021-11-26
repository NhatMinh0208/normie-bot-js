const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { getMemCell } = require('../../../db/ops.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('get')
		.setDescription('Returns the string in the memory cell at the location specified.')
        .addIntegerOption(option =>
            option.setName('location')
                .setDescription('The location of the memory cell to get.')
                .setRequired(true)),
	async execute(interaction) {
        console.log('Get recieved');
        try {
            const loc = interaction.options.get('location').value;
            const res = await getMemCell(loc);
            await interaction.reply('The string in the memory cell at the location ' + loc.toString() + ' is: ' + res);
        }
        catch (e) {
            await interaction.reply({ content: '**Runtime Error:** ' + e.message, ephemeral: true });
        }
	},
};
