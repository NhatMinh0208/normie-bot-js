require('dotenv').config();

const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { findVoteById, markClosed } = require('../../../db/vote.js');

const { client } = require('../../../client.js');


const unicodeReactions = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

async function closeVote(messageId, closerId) {
    const voteInfo = await findVoteById(messageId);
    if (voteInfo.closed) {
        throw new Error('This vote has already been closed!');
    }
    else if (closerId != voteInfo.authorId && closerId != process.env.CLIENT_ID) {
        throw new Error('You are not the author of this vote!');
    }
    else {
        const author = await client.users.fetch(voteInfo.authorId);
        const guild = await client.guilds.fetch(voteInfo.guildId);
        const channel = await guild.channels.fetch(voteInfo.channelId);
        const message = await channel.messages.fetch(voteInfo.messageId);
        const options = voteInfo.options.split('/');


        const resultFields = [];
        for (const id in options) {
            const x = options[id];
            const thisOptionUsers = await message.reactions.resolve(unicodeReactions[id]).users.fetch({ limit: 100 });
            console.log('A');
            console.log(thisOptionUsers);
            console.log(thisOptionUsers.size);
            console.log((thisOptionUsers.size - 1).toString());
            console.log('EA');
            const voterList = [];
            for (const [uid, voter] of thisOptionUsers) {
                console.log(uid);
                console.log(voter);
                if (voter.bot == false && voter.system == false) {
                    voterList.push('<@' + voter.id + '>');
                }
            }
            let voterString = voterList.join(', ');
            if (voterString == '') voterString = 'No one voted for this option!';
            const returnObj = {
                name: x + ': ' + (thisOptionUsers.size - 1).toString() + ((thisOptionUsers.size == 2) ? ' vote' : ' votes'),
                value: voterString,
            };
            resultFields.push(returnObj);
        }
        console.log(resultFields);
        const resultembed = {
            author: {
                name: 'Result of vote initiated by ' + author.username,
                iconURL: author.displayAvatarURL(),
            },
            title: voteInfo.question,
            fields: resultFields,
            color: [255, 255, 0],
        };
        // await interaction.editReply({ content : 'This vote by **' + user.username + '** has closed!', embeds: [closembed] });
        await message.reply({ content: 'A vote initiated by **<@' + author.id + '>** has closed, and the results are in!', embeds: [resultembed] });

    }
    await markClosed(messageId);
}


module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('close')
		.setDescription('Manually closes a vote.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('The id of the vote message to close.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Your request to close has been sent.');
        await closeVote(interaction.options.getString('id'), interaction.user.id);
    },

    closeVote: closeVote,
};