// Doc: https://github.com/fent/node-ytdl-core

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

var downloadFolder = './downloads'
var videosFile = 'videos.txt'

var videosCompleted = 0;
var totalVideos = 0;

function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

async function download(url) 
{
    if (!ytdl.validateURL(url)) {
        console.log("Invalid Url: " + url);
        videosCompleted++;
        await wait(3000);
        return;
    }

    try {
        var info = await ytdl.getBasicInfo(url);
    } catch {
        console.log("Failed: " + url);
        videosCompleted++;
        await wait(3000);
        return
    }

    let stream = ytdl(url, {
        quality: 'highestaudio',
        format: 'mp3',
        filter: 'audioonly'
    });
    
    let title = info.videoDetails.title;

    ffmpeg(stream)
        .audioBitrate(128)
        .save(`${downloadFolder}/${title}.mp3`)
        .on('end', () => {
            console.log('Done: ' + title);
            videosCompleted++;
        });

}

async function init() 
{
    if (!fs.existsSync(videosFile)) {
        console.log(`${videosFile} does not exist`);
        await wait(3000);
        return
    }
    
    if (!fs.existsSync(downloadFolder))
    fs.mkdirSync(downloadFolder);

    console.log("Loading...");
    
    var array = fs.readFileSync(videosFile).toString().split("\n");
    totalVideos = array.length;

    for (let link of array)
        download(link);

    while (videosCompleted < totalVideos)
        await wait(1000);

    await wait(3000);
}

init();