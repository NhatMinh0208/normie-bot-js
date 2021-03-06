const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

const ytdl = require('ytdl-core');

const serviceAccountAuth = new GoogleAuth({
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY,
    },
});


const yt = google.youtube('v3');

async function queryVideo(q) {
    if (/^https:\/\/www.youtube.com\/watch\?v=[a-zA-Z0-9-_]{11}$/g.test(q)) {
        const additionalInfo = (await ytdl.getBasicInfo(q)).videoDetails;
        console.log(additionalInfo);
        const returnObj = {
            url: q,
            thumb: additionalInfo.thumbnails.pop(),
            title: additionalInfo.title,
            author: additionalInfo.author.name,
            publishTime: (((new Date(additionalInfo.publishDate)).getTime()) / 1000).toString(),
            mins: Math.floor((additionalInfo.lengthSeconds) / 60),
            secs: (additionalInfo.lengthSeconds) % 60,
            viewCount: additionalInfo.viewCount,
        };
        return returnObj;
    }
    else {
        const result = await yt.search.list({
            part: 'id,snippet',
            maxResults: 1,
            q: q,
            auth: process.env.GAPI_KEY,
        });
        console.log(result);
        const video = result.data.items[0];
        console.log(video);
        const thumb = video.snippet.thumbnails.medium;
        console.log(thumb);
        const additionalInfo = (await ytdl.getBasicInfo('https://www.youtube.com/watch?v=' + video.id.videoId)).videoDetails;
        const publishTime = (((new Date(video.snippet.publishedAt)).getTime()) / 1000).toString();
        const returnObj = {
            url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
            thumb: thumb,
            title: video.snippet.title,
            author: video.snippet.channelTitle,
            publishTime: publishTime,
            mins: Math.floor((additionalInfo.lengthSeconds) / 60),
            secs: (additionalInfo.lengthSeconds) % 60,
            viewCount: additionalInfo.viewCount,

        };
        console.log(returnObj);
        return returnObj;
    }
}

module.exports = {
    queryVideo: queryVideo,
};
