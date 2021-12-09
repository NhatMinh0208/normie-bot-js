const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('remove')
		.setDescription('Removes a role from a user. Requires [Manage Roles].')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to remove from the user.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove the role from. If none, removes the role from yourself.')
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
                await user.roles.remove(role);
                await interaction.reply('Removed the role **' + role.name + '** from user **' + user.user.username + '**.');
            }
        },
};
