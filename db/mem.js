const models = require('./models.js');

const memCell = models.memCell;

async function updMemCell(loc, str) {
    await models.connect();
    const newCell = {
        $set: {
            contents: str,
        },
    };
    console.log(newCell);
    await memCell.findOneAndUpdate({
        location: loc,
    }, newCell, {
        upsert: true,
    });
}

async function getMemCell(loc) {
    await models.connect();
    const result = await memCell.findOne({
        location: loc,
    });
    if (result == null) {
        throw new Error('The memory cell at this location has not been initialized. Initialize it using the **nmem set** command.');
    }
    else {
        return result.contents;
    }
}


module.exports = {
    updMemCell : updMemCell,
    getMemCell : getMemCell,
};