import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

console.log("FFmpeg:", ffmpegPath);
console.log("FFprobe:", ffprobe.path);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path);

export const getVideoDuration = (videoUrl) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoUrl, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            resolve(metadata.format.duration);
        });
    });
};