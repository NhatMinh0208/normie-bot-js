require('dotenv').config();
const findPingSelf = new RegExp('<@!' + process.env.CLIENT_ID + '>', 'g');


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        // console.log(message.content);
        // console.log(message.author.id);
        if (findPingSelf.test(message.content)) {
            const pingWarning = await message.channel.send('How dare you ping me, <@!' + message.author.id + '>???');
            setTimeout(() => {
                pingWarning.delete();
                message.delete();
            }, 5000);
        }
	},
};