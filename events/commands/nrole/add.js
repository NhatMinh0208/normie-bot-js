const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');

const { getFreeStatus } = require('../../../db/role.js');

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
        const guildId = interaction.guildId;
        if (!user) user = author;
        if (user.id != author.id) {
            if (!author.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
                await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Roles], which you do not have,', ephemeral: true });
            }
            else {
                await user.roles.add(role);
                await interaction.reply('Granted the role **' + role.name + '** to user **' + user.user.username + '**.');
            }
        }
        else {
            await interaction.deferReply();
            const freeStatus = await getFreeStatus(guildId, role.id);
            console.log(freeStatus);
            if (!author.permissions.has([Permissions.FLAGS.MANAGE_ROLES]) && !freeStatus) {
                await interaction.editReply('**Permissions Error:** This command requires either the permission [Manage Roles] or that the role is free, neither of which was satisfied.');
            }
            else {
                await user.roles.add(role);
                await interaction.editReply('Granted the role **' + role.name + '** to user **' + user.user.username + '**.');
            }
        }
	},
};
