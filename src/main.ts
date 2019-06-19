import cli from './cli'
import { ResponseAnalyzer } from './ResponseAnalyzer';
import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';
import { TranscriptionFileService } from './TranscriptionFileService';
import { TranscriptionService } from './TranscriptionService';
import { TestData, TranscriptionServiceConfig } from './types';

export const start = async () => {
    const yargsArgs = cli();

    const audioDirectory = yargsArgs.audioDirectory as string;
    let concurrency = yargsArgs.concurrentCalls as string;
    const crisEndpointId = yargsArgs.endpointId as string;
    const outFile = yargsArgs.outFile as string || '.\\test_results.json';
    const serviceRegion = yargsArgs.serviceRegion as string;
    const singleFile = yargsArgs.audioFile as string;
    const subscriptionKey = yargsArgs.subscriptionKey as string;
    const transcriptionFile = yargsArgs.transcriptionFile as string;

    // Create the local services.
    const tfs = new TranscriptionFileService();
    const transcriptAnalyzer = new TranscriptionAnalyzer();
    const responseAnalyzer = new ResponseAnalyzer(transcriptAnalyzer);

    // Create the speech service.
    const transcriptionService: TranscriptionServiceConfig = {
        subscriptionKey: subscriptionKey,
        serviceRegion: serviceRegion,
        endpointID: crisEndpointId
    }
    const service = new TranscriptionService(transcriptionService);

    if (singleFile) {
        await service.singleFiletranscribe(singleFile)
            .then(resp =>
                console.log(resp.text)
            ).catch(error =>
                console.warn(error)
            ).finally(() =>
                process.exit(1));
    } else {
        const start = process.hrtime();

        if (!!concurrency === false) {
            concurrency = '1';
            console.warn(`\nSetting concurrent calls to 1, you can set concurrent calls to service with "-c".\n`);
        }

        const parsedData: TestData = tfs.createTestData(transcriptionFile, audioDirectory);

        for (const testDatum of parsedData) {
            transcriptAnalyzer.validateExpectedTranscription(testDatum.transcription);
            testDatum.transcription = transcriptAnalyzer.cleanExpectedTranscription(testDatum.transcription);
        }

        await service.batchTranscribe(parsedData, Number.parseInt(concurrency))
            .then(() => {
                // Seconds and milliseconds of the recognition process runtime.
                const end = process.hrtime(start);

                const results = service.resultArray.map(
                    (item, index) => {
                        console.log(`Handling result ${index + 1}/${service.resultArray.length} . . .`);
                        return responseAnalyzer.handleResponse(item.transcription, JSON.parse(item.data.json));
                    });

                const reducer = (accumulator: number, currentValue: number) =>
                    accumulator + currentValue;

                const sentenceErrorRate = responseAnalyzer.calculateSER(results);
                console.log(`Sentence Error Rate: ${sentenceErrorRate}`);

                const averageWordErrorRate = ((results.map((item, index: number) =>
                    item.wordErrorRate && item.wordErrorRate > 0 ? item.wordErrorRate : 0)
                    .reduce(reducer) / results.length) as number);
                console.log(`Average Word Error Rate: ${averageWordErrorRate}`);

                const testingTime = `${end[0]} seconds, ${end[1]} nanoseconds`;

                const metaData = {
                    sentenceErrorRate: sentenceErrorRate,
                    averageWordErrorRate: averageWordErrorRate,
                    totalTestingTime: testingTime,
                }

                outFile ? tfs.writeToTextFile(outFile, { results, metaData }) : null;
                console.log(`Runtime: ${testingTime}`);
            })
            .catch((error: Error) => {
                console.error(`#### ENCOUNTERED AN ERROR ####:\n`, error);
            })
            .finally(() => {
                process.exit(1);
            });
    }
};

try {
    start();
} catch (error) {
    console.error(error);
}