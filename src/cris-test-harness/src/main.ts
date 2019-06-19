import {
  calculateSER,
  cleanExpectedTranscription,
  createTestData,
  handleResponse,
  sumFunc,
  TestData,
  validateExpectedTranscription,
  writeDataToFile
} from './helpers';
import {
  TranscriptionService,
  TranscriptionServiceConfig
} from './TranscriptionService';
import path from 'path';

interface HarnessConfig {
  audioDirectory: string;
  audioFile: string;
  concurrentCalls: string;
  endpointId: string | undefined;
  outFile: string;
  region: string;
  subscriptionKey: string;
  transcriptionFile: string;
}

export class CustomSpeechTestHarness {
  private audioDirectory: string;
  private concurrency: string;
  private crisEndpointId: string;
  private outFile: string;
  private serviceRegion: string;
  private singleFile: string;
  private subscriptionKey: string;
  private transcriptionFile: string;
  private transcriptionService: TranscriptionService | undefined;

  public constructor(harnessConfig: HarnessConfig) {
    this.audioDirectory = harnessConfig.audioDirectory as string;
    this.concurrency = harnessConfig.concurrentCalls as string;
    this.crisEndpointId = harnessConfig.endpointId as string;
    this.outFile = harnessConfig.outFile as string || path.join('.','test_results.json');
    this.serviceRegion = harnessConfig.region as string;
    this.singleFile = harnessConfig.audioFile as string;
    this.subscriptionKey = harnessConfig.subscriptionKey as string;
    this.transcriptionFile = harnessConfig.transcriptionFile as string;
  }

  public setTranscriptionService() {
    const config: TranscriptionServiceConfig = {
      subscriptionKey: this.subscriptionKey,
      serviceRegion: this.serviceRegion,
      endpointID: this.crisEndpointId
    };

    this.transcriptionService = new TranscriptionService(config);
  }

  public async singleFileTranscription() {
    this.setTranscriptionService();
    if (this.transcriptionService) {
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
      validateExpectedTranscription(testDatum.transcription);
      testDatum.transcription = cleanExpectedTranscription(testDatum.transcription);
    }
  }

  public async multipleFileTranscription() {
    this.setTranscriptionService();
    if (this.transcriptionService) {
      const startTime = process.hrtime();
      this.checkConcurrency();

      const parsedData: TestData = createTestData(this.transcriptionFile, this.audioDirectory);
      this.validateAndCleanTranscription(parsedData);

      await this.transcriptionService.batchTranscribe(parsedData, parseInt(this.concurrency))
        .then(() => {
          const endTime = process.hrtime(startTime);
          const results: any = this.transcriptionService!.resultArray.map((item, idx) => {
              console.log(`Handling result ${idx + 1}/${this.transcriptionService!.resultArray.length} . . .`);
              return handleResponse(item.transcription, JSON.parse(item.data.json));
            });

          const sentenceErrorRate = calculateSER(results);
          console.log(`Sentence Error Rate: ${ sentenceErrorRate }`);

          const averageWordErrorRate = ((results.map((item: any, idx: number) => {
            item.wordErrorRate && item.wordErrorRate > 0 ? item.wordErrorRate : 0
          })
            .reduce(sumFunc) / results.length) as number);

          const testingTime = `${endTime[0]} seconds, ${endTime[1]} nanoseconds`;
          const metaData = {
            sentenceErrorRate, averageWordErrorRate, totalTestingTime: testingTime
          };

          this.outFile ? writeDataToFile(this.outFile, { results, metaData }) : null;
          console.log(`Runtime: ${ testingTime }`);
        })
        .catch((error: Error) => console.error(`#### ENCOUNTERED AN ERROR ####:\n`, error))
        .finally(() => process.exit(1));
    }
  }
}
