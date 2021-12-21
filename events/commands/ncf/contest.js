const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getUpcomingContests } = require('../../../api/cf.js');


module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('contest')
		.setDescription('Replies with a list of running and upcoming contests on Codeforces.'),
	async execute(interaction) {
        await interaction.deferReply();
        const contests = await getUpcomingContests();
        const fields = contests.map((a) => {
            const field = {
                name: a.name,
                value: ((a.phase === 'BEFORE') ? ('Starts <t:' + a.startTimeSeconds.toString() + ':R>') : ('Ends: <t:' + (a.startTimeSeconds + a.durationSeconds).toString() + ':R>'))
                + ' | [Link](https://codeforces.com/contest/' + a.id + ')',
                inline: false,
            };
            return field;
        });

        const embed = new MessageEmbed({
            title: 'Running and upcoming contests:',
            fields: fields,
        });

        await interaction.editReply({ content: 'Done', embeds: [embed] });
	},
};