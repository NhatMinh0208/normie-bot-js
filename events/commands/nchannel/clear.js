const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');


const waitDuration = 15;

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('clear')
		.setDescription('Deletes the last [num] messages in the current text channel. Requires the permission [Manage Channels].')
        .addIntegerOption(option =>
            option.setName('num')
                .setDescription('The number of messages to delete.')
                .setRequired(true)),
	async execute(interaction) {
        const num = interaction.options.get('num').value;
        const channel = interaction.channel;
        const author = interaction.member;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Channels], which you do not have,', ephemeral: true });
        }
        else if (num <= 0) {
            await interaction.reply({ content: '**Argument Error:** Argument [num] must have value greater than 0.', ephemeral: true });
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
					.setLabel('Delete the messages :(')
					.setStyle('DANGER'),
			);


            const disabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('confirm')
					.setLabel('Delete the messages :(')
					.setStyle('DANGER')
                    .setDisabled(true),
			);

            await interaction.reply({
                content: 'Are you sure you want to delete the last ' + num + ' messages? Click the button below within ' + waitDuration.toString() + ' seconds to proceed.',
                components: [row],
            });

            const filter = (i) => i.customId === 'confirm' && i.user.id === interaction.user.id;
            channel.awaitMessageComponent({ filter, time: waitDuration * 1000 })
            .then(async () => {
                await interaction.editReply({
                    components: [disabledRow],
                });
                interaction.followUp('Deleting ' + num + ' messages...');
                await channel.bulkDelete(num);
            })
            .catch(async () => {
                await interaction.editReply({
                    components: [disabledRow],
                });
                await interaction.followUp('Aborted due to confirmation timeout.');
            });
        }
	},
};