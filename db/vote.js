const models = require('./models.js');

const vote = models.voteInfo;

async function addVote(author, desc, option, end, message, channel, guild) {
    await models.connect();
    const newVote = new vote({
        authorId: author,
        question: desc,
        options: option,
        endTime: end,
        closed: false,
        messageId: message,
        channelId: channel,
        guildId: guild,
    });
    await newVote.save();
}

async function findVoteById(message) {
    await models.connect();
    const res = await vote.findOne({
        messageId: message,
    });
    if (!res) throw new Error('Vote not found!');
    return res;
}

async function markClosed(message) {
    await models.connect();
    const updater = {
        $set: {
            closed: true,
        },
    };
    console.log(updater);
    await vote.findOneAndUpdate({
        messageId: message,
    }, updater);
}

async function getNonClosedVotes() {
    const res = await vote.find({
        closed: false,
    });
    return res;
}

module.exports = {
    addVote: addVote,
    findVoteById: findVoteById,
    markClosed: markClosed,
    getNonClosedVotes: getNonClosedVotes,
};