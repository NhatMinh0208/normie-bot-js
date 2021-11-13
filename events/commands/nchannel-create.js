const { SlashCommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');

const namePattern = /[a-zA-Z][a-zA-Z0-9-]*/g;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nchannel-create')
		.setDescription('Creates a new text channel. Requires the permission [Manage Channels].')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the new channel. Must contain only lowercase letters, numbers and dashes ("-").')
                .setRequired(true)),
	async execute(interaction) {
        const name = interaction.options.get('name').value;
        const author = interaction.member;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Channels], which you do not have,', ephemeral: true });
        }
        else if (!namePattern.test(name)) {
            await interaction.reply({ content: '**Argument Error:** Argument [name] does not match regex ' + namePattern.source, ephemeral: true });
        }
        else {
            const new_channel = await interaction.guild.channels.create(name, {
                type: 'GUILD_TEXT',
            });
            await new_channel.send('Channel **' + name + '** created!');
            await interaction.reply('Channel **' + name + '** created!');
        }
	},
};