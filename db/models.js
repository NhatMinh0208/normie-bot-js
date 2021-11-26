const mongoose = require('mongoose');


const memCellSchema = new mongoose.Schema({
    location: Number,
    contents: String,
  });

const memCell = mongoose.model('Kitten', memCellSchema);

async function connect() {
  await mongoose.connect(process.env['MONGO_URI']);
}

module.exports = {
    memCell: memCell,
    connect: connect,
};