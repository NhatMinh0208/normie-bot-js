const axios = require('axios').default;

async function getUsers(handles) {
    const handleString = handles.join(';');
    const path = 'https://codeforces.com/api/user.info?handles=' + handleString;

    const result = (await axios.get(path)).data.result;
    return result;
    // console.log(result);
}

module.exports = {
    getUsers: getUsers,
};