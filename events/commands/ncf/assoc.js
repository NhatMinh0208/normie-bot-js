const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const userDB = require('../../../db/user.js');
const { getUsers, getRandomProblem, getContestSubs } = require('../../../api/cf.js');
const { setTimeout } = require('timers/promises');

const challengeDuration = 45;

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('assoc')
		.setDescription('Associate a Codeforces handle to your account.')
        .addStringOption(option => {
            option.setName('handle')
                .setDescription('The handle to associate with.')
                .setRequired(true);
            return option;
        }),
	async execute(interaction) {
        await interaction.deferReply();
        const handle = interaction.options.getString('handle');
        const info = await getUsers([handle]);
        if (info.length == 0) {
            throw new Error('Handle not found!');
        }
        else {
            await userDB.ensureUserExists(interaction.user.id);
            if (await userDB.checkHandleUsed(handle)) {
                throw new Error('Handle already associated with another user!');
            }
            else {
                const problem = await getRandomProblem();
                const message = await interaction.editReply('**Verification challange:**\nMake a submission to this problem: https://codeforces.com/contest/'
                + problem.contestId.toString() + '/problem/' + problem.index + ' within the next ' + challengeDuration.toString() + ' seconds.');
                const curTime = (new Date()).getTime();
                await setTimeout(challengeDuration * 1000);
                const subs = await getContestSubs(problem.contestId, 1, 10, handle);
                const newSubs = subs.filter((a) => {
                    console.log(a.problem.index);
                    console.log(problem.index);
                    console.log(a.creationTimeSeconds * 1000);
                    console.log(curTime);
                    console.log('A');
                    return ((a.problem.index === problem.index) && (a.creationTimeSeconds * 1000 >= curTime));
                });
                if (newSubs.length === 0) {
                    await message.reply('**Operation aborted:** Verification timed out');
                }
                else {
                    await message.reply('Verification success!');
                    await userDB.updateUserHandle(interaction.user.id, handle);
                    await message.reply('You are now associated with Codeforces handle: **' + handle + '**');
                }
            }
        }
	},
};