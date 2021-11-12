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
                await interaction.reply({ content: '**Error**: Unknown error', ephemeral: true });
            }
        }

        else {
            return;
        }
	},
};