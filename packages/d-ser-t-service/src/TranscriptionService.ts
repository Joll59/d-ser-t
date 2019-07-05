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

import { MultiFilePullStream } from './MultiFilePullStream';
import { TestData, TestDatum, TranscriptionServiceConfig } from './types';

enum EndpointVariant {
    conversation = 'conversation',
    dictation = 'dictation',
    interactive = 'interactive'
};

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

    private createAudioConfig = (path: fs.PathLike): AudioConfig => {
        return AudioConfig.fromStreamInput(this.createFileStream(path))
    }

    private constructCRISURL = (endpointType: EndpointVariant): URL => {
        const url = `wss:${this.serviceRegion}.stt.speech.microsoft.com/speech/recognition/${endpointType}/cognitiveservices/v1?cid=${this.crisEndpointID}`;
        return new URL(url);
    }

    /**
     * @param path path to local file for speech recognition.
     */
    private createFileStream = (path: fs.PathLike): AudioInputStream => {
        const pushStream = AudioInputStream.createPushStream();
        fs.createReadStream(path)
            .on('data', (arrayBuffer) => { pushStream.write(arrayBuffer.buffer); })
            .on('end', () => { pushStream.close(); });

        return pushStream;
    };

    private continuousRecognize = (
        recognizer: SpeechRecognizer
    ): Promise<SpeechRecognitionResult> => {
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

    private internalRecognizer = async (
        recognizer: SpeechRecognizer,
        stream: MultiFilePullStream,
        dataArray: TestData,
        recognizerID?: number
    ): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            let currentFileIndex = 0;

            recognizer.canceled = (r, e) => {
                if (e.errorDetails !== undefined) {
                    reject(e);
                } else {
                    resolve();
                }
            };

            recognizer.recognized = (r, e) => {
                // send the same stream back for any null response from Speech API
                // where there are no utterances returned
                if (!(JSON.parse(e.result.json).NBest) && currentFileIndex >= 0) {
                    console.log(`Interesting that ${recognizerID} returned nothing for ${currentFileIndex - 1}...`)
                    console.log(`Utterance - \"${dataArray[currentFileIndex - 1].transcription}\" and file - \"${dataArray[currentFileIndex - 1].recording}\" \n`)
                    stream.setFile(dataArray[currentFileIndex - 1].recording);
                } else {
                    // push response into the resultArray
                    this.resultArray.push({
                        data: e.result, transcription: dataArray[currentFileIndex - 1].transcription
                    });

                    if (currentFileIndex >= dataArray.length) {
                        // if last response, close stream
                        console.info(`Closing stream from Recognizer ${recognizerID} . . .`);
                        stream.close();
                    } else {
                        // Increment file counter, pass next file to stream.
                        //console.info(`New file into stream, ${currentFileIndex}/${dataArray.length - 1}, recognizer: ${recognizerID}`);
                        stream.setFile(dataArray[currentFileIndex++].recording);
                    }
                }
            };

            // Start stream.
            recognizer.startContinuousRecognitionAsync(() =>
                console.info(`Starting Recognizer ${recognizerID} . . .`),
                (error) => console.error(`${recognizerID} error:`, error)
            );

            // Insert the first file into the buffer.
            stream.setFile(dataArray[currentFileIndex++].recording);
        });
    }

    public batchTranscribe = (testData: TestData, concurrentCalls: number) => {
        const totalFiles = testData.length;

        // The maximum number of files to be transcribed by each recognizer.
        const maxFilesPerRecognizer = Math.ceil(totalFiles / concurrentCalls);

        // Each recognizer will have `maxFilesPerRecognizer` number of files.
        // The possible exception is the last recognizer which will have between
        // 1 and `maxFilesPerRecognizer` files.
        const totalRecognizers = Math.ceil(totalFiles / maxFilesPerRecognizer);

        // Recognizers and the respective files they will transcribe.
        const processArray: {
            recognizer: SpeechRecognizer,
            stream: MultiFilePullStream,
            filesArray: TestData,
        }[] = [];

        for (let index = 0; index < totalRecognizers; index++) {
            const stream = new MultiFilePullStream();
            const pullStream: PullAudioInputStream = AudioInputStream.createPullStream(stream);
            const audioConfig: AudioConfig = AudioConfig.fromStreamInput(pullStream);

            let filesArray: TestDatum[] = testData;

            if (maxFilesPerRecognizer <= totalFiles) {
                filesArray = testData.splice(0, maxFilesPerRecognizer);
            }

            // Push a new recognizer with the audio files and transcriptions
            // that recognizer will process.
            processArray.push({
                recognizer: new SpeechRecognizer(this.speechConfig, audioConfig),
                stream,
                filesArray
            });
        }

        return Promise.all(processArray.map(
            ({ recognizer, stream, filesArray }, index) =>
                this.internalRecognizer(recognizer, stream, filesArray, index)
        ));
    }

    public singleFileTranscribe = async (
        filePath: string
    ): Promise<SpeechRecognitionResult> => {
        if (!fs.lstatSync(filePath).isFile() || filePath === undefined) {
            throw Error(`File Path provided is not a file or is undefined.`);
        }

        const audioConfig = this.createAudioConfig(filePath);
        const recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

        try {
            return await this.continuousRecognize(recognizer);
        } catch (error) {
            throw Error(error)
        } finally {
            recognizer.close();
            audioConfig.close();
            this.speechConfig.close();
        }
    }
}