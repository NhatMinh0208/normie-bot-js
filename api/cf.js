const axios = require('axios').default;

async function getUsers(handles) {
    try {
        const handleString = handles.join(';');
        const path = 'https://codeforces.com/api/user.info?handles=' + handleString;
        const result = (await axios.get(path)).data.result;
        return result;
    }
    catch (e) {
        console.error(e);
        return [];
    }
    // console.log(result);
}

async function getAllProblems() {
    const path = 'https://codeforces.com/api/problemset.problems?';
    const result = (await axios.get(path)).data.result.problems;
    return result;
}

async function getRandomProblem() {
    const problems = await getAllProblems();
    const index = Math.floor(Math.random() * problems.length);
    return problems[index];
}

async function getContestSubs(contestId, from = 1, count = 1, handle = '') {
    const path = 'https://codeforces.com/api/contest.status?contestId=' + contestId.toString() + '&from=' + from.toString()
    + '&count=' + count.toString()
    + ((handle === '') ? '' : ('&handle=' + handle))
    ;
    console.log(path);
    const result = (await axios.get(path)).data.result;
    console.log(result);
    return result;
}

module.exports = {
    getUsers: getUsers,
    getRandomProblem: getRandomProblem,
    getContestSubs: getContestSubs,
};