const findPing = /@NormieBotJS/g;


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        console.log('User ' + message.author.username + ' sent ' + message.content);
        if (findPing.test(message.content)) {
            await message.channel.send('How dare you ping me, @' + message.author.username + '???');
        }
	},
};