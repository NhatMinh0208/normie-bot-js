const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getUsers } = require('../../../api/cf.js');
const { ensureUserExists, getUserInfo } = require('../../../db/user.js');
const colors = {
    'newbie': '#BCBCBC',
    'pupil': '#6EFF54',
    'specialist': '#61DA96',
    'expert': '#7F8BEA',
    'candidate master': '#E479F0',
    'master': '#FEC97C',
    'international master': '#FF9700',
    'grandmaster': '#FF7D7D',
    'international grandmaster': '#FD2121',
    'legendary grandmaster': '#8C0000',
};

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('user')
		.setDescription('Replies with info of a Codeforces user.')
        .addStringOption(option => {
            option.setName('handle')
                .setDescription('The handle of the user to retrieve info from.')
                .setRequired(false);
            return option;
        })
        .addUserOption(option => {
            option.setName('user')
                .setDescription('Uses the handle associated with the given user.')
                .setRequired(false);
            return option;
        }),
	async execute(interaction) {
        await interaction.deferReply();
        let handle = interaction.options.getString('handle');
        const member = interaction.options.getUser('user');
        if (handle === null && member === null) {
            await interaction.editReply('**Argument Error:** Exactly one of [handle] or [user] should be present.');
            return;
        }
        if (handle !== null && member !== null) {
            await interaction.editReply('**Argument Error:** Exactly one of [handle] or [user] should be present.');
            return;
        }
        if (handle === null) {
            // console.log(member);
            ensureUserExists(member.id);
            const userInfo = await getUserInfo(member.id);
            // console.log(userInfo);
            if (userInfo.cfHandle === null) {
                await interaction.editReply('**Argument Error:** [user] (' + member.username
                + ') has not associated a handle yet. You can associate a handle with /ncf assoc.');
                return;
            }
            else {
                handle = userInfo.cfHandle;
            }
        }
        // console.log(handle);
        const result = await getUsers([handle]);
        const info = result[0];
        // console.log(info);
        const embed = new MessageEmbed({
            color: colors[info.rank],
            author: {
                name: info.rank,
            },
            title: info.handle,
            thumbnail: {
                url: info.titlePhoto,
            },
            fields: [
                {
                    name: 'Real name',
                    value: info.firstName + ' ' + info.lastName,
                },
                {
                    name: 'Rating',
                    value: info.rating.toString(),
                    inline: true,
                },
                {
                    name: 'Contribution',
                    value: info.contribution.toString(),
                    inline: true,
                },
                {
                    name: 'Registered',
                    value: '<t:' + info.registrationTimeSeconds.toString() + ':R>',
                },
                {
                    name: 'Last online',
                    value: '<t:' + info.lastOnlineTimeSeconds.toString() + ':R>',
                    inline: true,
                },
            ],
        });
        await interaction.editReply({ content: 'Done!', embeds: [embed] });
	},
};