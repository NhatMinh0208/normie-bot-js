const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const yt = require('youtube-dl-exec').raw
const { MessageEmbed } = require('discord.js');
const { createReadStream } = require('fs');
var fs = require('fs');
const { AudioPlayerStatus, joinVoiceChannel, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, createAudioResource, demuxProbe, StreamType } = require('@discordjs/voice');
var search = require('youtube-search');
const ytpl = require('ytpl');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

// const { InteractionResponseType } = require('discord-api-types');

// types = str, int, num, bool, user, channel, role, mention

let subcommands = new Map();

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

let voiceData = new Map();
let serverQueue = new Map();

function nextQueue(id) {
    let q = serverQueue.get(id);
    if (q.queue.length == 0) return q.playing;
    
    let v = q.queue.shift();
    let cp = Object.assign({}, q.playing);
    
    q.queue.push(cp);
    q.playing = v;

    console.log(v);
    
    return q.playing;
}

subcommand({}, "Skip song", async function skip(interaction) {
    await interaction.deferReply();
    try {		
        let data = voiceData.get(interaction.guild.id);
        data.player.play(createAudioResource(createYTDLStream(nextQueue(interaction.guild.id).url)));
        await interaction.editReply("Skipped.")
    }
    catch {
       await interaction.editReply("Nothing to play..."); 
    }
});

subcommand({}, "Pause music.", async function pause(interaction) {
    try {
        let data = voiceData.get(interaction.guild.id);
        data.player.pause();
        await interaction.reply("Paused.");
    }
    catch {
       await interaction.reply("Nothing playing..."); 
    }
});

subcommand({}, "Unpause music.", async function unpause(interaction) {
    try {
        let data = voiceData.get(interaction.guild.id);
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
});

subcommand({}, "Show queue", async function queue(interaction) {
    let conn = getVoiceConnection(interaction.guild.id);
    if (!conn) {
        await interaction.reply("Queue empty :'(");
        return;
    }

    let q = serverQueue.get(interaction.guild.id);
    if (!q) {
        await interaction.reply("Queue empty :'(");
        return;
    }

    await interaction.deferReply();

    var s = `Currently playing: **[${q.playing.title}](${q.playing.url})** | ${q.playing.mins}:${q.playing.secs}\n\n`;
    q.queue.forEach(vid => s = s.concat(`**[${vid.title}](${vid.url})** | ${vid.mins}:${vid.secs}\n`));

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

subcommand({query: ["str", "Insert url or name of song.", 1]}, "Play music :)", async function play(interaction) {
    const query = interaction.options.getString('query');

    await interaction.deferReply();

    var channel = interaction.member.voice.channel;
    let data = voiceData.get(interaction.guild.id);
    console.log(data);
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

    var chk = false;

    if (ytdl.validateURL(query)) {
        chk = true;
        var info = await getVideoInfo(query);
        var title = info.videoDetails.title;
        var length = info.videoDetails.lengthSeconds;
        var mins = Math.floor(length / 60);
        var secs = length % 60;

        videoInfo = {
            url: query,
            title: title,
            mins: mins,
            secs: secs 
        };

        let qid = serverQueue.get(interaction.guild.id);
        if (!qid) {
            qid = {
                playing: videoInfo,
                queue: []
            };
            serverQueue.set(interaction.guild.id, qid);
        }
        else qid.queue.push(videoInfo);
    }
    else if (ytpl.validateID(query)) {
        chk = true;
        var playlist = await ytpl(query);
        for (let i = 0; i < playlist.items.length; i++) {
            let query = playlist.items[i].url;
            var info = await getVideoInfo(query);
            var title = info.videoDetails.title;
            var length = info.videoDetails.lengthSeconds;
            var mins = Math.floor(length / 60);
            var secs = length % 60;

            videoInfo = {
                url: query,
                title: title,
                mins: mins,
                secs: secs 
            };

            let qid = serverQueue.get(interaction.guild.id);
            if (!qid) {
                qid = {
                    playing: videoInfo,
                    queue: []
                };
                serverQueue.set(interaction.guild.id, qid);
            }
            else qid.queue.push(videoInfo);
        }
    }

    if (!chk) {
        await interaction.editReply("Invalid URL :'(");
        return;
    }

    if (!data.player) {
        data.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        data.player.on('error', error => {
            console.log(error);
            var stream = createYTDLStream(nextQueue(interaction.guild.id).url);
            data.player.play(createAudioResource(stream));
        });
        data.player.on(AudioPlayerStatus.Idle, () => {
            var stream = createYTDLStream(nextQueue(interaction.guild.id).url);
            data.player.play(createAudioResource(stream));
        });
        conn.subscribe(data.player);
        // setInterval(() => console.log(data), 4000);
        var stream = await createYTDLStream(serverQueue.get(interaction.guild.id).playing.url);
        data.player.play(createAudioResource(stream));
    } 

    await interaction.editReply("Playing :)");
});

subcommand({}, "Stop music :(", async function stop(interaction) {
    await interaction.reply("Hi");
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