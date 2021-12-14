require('dotenv').config();
const fs = require('fs');
// Require the necessary discord.js classes

const { Storage } = require('@google-cloud/storage');
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const { client } = require('./client.js');

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, async (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, async (...args) => event.execute(...args));
	}
}

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

const storage = new Storage(options);

async function listBuckets() {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
    buckets.forEach(bucket => {
      console.log(bucket.name);
    });
  }

listBuckets().catch(console.error);

// Login to Discord with your client's token
client.login(token);
