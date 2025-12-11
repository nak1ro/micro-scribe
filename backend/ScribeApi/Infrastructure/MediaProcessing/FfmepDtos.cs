namespace ScribeApi.Infrastructure.MediaProcessing;

public record FfmpegResult(
    string AudioPath,      // where the new audio file was saved in storage
    TimeSpan Duration      // duration of the audio
);