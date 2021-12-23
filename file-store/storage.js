require('dotenv').config();
// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');

// For more information on ways to initialize Storage, please see
// https://googleapis.dev/nodejs/storage/latest/Storage.html

const options = {
    projectId: process.env.GCLOUD_PROJECT_ID,
    email: process.env.GCLOUD_CLIENT_EMAIL,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY,
    },
};

// console.log(options);

const storage = new Storage(options);

async function upFile(bucket, path, name, type) {
  await storage.bucket(bucket).upload(path, {
    destination: name,
    metadata: {
      contentType: type,
    },
  });
  console.log('File ' + path + 'has been uploaded to ' + name + ' in bucket ' + bucket);
}

module.exports = {
  upFile: upFile,
};

// /**
//  * TODO(developer): Uncomment these variables before running the sample.
//  */
// // The ID of your GCS bucket
// const bucketName = 'lmao-123123';

// async function createBucket() {
//   // Creates the new bucket
//   await storage.createBucket(bucketName);
//   console.log(`Bucket ${bucketName} created.`);
// }

// createBucket().catch(console.error);