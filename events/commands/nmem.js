const { SlashCommandBuilder } = require('@discordjs/builders');

const fs = require('fs');
const { Collection } = require('discord.js');


const subcommands = new Collection();
const subcommandFiles = fs.readdirSync('./events/commands/nmem').filter(file => file.endsWith('.js'));

const commandData = new SlashCommandBuilder()
    .setName('nmem')
    .setDescription('Group of commands for tinkering with a memory array. Used for testing the database.');

for (const file of subcommandFiles) {
	const subcommand = require(`./nmem/${file}`);
	subcommands.set(subcommand.data.name, subcommand);
    commandData.addSubcommand(subcommand.data);
}


module.exports = {
	data: commandData,
	async execute(interaction) {
        await subcommands.get(interaction.options.getSubcommand(true)).execute(interaction);
	},
};