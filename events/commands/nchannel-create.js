const { SlashCommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

const namePattern = /[a-zA-Z][a-zA-Z0-9-]*/g;

const waitDuration = 15;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nchannel-create')
		.setDescription('Creates a new text channel. Requires the permission [Manage Channels].')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the new channel. Must contain only lowercase letters, numbers and dashes ("-").')
                .setRequired(true)),
	async execute(interaction) {
        const name = interaction.options.get('name').value;
        const author = interaction.member;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Channels], which you do not have,', ephemeral: true });
        }
        else if (!namePattern.test(name)) {
            await interaction.reply({ content: '**Argument Error:** Argument [name] does not match regex ' + namePattern.source, ephemeral: true });
        }
        else {
            // const new_channel = await interaction.guild.channels.create(name, {
            //     type: 'GUILD_TEXT',
            // });
            // await new_channel.send('Channel **' + name + '** created!');
            // await interaction.reply('Channel **' + name + '** created!');
            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('confirm')
					.setLabel('Yes, create the channel!')
					.setStyle('PRIMARY'),
			);
            await interaction.reply({
                content: 'Are you sure you want to create the text channel **' + name + '**? Click the button below within ' + waitDuration.toString() + ' seconds to proceed.',
                components: [row],
            });

            const filter = (i) => i.customId === 'confirm' && i.user.id === interaction.user.id;
            interaction.channel.awaitMessageComponent({ filter, time: waitDuration * 1000 })
            .then(async (i) => {
                const new_channel = await interaction.guild.channels.create(name, {
                    type: 'GUILD_TEXT',
                });
                await interaction.editReply({
                    content: 'Are you sure you want to create the text channel **' + name + '**? Click the button below within ' + waitDuration.toString() + ' seconds to proceed.',
                    components: [],
                });
                await new_channel.send('Channel **' + name + '** created!');
                await i.reply('Channel **' + name + '** created!');
            })
            .catch(async () => {
                await interaction.editReply({
                    content: 'Are you sure you want to create the text channel **' + name + '**? Click the button below within ' + waitDuration.toString() + ' seconds to proceed.',
                    components: [],
                });
                await interaction.followUp('Creation of channel **' + name + '** aborted due to confirmation timeout.');
            });
        }
	},
};