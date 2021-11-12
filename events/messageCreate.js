const findPing = /@NormieBotJS/g;


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        if (findPing.test(message.content)) {
            await message.channel.send('How dare you ping me, @' + message.author.username + '???');
        }
	},
};