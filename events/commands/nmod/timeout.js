const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


const { Permissions } = require('discord.js');

const dRegex = /^([0-9]*)d$/;
const hRegex = /^([0-9]*)h$/;
const mRegex = /^([0-9]*)m$/;
const sRegex = /^([0-9]*)s$/;

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a user for the given amount of time. User must have permission [Timeout Members].')
        .addUserOption(option => {
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true);
            return option;
        })
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The amount of time to timeout the user for. Must be in the form (n)d/m/h/s, where n is an integer.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout.')
                .setRequired(false)),
	async execute(interaction) {
        let reason = interaction.options.getString('reason');
        if (reason === null) reason = 'None';
        const author = interaction.member;
        if (!author.permissions.has([Permissions.FLAGS.TIMEOUT_MEMBERS])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Timeout Members], which you do not have,', ephemeral: true });
            return;
        }
        const member = interaction.options.getMember('user');
        const to_time = interaction.options.getString('time');
        let to_time_msecs = 0;
        if (to_time.match(dRegex)) {
            to_time_msecs = parseInt(to_time.match(dRegex)[1]) * 86400;
        }
        else if (to_time.match(hRegex)) {
            to_time_msecs = parseInt(to_time.match(hRegex)[1]) * 3600;
        }
        else if (to_time.match(mRegex)) {
            to_time_msecs = parseInt(to_time.match(mRegex)[1]) * 60;
        }
        else if (to_time.match(sRegex)) {
            to_time_msecs = parseInt(to_time.match(sRegex)[1]);
        }
        else {
            await interaction.reply({ content: '**Argument Error:** [time] did not match required format', ephemeral: true });
            return;
        }
        to_time_msecs *= 1000;

        await member.timeout(to_time_msecs, reason);
        const a = Math.round((Date.now() + to_time_msecs) / 1000);
        console.log(a);
        console.log(member);
        console.log(author);
        const embed = new MessageEmbed({
            title: 'Timeout given to ' + member.user.username,
            author: {
                name: 'Moderation action taken by ' + author.user.username,
            },
            fields: [
                {
                    name: 'Reason',
                    value: reason,
                    inline: false,
                },
                {
                    name: 'Length',
                    value: to_time,
                    inline: false,
                },
                {
                    name: 'Expires',
                    value: '<t:' + a.toString() + ':R>',
                    inline: false,
                },
            ],
        });

        await interaction.reply({ content: '<@' + member.id + '> has been timed out!', embeds: [embed], ephemeral: false });
        return;
    },
};