import * as fs from 'fs';
import { PullAudioInputStreamCallback } from 'microsoft-cognitiveservices-speech-sdk';

export class MultiFilePullStream extends PullAudioInputStreamCallback {
    private currentFile!: Buffer;
    private currentOffset!: number;
    private isStreamClosed: boolean = false;

    public read = (dataBuffer: ArrayBuffer): number => {
        if (this.isStreamClosed === true) {
            console.info(`Stream is closed, returning empty buffer . . .\n`);
            return 0;
        }

        const copyArray = new Uint8Array(dataBuffer);

        if (this.currentOffset >= this.currentFile.byteLength) {

            // The file has been fully read. Send silence back.
            copyArray.fill(0);
            return dataBuffer.byteLength;
        }

        // Read the next set of bytes from the file.
        const bytesLeftInFile: number =
            this.currentFile.byteLength - this.currentOffset;
        const bytesToSend: number = Math.min(
            bytesLeftInFile,
            dataBuffer.byteLength
        );

        copyArray.set(
            new Uint8Array(
                this.currentFile.slice(
                    this.currentOffset,
                    bytesToSend + this.currentOffset
                )
            )
        );

        this.currentOffset += bytesToSend;

        return bytesToSend;
    };

    public close = (): void => {
        this.isStreamClosed = true;
    };

    public setFile = (fileName: string): void => {
        // Obtain and open the file.
        this.currentFile = fs.readFileSync(fileName);
        this.currentOffset = 0;
    };
}
