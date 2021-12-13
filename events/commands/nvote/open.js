require('dotenv').config();

const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const dRegex = /^([0-9]*)d$/;
const hRegex = /^([0-9]*)h$/;
const mRegex = /^([0-9]*)m$/;
const sRegex = /^([0-9]*)s$/;

const reactions = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];
const unicodeReactions = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('open')
		.setDescription('Initiates a vote.')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration of the vote. Must be in the form (n)d/m/h/s, where n is an integer.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask in the vote.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('A string denoting the options, seperated by slashes (/). Will default to "Yes/No" if not supplied.')
                .setRequired(false)),
        async execute(interaction) {
            const duration = interaction.options.getString('duration');
            const question = interaction.options.getString('question');
            const user = interaction.user;
            console.log(interaction.user);
            let durationSecs = 0;
            let optionsString = interaction.options.getString('options');
            if (!optionsString) {
                optionsString = 'Yes/No';
            }
            const options = optionsString.split('/');
            if (options.length == 1 || options.length > 10) {
                await interaction.reply({ content: '**Argument Error:** There should not be exactly 1 or >10 options in [options]', ephemeral: true });
            }
            else if (duration.match(dRegex)) {
                durationSecs = parseInt(duration.match(dRegex)[1]) * 86400;
            }
            else if (duration.match(hRegex)) {
                durationSecs = parseInt(duration.match(hRegex)[1]) * 3600;
            }
            else if (duration.match(mRegex)) {
                durationSecs = parseInt(duration.match(mRegex)[1]) * 60;
            }
            else if (duration.match(sRegex)) {
                durationSecs = parseInt(duration.match(sRegex)[1]);
            }
            else {
                await interaction.reply({ content: '**Argument Error:** [duration] did not match required format', ephemeral: true });
            }


            const votembed = new MessageEmbed({
                author: {
                    name: 'Vote initiated by ' + user.username,
                },
                description: 'Vote closes: <t:' + Math.round((new Date()).getTime() / 1000 + durationSecs).toString() + ':R>',
                title: question,
                fields: options.map((x, id) => {
                    return {
                        name: x,
                        value: 'Vote by reacting ' + reactions[id].toString(),
                    };
                }),
                color: [0, 255, 0],
            });

            await interaction.reply({ content : '**' + user.username + '** has initiated a vote!', embeds: [votembed] });

            const message = await interaction.fetchReply();

            const filter = (reaction, us) => {
                for (const id in options) {
                    if (reaction.emoji.name == unicodeReactions[id]) return true;
                }
                return (us.id != process.env.CLIENT_ID);
            };

            message.awaitReactions({ filter, time: durationSecs * 1000 })
            .then(async (reactionManager) => {
                console.log(reactionManager);
                const resultFields = [];
                for (const id in options) {
                    const x = options[id];
                    const thisOptionUsers = await reactionManager.get(unicodeReactions[id]).users.fetch({ limit: 100 });
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
                            voterList.push(voter.username);
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
                        name: 'Result of vote initiated by ' + user.username,
                    },
                    title: question,
                    fields: resultFields,
                    color: [255, 255, 0],
                };
                // await interaction.editReply({ content : 'This vote by **' + user.username + '** has closed!', embeds: [closembed] });
                await message.channel.send({ content: 'The results of a vote are in!', embeds: [resultembed] });
            });


            for (const id in options) {
                await message.react(unicodeReactions[id]);
            }
        },
};
