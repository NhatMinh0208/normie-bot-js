const models = require('./models.js');

const Image = models.galleryImage;

async function addImage(id, uid, name) {
    await models.connect();
    const newImage = new Image({
        imageId: id,
        userId: uid,
        galName: name,
    });
    await newImage.save();
}

async function getGallery(uid, name) {
    await models.connect();
    const result = await Image.find({
        userId: uid,
        galName: name,
    });
    return result;
}

module.exports = {
    addImage: addImage,
    getGallery: getGallery,
};