const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const yt = require('youtube-dl-exec').raw;
const { MessageEmbed } = require('discord.js');

const { AudioPlayerStatus, joinVoiceChannel, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, createAudioResource, demuxProbe, StreamType } = require('@discordjs/voice');

const crypto = require('crypto');

const { queryVideo } = require('../../api/google.js');

// const { InteractionResponseType } = require('discord-api-types');

// types = str, int, num, bool, user, channel, role, mention

const subcommands = new Map();

function subcommand(arguments, desc, target) {
    target.args = arguments;
    target.description = desc;
    subcommands[target.name] = target;
}
        
function createYTDLStream(url) {
    var id = crypto.randomBytes(20).toString('hex');

    if (url.indexOf('&') > -1) url = url.slice(0, url.indexOf('&'));
    
    const stream = yt(url, {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        r: '100K',
      }, { stdio: ['ignore', 'pipe', 'ignore'] })
    
    // ytdl(url, { filter: 'audioonly', format: 'mp3' }).pipe(fs.createWriteStream(`${id}.mp3`));

    return stream.stdout;
}

const voiceData = new Map();
const serverQueue = new Map();

function nextQueue(id) {
    const q = serverQueue.get(id);
    if (q.queue.length == 0) return q.playing;
    
    const v = q.queue.shift();
    const cp = Object.assign({}, q.playing);
    
    q.queue.push(cp);
    q.playing = v;

    console.log(v);
    
    return q.playing;
}

function nextQueueYeet(id) {
    const q = serverQueue.get(id);
    if (q.queue.length == 0) throw new Error('No more songs in queue.');
    
    const v = q.queue.shift();
    
    q.playing = v;

    console.log(v);
    
    return q.playing;
}

subcommand({}, "Skips the current song in the queue.", async function skip(interaction) {
    await interaction.deferReply();
    try {		
        const data = voiceData.get(interaction.guild.id);
        data.player.play(createAudioResource(createYTDLStream(nextQueue(interaction.guild.id).url)));
        await interaction.editReply("Skipped.")
    }
    catch {
       await interaction.editReply("Nothing to play..."); 
    }
});

subcommand({}, "Pauses the music.", async function pause(interaction) {
    try {
        const data = voiceData.get(interaction.guild.id);
        data.player.pause();
        await interaction.reply("Paused.");
    }
    catch {
       await interaction.reply("Nothing playing..."); 
    }
});

subcommand({}, "Unpauses the music.", async function unpause(interaction) {
    try {
        const data = voiceData.get(interaction.guild.id);
        data.player.unpause();
        await interaction.reply("Unpaused.");
    }
    catch {
       await interaction.reply("Nothing playing..."); 
    }
});

subcommand({}, "Join voice channel", async function join(interaction) {
    var channel = interaction.member.voice.channel;

    let data = voiceData.get(interaction.guild.id);
    if (!data) {
        data = {
            player: null,
            voice_channel: channel
        };
        voiceData.set(interaction.guild.id, data);
    }

    let conn = getVoiceConnection(channel.guild.id);
    if (!conn || data.voice_channel.id != channel.id) {
        conn = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }

    interaction.reply('Joined!');
});

subcommand({}, "Shows the current queue", async function queue(interaction) {
    const conn = getVoiceConnection(interaction.guild.id);
    if (!conn) {
        await interaction.reply("Queue empty :'(");
        return;
    }

    const q = serverQueue.get(interaction.guild.id);
    if (!q) {
        await interaction.reply("Queue empty :'(");
        return;
    }

    await interaction.deferReply();
    console.log(q.playing);
    var s = `Currently playing: **[${q.playing.title.replace(/\*/g, '\\*')}](${q.playing.url})** | ${q.playing.mins}:${q.playing.secs}\n\n`;
    q.queue.forEach(vid => s = s.concat(`**[${vid.title.replace(/\*/g, '\\*')}](${vid.url})** | ${vid.mins}:${vid.secs}\n`));

    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Queue")
        .setDescription(s);
    
    await interaction.editReply({ embeds: [embed] });
});

async function getVideoInfo(url) {
    return new Promise((resolve, reject) => {
        ytdl.getBasicInfo(url).then(info => {
            resolve(info);
        });
    });
}

subcommand({query: ["str", "The name or URL of the song to add.", 1]}, "Adds the given song to the queue.", async function play(interaction) {
    let query = interaction.options.getString('query');
    const videoInfo = await queryVideo(query);
    query = videoInfo.url;

    await interaction.deferReply();

    const channel = interaction.member.voice.channel;
    let data = voiceData.get(interaction.guild.id);
    console.log(data);
    if (!data) {
        data = {
            player: null,
            voice_channel: channel,
        };
        voiceData.set(interaction.guild.id, data);
    }

    let conn = getVoiceConnection(channel.guild.id);
    if (!conn || data.voice_channel.id != channel.id) {
        conn = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }


    let qid = serverQueue.get(interaction.guild.id);
    if (!qid) {
        qid = {
            playing: videoInfo,
            queue: [],
        };
        serverQueue.set(interaction.guild.id, qid);
    }
    else {
        qid.queue.push(videoInfo);
    }
    if (!data.player) {
        data.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        data.player.on('error', error => {
            console.log(error);
            let stream = createYTDLStream(nextQueue(interaction.guild.id).url);
            data.player.play(createAudioResource(stream));
        });
        data.player.on(AudioPlayerStatus.Idle, () => {
            let stream = createYTDLStream(nextQueue(interaction.guild.id).url);
            data.player.play(createAudioResource(stream));
        });
        conn.subscribe(data.player);
        // setInterval(() => console.log(data), 4000);
        let stream = await createYTDLStream(serverQueue.get(interaction.guild.id).playing.url);
        data.player.play(createAudioResource(stream));
    }
    const videoEmbed = new MessageEmbed({
        thumbnail: videoInfo.thumb,
        title: videoInfo.title,
        author: {
            name: videoInfo.author,
        },
        url: videoInfo.url,
        fields: [
            {
                name: 'Length',
                value: videoInfo.mins + ':' + videoInfo.secs,
                inline: true,
            },
            {
                name: 'Publish date',
                value: '<t:' + videoInfo.publishTime + ':D>',
                inline: true,
            },
            {
                name: 'View count',
                value: (new Intl.NumberFormat('en-US')).format(videoInfo.viewCount),
                inline: true,
            },
        ],
    });

    const replyMessage = {
        content: '**Added to queue:**',
        embeds: [videoEmbed],
    };

    console.log(replyMessage);

    await interaction.editReply(replyMessage);
});

subcommand({}, "Deletes the current song from the queue.", async function yeet(interaction) {
    await interaction.deferReply();
    try {		
        const data = voiceData.get(interaction.guild.id);
        data.player.play(createAudioResource(createYTDLStream(nextQueueYeet(interaction.guild.id).url)));
        await interaction.editReply("Skipped.")
    }
    catch {
       await interaction.editReply("Nothing to play..."); 
    }
});

// Command handler
function commandBuilder() {
    cmd = new SlashCommandBuilder();
    cmd = cmd.setName("nmusic").setDescription("Group of commands for music playback.");

    for (const commandName in subcommands) {
        const command = subcommands[commandName];
        function subcommandArgs(subcommand) {
            subcommand = subcommand.setName(commandName).setDescription(command.description);
            for (const arg in command.args) {
                const type = command.args[arg][0], desc = command.args[arg][1];
                
                let varRequired = false;
                if (command.args[arg].length > 2 && command.args[arg][2] == 1) varRequired = true;
                
                function getOption(option) {
                    option.required = varRequired;
                    return option.setName(arg).setDescription(desc);
                }

                if (type == "str") subcommand = subcommand.addStringOption(getOption);
                else if (type == "int") subcommand = subcommand.addIntegerOption(getOption);
                else if (type == "num") subcommand = subcommand.addNumberOption(getOption);
                else if (type == "bool") subcommand = subcommand.addBooleanOption(getOption);
                else if (type == "user") subcommand = subcommand.addUserOption(getOption);
                else if (type == "member") subcommand = subcommand.addMemberOption(getOption);
                else if (type == "channel") subcommand = subcommand.addChannelOption(getOption);
                else if (type == "role") subcommand = subcommand.addRoleOption(getOption);
                else if (type == "mention") subcommand = subcommand.addMentionOption(getOption);
                else console.log(`Invalid type: ${type}`);
            } 
            return subcommand;
        }          
        cmd.addSubcommand(subcommandArgs);
    }

    return cmd;
}

module.exports = {
	data: commandBuilder(),
    async execute(interaction) {
        await subcommands[interaction.options.getSubcommand()](interaction);
    },
};