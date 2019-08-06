import fs from 'fs';
import path from 'path';

import { ITranscriptionAnalyzer } from './interfaces/ITranscriptionAnalyzer';
import { ResponseAnalyzer } from './ResponseAnalyzer';
import TranscriptionAnalyzerFactory from './TranscriptionAnalyzerFactory';
import { TranscriptionFileService } from './TranscriptionFileService';
import { TranscriptionService } from './TranscriptionService';
import {
    HarnessConfig,
    TestData,
    TestResult,
    TranscriptionServiceConfig,
} from './types';

export class CustomSpeechTestHarness {
    private audioDirectory?: string;
    private concurrency?: string;
    private crisEndpointId?: string;
    private exceptions?: string;
    private localFileService!: TranscriptionFileService;
    private outFile: string;
    private responseAnalyzer!: ResponseAnalyzer;
    private serviceRegion: string;
    private singleFile?: string;
    private subscriptionKey: string;
    private transcriptAnalyzer!: ITranscriptionAnalyzer;
    private transcriptionFile?: string;
    private transcriptionService!: TranscriptionService;

    public constructor(harnessConfig: HarnessConfig) {
        this.audioDirectory = harnessConfig.audioDirectory;
        this.concurrency = harnessConfig.concurrentCalls;
        this.crisEndpointId = harnessConfig.endpointId;
        this.exceptions = harnessConfig.exceptions;
        this.outFile =
            harnessConfig.outFile || path.join('.', 'test_results.json');
        this.serviceRegion = harnessConfig.region;
        this.singleFile = harnessConfig.audioFile;
        this.subscriptionKey = harnessConfig.subscriptionKey;
        this.transcriptionFile = harnessConfig.transcriptionFile;
    }

    public setTranscriptionService() {
        const config: TranscriptionServiceConfig = {
            subscriptionKey: this.subscriptionKey,
            serviceRegion: this.serviceRegion,
            endpointID: this.crisEndpointId,
        };

        this.transcriptionService = new TranscriptionService(config);
    }

    public setLocalServices() {
        this.localFileService = new TranscriptionFileService();
        this.transcriptAnalyzer = TranscriptionAnalyzerFactory.createTranscriptionAnalyzer(
            this.exceptions
        );
        this.responseAnalyzer = new ResponseAnalyzer(this.transcriptAnalyzer);
    }

    public async singleFileTranscription() {
        this.setTranscriptionService();
        if (this.transcriptionService && this.singleFile) {
            await this.transcriptionService
                .singleFileTranscribe(this.singleFile)
                .then(resp => console.log(resp.text))
                .catch(err => console.warn(err))
                .finally(() => process.exit(1));
        }
    }

    public checkConcurrency() {
        if (!!this.concurrency === false) {
            this.concurrency = '1';
            const warnMsg = `\nSetting concurrent calls to 1, you can set concurrent calls to service with "-c".\n`;
            console.warn(warnMsg);
        }
    }

    public validateAndCleanTranscription(parsedData: TestData) {
        for (const testDatum of parsedData) {
            testDatum.transcription = this.transcriptAnalyzer.cleanTranscription(
                testDatum.transcription
            );
            this.transcriptAnalyzer.validateExpectedTranscription(
                testDatum.transcription
            );
        }
    }

    public async multipleFileTranscription() {
        this.setTranscriptionService();
        this.setLocalServices();
        if (
            this.transcriptionService &&
            this.transcriptionFile &&
            this.audioDirectory
        ) {
            const startTime = process.hrtime();
            this.checkConcurrency();

            const parsedData: TestData = this.localFileService.createTestData(
                this.transcriptionFile,
                this.audioDirectory
            );
            this.validateAndCleanTranscription(parsedData);

            await this.transcriptionService.batchTranscribe(
                parsedData,
                parseInt(this.concurrency!, 10)
            );
            // Time it took to parse, validate, and batch transcribe all the
            // audio and transcription files.
            const endTime = process.hrtime(startTime);

            const results = this.transcriptionService!.resultArray.map(
                (item, idx) => {
                    console.log(
                        `Handling result ${idx + 1}/${
                            this.transcriptionService!.resultArray.length
                        } . . .`
                    );
                    return this.responseAnalyzer.handleResponse(
                        item.transcription!,
                        JSON.parse(item.data.json)
                    );
                }
            );
            results.sort((a, b) => b.wordErrorRate - a.wordErrorRate);
            // From 0 to 1, the rate of transcriptions with at least one error.
            // An SER of 1 means every utterance was transcribed with at least
            // one error. An SER of 0 means every utterance was transcribed
            // perfectly.
            const sentenceErrorRate = this.responseAnalyzer.calculateSER(
                results
            );
            console.log(`Sentence Error Rate: ${sentenceErrorRate}`);

            const averageWordErrorRate = ((results
                .map((item: TestResult, idx: number) => {
                    return item.wordErrorRate && item.wordErrorRate > 0
                        ? item.wordErrorRate
                        : 0;
                })
                .reduce(this.responseAnalyzer.reducerSum) /
                results.length) as number).toPrecision(3);
            console.log(`Average Word Error Rate: ${averageWordErrorRate}`);

            const totalTestingTime = `${endTime[0]} seconds`;
            const metaData = {
                transcriptionFile: this.transcriptionFile,
                sentenceErrorRate,
                averageWordErrorRate,
                totalTestingTime,
            };

            this.outFile
                ? this.localFileService.writeToTextFile(this.outFile, {
                    metaData,
                    results,
                })
                : console.warn('Output File not generated');
            console.log(`Runtime: ${totalTestingTime}`);
        }
    }

    public async audioFolderTranscription(files: fs.PathLike[]) {
        this.setTranscriptionService();
        if (this.transcriptionService && files) {
            this.checkConcurrency();
            await this.transcriptionService.batchTranscribe(
                files,
                parseInt(this.concurrency!, 10)
            );
            const results: Array<{
                index: number;
                file?: string;
                transcription: string;
            }> = this.transcriptionService!.resultArray.map((item, index) => ({
                index,
                file: item.file,
                transcription: JSON.parse(item.data.json).NBest[0].Lexical,
            }));
            return results;
        }
    }
}
