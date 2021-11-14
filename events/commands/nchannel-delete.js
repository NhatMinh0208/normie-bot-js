const { SlashCommandBuilder } = require('@discordjs/builders');

const { Permissions } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');


const waitDuration = 15;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nchannel-delete')
		.setDescription('Deletes the current text channel. Requires the permission [Manage Channels].'),
	async execute(interaction) {
        const channel = interaction.channel;
        const author = interaction.member;
        if (!author.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
            await interaction.reply({ content: '**Permissions Error:** This command requires the permission [Manage Channels], which you do not have,', ephemeral: true });
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
					.setLabel('Delete the channel :(')
					.setStyle('DANGER'),
			);
            await interaction.reply({
                content: 'Are you sure you want to delete the text channel **' + channel.name + '**? Click the button below within ' + waitDuration.toString() + ' seconds to proceed.',
                components: [row],
            });

            const filter = (i) => i.customId === 'confirm' && i.user.id === interaction.user.id;
            interaction.channel.awaitMessageComponent({ filter, time: waitDuration * 1000 })
            .then(async () => {
                await channel.delete();
            })
            .catch(async () => {
                await interaction.editReply({
                    components: [],
                });
                await interaction.followUp('Deletion of channel **' + channel.name + '** aborted due to confirmation timeout.');
            });
        }
	},
};