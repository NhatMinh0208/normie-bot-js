const models = require('./models.js');

const role = models.roleSettings;

async function setFreeStatus(guildId, roleId, status) {
    await models.connect();
    const newRole = {
        $set: {
            free: status,
        },
    };
    console.log(newRole);
    await role.findOneAndUpdate({
        guildId: guildId,
        roleId: roleId,
    }, newRole, {
        upsert: true,
    });
}

async function getFreeStatus(guildId, roleId) {
    await models.connect();
    const result = await role.findOne({
        guildId: guildId,
        roleId: roleId,
    });
    if (result == null) {
        return false;
    }
    else {
        return result.free;
    }
}

async function getFreeRoleIds(guildId) {
    await models.connect();
    const result = await role.find({
        guildId: guildId,
        free: true,
    });
    // console.log('A');
    // console.log(result);
    return result.map(x => x.roleId);
}

module.exports = {
    setFreeStatus: setFreeStatus,
    getFreeStatus: getFreeStatus,
    getFreeRoleIds: getFreeRoleIds,
};