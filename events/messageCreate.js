require('dotenv').config();
const findPingSelf = new RegExp('<@!' + process.env.CLIENT_ID + '>', 'g');
const findPingAny = new RegExp('^ *(<@[!&]?[0-9]+> *)+$', 'g');
const findBannedWord = new RegExp('loz|penis|dick|cock|dit', 'g');
const findPP = new RegExp('8D', 'g');
const DANK_MEMER_ID = '270904126974590976';

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        // console.log(message.content);
        // console.log(message.author.id);
        if (findPingSelf.test(message.content)) {
            const pingWarning = await message.channel.send('How dare you ping me, <@!' + message.author.id + '>???');
            setTimeout(async () => {
                if (!pingWarning.deleted) await pingWarning.delete();
                if (!message.deleted) await message.delete();
            }, 5000);
        }
        if (message.channel.name == 'summoning-circle' && (!(findPingAny.test(message.content)))) {
            console.log(message.content + 'deleted');
            if (!message.deleted) await message.delete();
        }

        if (message.author.id == DANK_MEMER_ID && message.embeds.length == 1 && findPP.test(message.embeds[0].description)) {
            console.log(message.embeds[0]);
            await message.pin();
        }

        // if (findBannedWord.test(message.content)) {
        //     try {
        //         await message.member.timeout(10 * 1000, 'saying a banned word');
        //     }
        //     catch (e) {
        //         console.log(e);
        //     }
        // }
	},
};