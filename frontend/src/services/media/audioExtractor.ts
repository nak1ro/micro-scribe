// import { FFmpeg } from "@ffmpeg/ffmpeg"; // Removed to avoid Turbopack dynamic expression error

// Define types for window global
declare global {
    interface Window {
        FFmpegWASM: {
            FFmpeg: new () => any; // Using any to avoid needing to import type just for runtime check
        };
    }
}

export class AudioExtractor {
    private static instance: AudioExtractor;
    private ffmpeg: any | null = null;
    private loadingPromise: Promise<void> | null = null;
    private extractionQueue: Promise<void> = Promise.resolve();

    private constructor() { }

    public static getInstance(): AudioExtractor {
        if (!AudioExtractor.instance) {
            AudioExtractor.instance = new AudioExtractor();
        }
        return AudioExtractor.instance;
    }

    public async load(): Promise<void> {
        if (this.ffmpeg) return;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            try {
                // Load FFmpeg implementation from UMD script in public folder
                // This bypasses Turbopack's static analysis of the ESM module
                if (!window.FFmpegWASM) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src = "/ffmpeg/ffmpeg.js";
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error("Failed to load FFmpeg script"));
                        document.body.appendChild(script);
                    });
                }

                // Instantiate FFmpeg using the loaded global
                const FFmpegClass = window.FFmpegWASM.FFmpeg;
                const ffmpeg = new FFmpegClass();

                // Use local core files from public/ffmpeg
                await ffmpeg.load({
                    coreURL: "/ffmpeg/ffmpeg-core.js",
                    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
                });

                this.ffmpeg = ffmpeg;
                this.setupLogging();
            } catch (error) {
                console.error("Failed to load FFmpeg:", error);
                throw error;
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    private setupLogging() {
        if (!this.ffmpeg) return;

        this.ffmpeg.on("log", ({ message }: { message: string }) => {
            console.debug(`[FFmpeg]: ${message}`);
        });
    }

    public async extractAudio(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        // Chain execution to ensure sequential processing
        // This prevents race conditions on the single FFmpeg instance and file system
        const result = this.extractionQueue.then(() => this._performExtraction(file, onProgress));

        // Update queue to wait for this task (catching errors so queue doesn't stall)
        this.extractionQueue = result.then(() => { }).catch(() => { });

        return result;
    }

    private async _performExtraction(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        if (!this.ffmpeg) {
            await this.load();
        }

        const ffmpeg = this.ffmpeg!;
        // Use unique filenames to be extra safe, though serial queue prevents collisions
        const id = Date.now();
        const inputName = `input_${id}` + this.getFileExtension(file.name);
        const outputName = `output_${id}.mp3`;

        try {
            // Write file to FFmpeg WASM file system
            await ffmpeg.writeFile(inputName, await this.fetchFile(file));

            // Setup progress handler
            const progressHandler = ({ progress }: { progress: number }) => {
                onProgress?.(Math.round(progress * 100));
            };
            ffmpeg.on("progress", progressHandler);

            // Run FFmpeg command:
            // -i input : Input file
            // -vn : Disable video
            // -ar 16000 : 16kHz sample rate
            // -ac 1 : Mono channel
            // -c:a libmp3lame : MP3 codec
            // -b:a 64k : 64kbps bitrate
            await ffmpeg.exec([
                "-i", inputName,
                "-vn",
                "-ar", "16000",
                "-ac", "1",
                "-c:a", "libmp3lame",
                "-b:a", "64k",
                outputName
            ]);

            // Read output file
            const data = await ffmpeg.readFile(outputName);

            // Cleanup
            ffmpeg.off("progress", progressHandler);
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            // Convert to Blob
            // Cast to any to avoid "Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'"
            return new Blob([data as any], { type: "audio/mpeg" });
        } catch (error) {
            console.error("Audio extraction failed:", error);
            // Attempt cleanup if possible
            try {
                // Check if file exists before deleting to avoid error? 
                // FFmpeg wasm might throw if file doesn't exist but try/catch block handles it.
                await ffmpeg.deleteFile(inputName);
                await ffmpeg.deleteFile(outputName);
            } catch { }
            throw error;
        }
    }

    private getFileExtension(filename: string): string {
        const match = filename.match(/\.[^/.]+$/);
        return match ? match[0] : "";
    }

    private async fetchFile(file: File): Promise<Uint8Array> {
        return new Uint8Array(await file.arrayBuffer());
    }
}

export const audioExtractor = AudioExtractor.getInstance();
