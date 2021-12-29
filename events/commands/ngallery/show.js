const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const { downFile } = require('../../../file-store/storage.js');
const { getGallery } = require('../../../db/galleryImage.js');
const { rm, mkdir } = require('fs/promises');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('show')
		.setDescription('Shows the images in one of your galleries.')
        .addStringOption(option => {
            option.setName('name')
                .setDescription('The name of the gallery to show. Defaults to "default".')
                .setRequired(false);
            return option;
        }),
	async execute(interaction) {
        let name = interaction.options.getString('name');
        if (!name) name = 'default';
        await interaction.reply('Fetching your images...');
        const initial = await interaction.fetchReply();
        const gallery = await getGallery(interaction.user.id, name);
        const attachments = [];
        console.log(gallery);
        mkdir('/tmp/storage', { recursive: true }, (err) => {
          if (err) throw err;
        });
        for (const img of gallery) {
            console.log(img);
            await downFile('user-image-store', './tmp/storage/' + img.imageId + '.png', img.imageId);
            const file = (new MessageAttachment()).setFile('./tmp/storage/' + img.imageId + '.png').setName(img.imageId + '.png');
            attachments.push(file);
        }
        console.log(attachments);
        await initial.reply({ content: 'Here is gallery ' + name + ' by user ' + interaction.user.username, files: attachments });
        for (const img of gallery) {
            await rm('./tmp/storage/' + img.imageId + '.png');
        }
	},
};