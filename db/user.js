const models = require('./models.js');

const User = models.userAssoc;

async function addNewUser(id) {
    await models.connect();
    const newUser = new User({
        id: id,
        cfHandle: null,
    });
    await newUser.save();
}

async function ensureUserExists(id) {
    await models.connect();
    const user = await User.findOne({
        id: id,
    });
    if (user.length === 0) {
        await addNewUser(id);
    }
}

async function checkHandleUsed(handle) {
    await models.connect();
    const user = await User.findOne({
        handle: handle,
    });
    return (user.handle === 1);
}

async function updateUserHandle(id, handle) {
    await models.connect();
    await User.findOneAndUpdate({
        id: id,
    }, {
        handle: handle,
    });
}

module.exports = {
    ensureUserExists: ensureUserExists,
    checkHandleUsed: checkHandleUsed,
    updateUserHandle: updateUserHandle,
};