const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const imageR = /^image\//g;
const Downloader = require('nodejs-file-downloader');
const { upFile } = require('../../../file-store/storage.js');
const { addImage } = require('../../../db/galleryImage.js');
const { rm } = require('fs/promises');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('add')
		.setDescription('Adds one or more new images to one of your galleries.')
        .addStringOption(option => {
            option.setName('name')
                .setDescription('The name of the gallery to add your image(s) to. Defaults to "default".')
                .setRequired(false);
            return option;
        }),
	async execute(interaction) {
        let name = interaction.options.getString('name');
        if (!name) name = 'default';
        await interaction.reply('To add images to the gallery **' + name + '**, reply to this message with a list of images as attachments.');
        const message = await interaction.fetchReply();
        console.log(message);
        const filter = (m) => {
            return (m.author.id === interaction.user.id && m.reference && m.reference.messageId === message.id);
        };
        const target = (await message.channel.awaitMessages({ filter, max: 1 })).at(0);
        console.log(target);
        await target.reply('Adding images...');
        const images = target.attachments.filter(a => imageR.test(a.contentType));
        // const images = target.attachments;
        console.log(images);
        await images.forEach(async (image, id) => {
            console.log(id);
            console.log(image);
            const down = new Downloader({
                url: image.url,
                directory: 'tmp/discord',
                cloneFiles: false,
                fileName: id,
            });
            await (down.download());
            await upFile('user-image-store', 'tmp/discord/' + id, id, image.contentType);
            await addImage(id, interaction.user.id, name);
            await rm('tmp/discord/' + id);
        });
        await target.reply('Images added to gallery **' + name + '** successfully.');
	},
};