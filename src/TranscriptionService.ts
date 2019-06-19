import * as fs from 'fs';
import {
    SpeechRecognitionResult,
    SpeechConfig,
    OutputFormat,
    AudioInputStream,
    SpeechRecognizer,
    AudioConfig,
    PullAudioInputStream,
} from 'microsoft-cognitiveservices-speech-sdk';

import { TestData } from './types';
import { MultiFilePullStream } from './MultiFilePullStream';

enum EndpointVariant {
    conversation = 'conversation',
    dictation = 'dictation',
    interactive = 'interactive'
};

export interface TranscriptionServiceConfig {
    endpointID?: string;
    serviceRegion: string;
    subscriptionKey: string;
}

// Disable telemetry data.
SpeechRecognizer.enableTelemetry(false);

export class TranscriptionService {
    private crisEndpointID: string | undefined;
    private speechConfig: SpeechConfig;
    private subscriptionKey: string;
    private serviceRegion: string;
    public resultArray: {
        data: SpeechRecognitionResult,
        transcription: string
    }[] = [];

    public constructor(transcriptionService: TranscriptionServiceConfig) {
        this.crisEndpointID = transcriptionService.endpointID;
        this.serviceRegion = transcriptionService.serviceRegion;
        this.subscriptionKey = transcriptionService.subscriptionKey;

        if (this.crisEndpointID) {
            const crisUrl = this.constructCRISURL(EndpointVariant.conversation);
            this.speechConfig = SpeechConfig.fromEndpoint(crisUrl, this.subscriptionKey);
        } else {
            this.speechConfig = SpeechConfig.fromSubscription(this.subscriptionKey, this.serviceRegion);
        }

        const recognitionLanguage = 'en-US';
        this.speechConfig.speechRecognitionLanguage = recognitionLanguage;
        this.speechConfig.outputFormat = OutputFormat.Detailed;
    }

    private createAudioConfig = (path: fs.PathLike) => {
        return AudioConfig.fromStreamInput(this.createFileStream(path))
    }

    private constructCRISURL = (endpointType: EndpointVariant) => {
        const url = `wss:${this.serviceRegion}.stt.speech.microsoft.com/speech/recognition/${endpointType}/cognitiveservices/v1?cid=${this.crisEndpointID}`;
        return new URL(url);
    }

    /**
     * @param path path to local file for speech recognition.
     */
    private createFileStream = (path: fs.PathLike) => {
        const pushStream = AudioInputStream.createPushStream();
        fs.createReadStream(path)
            .on('data', (arrayBuffer) => { pushStream.write(arrayBuffer.buffer); })
            .on('end', () => { pushStream.close(); });

        return pushStream;
    };

    private continuousRecognize = (recognizer: SpeechRecognizer) => {
        try {
            return new Promise<SpeechRecognitionResult>((resolve, reject) => {
                recognizer.recognized = (_, event) => {
                    resolve(event.result)
                    recognizer.stopContinuousRecognitionAsync(
                        () => { console.log(`Stopping recognition . . .`); },
                        (e) => { throw Error(e) }
                    );
                };
                recognizer.canceled = (_, event) => {
                    reject(event.errorDetails);
                    recognizer.stopContinuousRecognitionAsync();
                }
                recognizer.startContinuousRecognitionAsync(
                    () => { console.log(`Starting recognition . . .`); },
                    (e) => { throw Error(e) }
                );
            })
        } catch (error) {
            throw Error(error);
        }
    }

    private internalRecognizer = async (recognizer: SpeechRecognizer, stream: MultiFilePullStream, dataArray: TestData, recognizerID?: number) => {
        let currentFileIndex = 0;
        return new Promise<void>((resolve, reject) => {
            recognizer.canceled = (r, e) => {
                if (e.errorDetails !== undefined) {
                    reject(e);
                } else {
                    resolve();
                }
            };

            recognizer.recognized = (r, e) => {
                if (currentFileIndex >= dataArray.length) {
                    this.resultArray.push({
                        data: e.result, transcription: dataArray[currentFileIndex - 1].transcription
                    });
                    console.info(`Closing stream from Recognizer ${recognizerID} . . .`);
                    stream.close();
                } else {
                    // Increment file counter, pass next file to stream.
                    console.info(`New file into stream, ${currentFileIndex}/${dataArray.length}, recognizer: ${recognizerID}`);
                    this.resultArray.push({ data: e.result, transcription: dataArray[currentFileIndex - 1].transcription });
                    stream.setFile(dataArray[currentFileIndex++].recording);
                }
            };

            // Start stream.
            recognizer.startContinuousRecognitionAsync(() =>
                console.info(`Starting Recognizer ${recognizerID} . . .`), (error) => console.error(`${recognizerID} error:`, error));

            // Insert the first file into the buffer.
            stream.setFile(dataArray[currentFileIndex++].recording);
        });
    }

    public batchTranscribe = (testData: TestData, concurrentCalls: number) => {
        let piece = 0;
        if (testData.length >= concurrentCalls) {
            piece = Math.floor(testData.length / concurrentCalls);
        } else if (testData.length < concurrentCalls) {
            piece = testData.length;
            concurrentCalls = piece;
        }

        let processArray: {
            recognizer: SpeechRecognizer,
            stream: MultiFilePullStream,
            filesArray: TestData,
        }[] = [];

        for (let index = 0; index < concurrentCalls; index++) {
            if (index > testData.length - 1) {
                break;
            } else {
                const stream = new MultiFilePullStream();
                const pullStream: PullAudioInputStream = AudioInputStream.createPullStream(stream);
                const audioConfig: AudioConfig = AudioConfig.fromStreamInput(pullStream);

                processArray.push({
                    recognizer: new SpeechRecognizer(this.speechConfig, audioConfig),
                    stream, filesArray: testData.slice(0, piece)
                });
            }
        }
        return Promise.all(processArray.map(
            ({ recognizer, stream, filesArray }, index) =>
                this.internalRecognizer(recognizer, stream, filesArray, index)
        ));
    }

    public singleFiletranscribe = async (filePath: string) => {
        if (!fs.lstatSync(filePath).isFile() || filePath === undefined) {
            throw Error(`File Path provided is not a file or is undefined.`);
        }

        const audioConfig = this.createAudioConfig(filePath);
        const recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

        try {
            return await this.continuousRecognize(recognizer);
        }
        catch (error) {
            throw Error(error)
        }
        finally {
            recognizer.close();
            audioConfig.close();
            this.speechConfig.close();
        }
    }
}