import * as fs from 'fs';
import {
    AudioConfig,
    AudioInputStream,
    OutputFormat,
    PullAudioInputStream,
    SpeechConfig,
    SpeechRecognitionResult,
    SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';

import { MultiFilePullStream } from './MultiFilePullStream';
import { TestData, TestDatum, TranscriptionServiceConfig } from './types';

enum EndpointVariant {
    conversation = 'conversation',
    dictation = 'dictation',
    interactive = 'interactive',
}

// Disable telemetry data.
SpeechRecognizer.enableTelemetry(false);

export class TranscriptionService {
    public resultArray: Array<{
        data: SpeechRecognitionResult;
        transcription?: string;
        file?: string;
    }> = [];
    private crisEndpointID: string | undefined;
    private serviceRegion: string;
    private speechConfig: SpeechConfig;
    private subscriptionKey: string;

    public constructor(transcriptionService: TranscriptionServiceConfig) {
        this.crisEndpointID = transcriptionService.endpointID;
        this.serviceRegion = transcriptionService.serviceRegion;
        this.subscriptionKey = transcriptionService.subscriptionKey;

        if (this.crisEndpointID) {
            const crisUrl = this.constructCRISURL(EndpointVariant.conversation);
            this.speechConfig = SpeechConfig.fromEndpoint(
                crisUrl,
                this.subscriptionKey
            );
        } else {
            this.speechConfig = SpeechConfig.fromSubscription(
                this.subscriptionKey,
                this.serviceRegion
            );
        }

        const recognitionLanguage = 'en-US';
        this.speechConfig.speechRecognitionLanguage = recognitionLanguage;
        this.speechConfig.outputFormat = OutputFormat.Detailed;
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
            throw Error(error);
        } finally {
            recognizer.close();
            audioConfig.close();
            this.speechConfig.close();
        }
    };

    public batchTranscribe = (
        testData: TestData | fs.PathLike[],
        concurrentCalls: number
    ) => {
        const totalFiles = testData.length;

        // The maximum number of files to be transcribed by each recognizer.
        const maxFilesPerRecognizer = Math.ceil(totalFiles / concurrentCalls);

        // Each recognizer will have `maxFilesPerRecognizer` number of files.
        // The possible exception is the last recognizer which will have between
        // 1 and `maxFilesPerRecognizer` files.
        const totalRecognizers = Math.ceil(totalFiles / maxFilesPerRecognizer);

        // Recognizers and the respective files they will transcribe.
        const processArray: Array<{
            recognizer: SpeechRecognizer;
            stream: MultiFilePullStream;
            filesArray: TestData | fs.PathLike[];
        }> = [];

        for (let index = 0; index < totalRecognizers; index++) {
            const stream = new MultiFilePullStream();
            const pullStream: PullAudioInputStream = AudioInputStream.createPullStream(
                stream
            );
            const audioConfig: AudioConfig = AudioConfig.fromStreamInput(
                pullStream
            );

            let filesArray = testData;

            if (maxFilesPerRecognizer <= totalFiles) {
                filesArray = testData.splice(0, maxFilesPerRecognizer);
            }

            // Push a new recognizer with the audio files and transcriptions
            // that recognizer will process.
            processArray.push({
                recognizer: new SpeechRecognizer(
                    this.speechConfig,
                    audioConfig
                ),
                stream,
                filesArray,
            });
        }

        return Promise.all(
            processArray.map(({ recognizer, stream, filesArray }, index) =>
                this.internalRecognizer(recognizer, stream, filesArray, index)
            )
        )
            .catch((error: Error) => {
                throw Error(error.message);
            })
            .finally(() => {
                processArray.forEach(({ recognizer }, index) => {
                    console.info('Closing recognizer:', index);
                    recognizer.stopContinuousRecognitionAsync();
                    recognizer.close();
                });
            });
    };

    private createAudioConfig = (path: fs.PathLike): AudioConfig => {
        return AudioConfig.fromStreamInput(this.createFileStream(path));
    };

    private constructCRISURL = (endpointType: EndpointVariant): URL => {
        const url = `wss:${this.serviceRegion}.stt.speech.microsoft.com/speech/recognition/${endpointType}/cognitiveservices/v1?cid=${this.crisEndpointID}`;
        return new URL(url);
    };

    /**
     * @param path path to local file for speech recognition.
     */
    private createFileStream = (path: fs.PathLike): AudioInputStream => {
        const pushStream = AudioInputStream.createPushStream();
        fs.createReadStream(path)
            .on('data', arrayBuffer => {
                pushStream.write(arrayBuffer.buffer);
            })
            .on('end', () => {
                pushStream.close();
            });

        return pushStream;
    };

    private continuousRecognize = (
        recognizer: SpeechRecognizer
    ): Promise<SpeechRecognitionResult> => {
        try {
            return new Promise<SpeechRecognitionResult>((resolve, reject) => {
                recognizer.recognized = (_, event) => {
                    resolve(event.result);
                    recognizer.stopContinuousRecognitionAsync(
                        () => {
                            console.log(`Stopping recognition . . .`);
                        },
                        e => {
                            throw Error(e);
                        }
                    );
                };
                recognizer.canceled = (_, event) => {
                    reject(event.errorDetails);
                    recognizer.stopContinuousRecognitionAsync();
                };
                recognizer.startContinuousRecognitionAsync(
                    () => {
                        console.log(`Starting recognition . . .`);
                    },
                    e => {
                        throw Error(e);
                    }
                );
            });
        } catch (error) {
            throw Error(error);
        }
    };

    private internalRecognizer = async (
        recognizer: SpeechRecognizer,
        stream: MultiFilePullStream,
        dataArray: TestData | fs.PathLike[],
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
                if (!JSON.parse(e.result.json).NBest && currentFileIndex >= 0) {
                    stream.setFile(
                        (dataArray[currentFileIndex - 1] as TestDatum)
                            .recording ||
                            dataArray[currentFileIndex - 1].toString()
                    );
                } else {
                    if (e.result.text === '' && !stream.finishedSendingFile()) {
                        // If we get a no-text recognition back and we haven't finished sending the file
                        // then skip this result and wait for another one
                        return;
                    }

                    // push response into the resultArray
                    this.resultArray.push({
                        data: e.result,
                        transcription: (dataArray[
                            currentFileIndex - 1
                        ] as TestDatum).transcription,
                        file: !(dataArray[currentFileIndex - 1] as TestDatum)
                            .transcription
                            ? dataArray[currentFileIndex - 1].toString()
                            : undefined,
                    });

                    if (currentFileIndex >= dataArray.length) {
                        // if last response, close stream
                        console.info(
                            `Closing stream from Recognizer ${recognizerID} . . .`
                        );
                        stream.close();
                    } else {
                        // Increment file counter, pass next file to stream.
                        console.info(
                            `New file into stream, ${currentFileIndex}/${dataArray.length}, recognizer: ${recognizerID}`
                        );
                        stream.setFile(
                            (dataArray[currentFileIndex] as TestDatum)
                                .recording ||
                                dataArray[currentFileIndex].toString()
                        );
                        currentFileIndex++;
                    }
                }
            };

            // Start stream.
            recognizer.startContinuousRecognitionAsync(
                () => console.info(`Starting Recognizer ${recognizerID} . . .`),
                error => console.error(`${recognizerID} error:`, error)
            );

            // Insert the first file into the buffer.
            const start = currentFileIndex;
            currentFileIndex += 1;
            stream.setFile(
                (dataArray[start] as TestDatum).recording ||
                    dataArray[start].toString()
            );
        });
    };
}
