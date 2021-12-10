const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

require('dotenv').config();

const { getFreeStatus } = require('../../../db/role.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('createsub')
		.setDescription('Creates a message where users can self-grant a role. Requires the role to be free.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to grant to operate on.')
                .setRequired(true)),
	async execute(interaction) {
        const role = interaction.options.getRole('role');
        const guildId = interaction.guildId;
        const guildName = interaction.guild.name;
        const guild = interaction.guild;
        if (!(await getFreeStatus(guildId, role.id))) {
            await interaction.reply({ content: '**Argument Error:** The argument [role] is not set as a free role.', ephemeral: true });
        }
        else {
            const message = await interaction.reply({ content: 'Subscribe to the role **' + role.name + '** by reacting with :thumbsup: below!\
\nUnsubscribe by un-reacting.\
\nThis subscription message is valid for a day.', fetchReply: true });
            console.log(message);
            await message.react('👍');
            const filter = (reaction, user) => {
                return reaction.emoji.name == '👍' && user.id != process.env.CLIENT_ID;
            };
            const collector = message.createReactionCollector({ filter: filter, time : 86400 * 1000, dispose: true });

            collector.on('collect', async (reaction, user) => {
                console.log('collect Argument: user');
                console.log(user);
                const member = await guild.members.fetch({ user, force: true });
                await member.roles.add(role);
                await user.send('You have subscribed to the role **' + role.name + '** in server **' + guildName + '**');
            });
            collector.on('remove', async (reaction, user) => {
                console.log('remove Argument: user');
                console.log(user);
                const member = await guild.members.fetch({ user, force: true });
                await member.roles.remove(role);
                await user.send('You have unsubscribed from the role **' + role.name + '** in server **' + guildName + '**');
            });
        }
	},
};
