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

const memCell = mongoose.model('memCell', memCellSchema);
const roleSettings = mongoose.model('roleSettings', roleSettingsSchema);

async function connect() {
  await mongoose.connect(process.env['MONGO_URI']);
}


module.exports = {
    memCell: memCell,
    roleSettings: roleSettings,
    connect: connect,
};