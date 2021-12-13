const models = require('./models.js');

const vote = models.voteInfo;

async function addVote(author, desc, option, end, message) {
    await models.connect();
    const newVote = new vote({
        author: author,
        question: desc,
        options: option,
        endTime: end,
        messageId: message,
    });
    await newVote.save();
}

async function findVoteById(message) {
    const res = await vote.findOne({
        messageId: message,
    });
    return res;
}