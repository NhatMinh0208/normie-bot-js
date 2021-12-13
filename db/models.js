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
  author: String,
  question: String,
  options: String,
  endTime: Number,
  messageId: String,
});

const memCell = mongoose.model('memCell', memCellSchema);
const roleSettings = mongoose.model('roleSettings', roleSettingsSchema);
const voteInfo = mongoose.model('voteInfo', voteInfoSchema);

async function connect() {
  await mongoose.connect(process.env['MONGO_URI']);
}


module.exports = {
    memCell: memCell,
    roleSettings: roleSettings,
    voteInfo: voteInfo,
    connect: connect,
};