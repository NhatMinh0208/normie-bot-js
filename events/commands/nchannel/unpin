const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('unpin')
		.setDescription('Unpins a message in the current channel.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the message to unpin.')
                .setRequired(true)),
	async execute(interaction) {
        const channel = interaction.channel;
        const id = interaction.options.get('id').value;
        const message = await channel.messages.fetch(id);
        await message.unpin();
        await interaction.reply('Message has been unpinned.');
	},
};