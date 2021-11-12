const findPing = /<@!908363889492783104>/g;


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        // console.log(message.content);
        // console.log(message.author.id);
        if (findPing.test(message.content)) {
            await message.channel.send('How dare you ping me, <@!' + message.author.id + '>???');
        }
	},
};