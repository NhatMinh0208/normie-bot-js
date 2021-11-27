const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nrandom')
		.setDescription('Returns a random integer from 1 to [x] or from [x] to [y] if [y] is supplied.')
        .addIntegerOption(option =>
            option.setName('x')
                .setDescription('x')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('y')
                .setDescription('y')
                .setRequired(false)),
	async execute(interaction) {
        let x = interaction.options.getInteger('x');
        let y = interaction.options.getInteger('y');
        if (y == null) {
            y = x;
            x = 1;
        }
        if (x > y) {
            await interaction.reply({ content: '**Argument Error:** ' + x.toString() + ' is greater than' + y.tostring(), ephemeral: true });
        }
        else {
            const res = Math.floor(Math.random() * (y - x + 1)) + x;
            await interaction.reply('Your random number in the range from ' + x.toString() + ' to ' + y.toString() + ' is: **' + res.toString() + '**');
        }
	},
};