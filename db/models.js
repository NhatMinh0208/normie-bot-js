const mongoose = require('mongoose');


const memCellSchema = new mongoose.Schema({
    location: Number,
    contents: String,
  });

const roleSettingsSchema = new mongoose.Schema({
  guildId: String,
  roleId: String,
  free: Boolean,
});

const voteInfoSchema = new mongoose.Schema({
  authorId: String,
  question: String,
  options: String,
  endTime: Number,
  closed: Boolean,
  messageId: String,
  channelId: String,
  guildId: String,
});

const userAssocSchema = new mongoose.Schema({
  id: String,
  cfHandle: String,
});

const memCell = mongoose.model('memCell', memCellSchema);
const roleSettings = mongoose.model('roleSettings', roleSettingsSchema);
const voteInfo = mongoose.model('voteInfo', voteInfoSchema);
const userAssoc = mongoose.model('userAssoc', userAssocSchema);

async function connect() {
  await mongoose.connect(process.env['MONGO_URI']);
}


module.exports = {
    memCell: memCell,
    roleSettings: roleSettings,
    voteInfo: voteInfo,
    connect: connect,
    userAssoc: userAssoc,
};