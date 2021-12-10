const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { getFreeRoleIds } = require('../../../db/role.js');

module.exports = {
	data: new SlashCommandSubcommandBuilder()
		.setName('listfree')
		.setDescription('Lists the currently free roles in this server.'),
	async execute(interaction) {
        const guild = interaction.guild;
        await interaction.deferReply();
        const ids = await getFreeRoleIds(guild.id);
        const names = [];
        // console.log('B');
        // console.log(ids);
        for (let el in ids) {
            // console.log(ids[el]);
            const role = await guild.roles.fetch(ids[el]);
            // console.log(role);
            if (role) names.push('\n**' + role.name + '**');
        }
        await interaction.editReply('Currently free roles on this server:' + names.join(''));
	},
};
