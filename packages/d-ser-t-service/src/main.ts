
import { ResponseAnalyzer } from './ResponseAnalyzer';
import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';
import { TranscriptionFileService } from './TranscriptionFileService';
import { TranscriptionService } from './TranscriptionService';
import { TestData, TranscriptionServiceConfig, TestResult, HarnessConfig } from './types';
import path from 'path';



export class CustomSpeechTestHarness {
    private audioDirectory?: string;
    private concurrency?: string;
    private crisEndpointId?: string;
    private outFile: string;
    private serviceRegion: string;
    private singleFile?: string;
    private subscriptionKey: string;
    private transcriptionFile?: string;
    private transcriptionService!: TranscriptionService;
    private localFileService!: TranscriptionFileService;
    private transcriptAnalyzer!: TranscriptionAnalyzer;
    private responseAnalyzer!: ResponseAnalyzer;


    public constructor(harnessConfig: HarnessConfig) {
        this.audioDirectory = harnessConfig.audioDirectory;
        this.concurrency = harnessConfig.concurrentCalls;
        this.crisEndpointId = harnessConfig.endpointId;
        this.outFile = harnessConfig.outFile || path.join('.', 'test_results.json');
        this.serviceRegion = harnessConfig.region;
        this.singleFile = harnessConfig.audioFile;
        this.subscriptionKey = harnessConfig.subscriptionKey;
        this.transcriptionFile = harnessConfig.transcriptionFile;
    }

    public setTranscriptionService() {
        const config: TranscriptionServiceConfig = {
            subscriptionKey: this.subscriptionKey,
            serviceRegion: this.serviceRegion,
            endpointID: this.crisEndpointId
        };

        this.transcriptionService = new TranscriptionService(config);
    }
    public setLocalServices() {
        this.localFileService = new TranscriptionFileService();
        this.transcriptAnalyzer = new TranscriptionAnalyzer();
        this.responseAnalyzer = new ResponseAnalyzer(this.transcriptAnalyzer);
    }
    public async singleFileTranscription() {
        this.setTranscriptionService();
        if (this.transcriptionService && this.singleFile) {
            await this.transcriptionService.singleFileTranscribe(this.singleFile)
                .then(resp => console.log(resp.text))
                .catch(err => console.warn(err))
                .finally(() => process.exit(1));
        }
    }

    public checkConcurrency() {
        if (!!this.concurrency === false) {
            this.concurrency = '1';
            const warnMsg = `\nSetting concurrent calls to 1, you can set concurrent calls to service with "-c".\n`
            console.warn(warnMsg);
        }
    }

    public validateAndCleanTranscription(parsedData: TestData) {
        for (const testDatum of parsedData) {
            testDatum.transcription = this.transcriptAnalyzer.cleanTranscription(testDatum.transcription);
            this.transcriptAnalyzer.validateExpectedTranscription(testDatum.transcription);
        }
    }

    public async multipleFileTranscription() {
        this.setTranscriptionService();
        this.setLocalServices();
        if (this.transcriptionService && this.transcriptionFile && this.audioDirectory) {
            const startTime = process.hrtime();
            this.checkConcurrency();

            const parsedData: TestData = this.localFileService.createTestData(this.transcriptionFile, this.audioDirectory);
            this.validateAndCleanTranscription(parsedData);

            await this.transcriptionService.batchTranscribe(parsedData, parseInt(this.concurrency!))
                .then(() => {
                    const endTime = process.hrtime(startTime);
                    const results = this.transcriptionService!.resultArray.map((item, idx) => {
                        console.log(`Handling result ${idx + 1}/${this.transcriptionService!.resultArray.length} . . .`);
                        return this.responseAnalyzer.handleResponse(item.transcription, JSON.parse(item.data.json));
                    });

                    const sentenceErrorRate = this.responseAnalyzer.calculateSER(results);
                    console.log(`Sentence Error Rate: ${sentenceErrorRate}`);
                    const averageWordErrorRate = ((results.map((item: TestResult, idx: number) => {
                        return item.wordErrorRate && item.wordErrorRate > 0 ? item.wordErrorRate : 0
                    }).reduce(this.responseAnalyzer.reducerSum) / results.length) as number);

                    const totalTestingTime = `${endTime[0]} seconds, ${endTime[1]} nanoseconds`;
                    const metaData = {
                        sentenceErrorRate, averageWordErrorRate, totalTestingTime
                    };

                    this.outFile ? this.localFileService.writeToTextFile(this.outFile, { results, metaData }) : null;
                    console.log(`Runtime: ${totalTestingTime}`);
                })
                .catch((error: Error) => console.error(`#### ENCOUNTERED AN ERROR ####:\n`, error))
                .finally(() => process.exit(1));
        }
    }
}