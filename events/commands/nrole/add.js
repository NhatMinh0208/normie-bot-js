const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('add')
		.setDescription('Grants a role to a user. Requires [Manage Roles].')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to grant to the user.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to grant the role to. If none, grants the role to yourself.')
                .setRequired(false)),
	async execute(interaction) {
        let user = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const author = interaction.member;
        if (!user) user = author;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Roles], which you do not have,', ephemeral: true });
        }
        else {
            await user.roles.add(role);
            await interaction.reply('Granted the role **' + role.name + '** to user **' + user.user.username + '**.');
        }
	},
};
