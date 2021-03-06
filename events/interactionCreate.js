const fs = require('fs');
const { Collection } = require('discord.js');


const commands = new Collection();
const commandFiles = fs.readdirSync('./events/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	commands.set(command.data.name, command);
}

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (interaction.isCommand()) {
            const command = commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied) {
                    await interaction.followUp({ content: '**Runtime Error**: ' + error.message, ephemeral: false });
                }
                else if (interaction.deferred) {
                    await interaction.editReply({ content: '**Runtime Error**: ' + error.message, ephemeral: true });
                }
                else {
                    await interaction.reply({ content: '**Runtime Error**: ' + error.message, ephemeral: true });
                }
            }
        }
        else {
            return;
        }
	},
};