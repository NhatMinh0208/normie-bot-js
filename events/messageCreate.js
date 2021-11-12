require('dotenv').config();
const findPingSelf = new RegExp('<@!' + process.env.CLIENT_ID + '>', 'g');
const findPingAny = new RegExp('(<@![0-9]+> *)+', 'g');


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        // console.log(message.content);
        // console.log(message.author.id);
        if (findPingSelf.test(message.content)) {
            const pingWarning = await message.channel.send('How dare you ping me, <@!' + message.author.id + '>???');
            setTimeout(async () => {
                await pingWarning.delete();
                await message.delete();
            }, 5000);
        }
        if (message.channel.name == 'summoning-circle' && (!(findPingAny.test(message.content)))) {
            console.log(message.content + 'deleted');
            await message.delete();
        }
	},
};