const { SlashCommandBuilder } = require('@discordjs/builders');

const fs = require('fs');
const { Collection } = require('discord.js');


const subcommands = new Collection();
const subcommandFiles = fs.readdirSync('./events/commands/ninfo').filter(file => file.endsWith('.js'));

const commandData = new SlashCommandBuilder()
    .setName('ninfo')
    .setDescription('Group of commands for retrieving basic info.');

for (const file of subcommandFiles) {
	const subcommand = require(`./ninfo/${file}`);
	subcommands.set(subcommand.data.name, subcommand);
    commandData.addSubcommand(subcommand.data);
}


module.exports = {
	data: commandData,
	async execute(interaction) {
        await subcommands.get(interaction.options.getSubcommand(true)).execute(interaction);
	},
};