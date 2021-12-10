const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');

const { setFreeStatus } = require('../../../db/role.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('setfree')
		.setDescription('Changes the free status of a role. Requires [Manage Roles].')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to operate on.')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('newstatus')
                .setDescription('Whether the role is now a free role or not.')
                .setRequired(true)),
	async execute(interaction) {
        const role = interaction.options.getRole('role');
        const newStatus = interaction.options.getBoolean('newstatus');
        const author = interaction.member;
        const guildId = interaction.guildId;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Roles], which you do not have,', ephemeral: true });
        }
        else {
            await interaction.deferReply();
            await setFreeStatus(guildId, role.id, newStatus);
            await interaction.editReply('Changed the free status of role **' + role.name + '**.');
        }
	},
};
