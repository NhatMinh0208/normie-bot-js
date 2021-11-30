const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

const serviceAccountAuth = new GoogleAuth({
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY,
    },
});


const yt = google.youtube('v3');

async function queryVideo(q) {
    const result = await yt.search.list({
        part: 'id,snippet',
        maxResults: 1,
        q: q,
        auth: process.env.GAPI_KEY,
    });
    console.log(result.data.items);
    return 'https://www.youtube.com/watch?v=' + result.data.items[0].id.videoId;
}


module.exports = {
    queryVideo: queryVideo,
};
