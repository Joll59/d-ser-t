import * as fs from 'fs';
import * as builder from 'xmlbuilder';
import { TestMetaData, TestResult } from './types';

export class XmlWriterService {
    /**
     * Counts number of failures (defined as a result with wordErrorRate > 0).
     * 
     * @param results Results of a test run
     */
    public countNumFailures = (results: TestResult[]): number => {
        let count = 0;
        results.forEach(elem => {
            if (elem.wordErrorRate > 0) {
                count++;
            }
        });
        return count;
    };

    /**
     * Extracts testing time from metadata in number form.
     * 
     * @param metadata Metadata of a test run
     */
    public getNumericalTime = (metadata: TestMetaData): number => {
        return parseInt(metadata.totalTestingTime, 10);
    };

    /**
     * Uses the xmlbuilder module to generate a string containing test results and the
     * relevant metrics in JUnit XML format for a single run.
     *
     * @param metadata Metadata for the test run
     * @param results Results of the test run
     * @param timestamp Time that the tests were run
     */
    public toJunitXml = (
        metadata: TestMetaData,
        results: TestResult[],
        timestamp: string
    ): string => {
        const numTests = results.length;
        const numFailures = this.countNumFailures(results);
        const testingTime = this.getNumericalTime(metadata);

        const testsuites = builder
            .create('testsuites', { encoding: 'utf-8' })
            .att('name', 'CRIS STT tests')
            .att('tests', numTests)
            .att('failures', numFailures)
            .att('time', testingTime)
            .att('avg_SER', metadata.sentenceErrorRate);

        const testsuite = testsuites
            .ele('testsuite')
            .att('name', metadata.transcriptionFile)
            .att('errors', 0)
            .att('failures', numFailures)
            .att('skipped', 0)
            .att('timestamp', timestamp)
            .att('time', testingTime)
            .att('tests', numTests)
            .att('SER', metadata.sentenceErrorRate);

        results.forEach((tc, index) => {
            const testcase = testsuite
                .ele('testcase')
                .att('classname', `test-${index + 1}`)
                .att('name', `test-${index + 1}`)
                .att('time', 'n/a')
                .att('expected', tc.expectedTranscription);

            if (tc.wordErrorRate > 0) {
                testcase
                    .ele('failure')
                    .att('actual', tc.actualTranscription)
                    .att('WER', tc.wordErrorRate)
                    .end({ pretty: true });
            }
            testcase.end({ pretty: true });
        });
        testsuite.end({ pretty: true });
        const finalXml = testsuites.end({ pretty: true });

        return finalXml.toString();
    };

    /**
     * Writes the test results and top-level metrics in JUnit XML format
     * at the specified filepath.
     *
     * @param filePath Path to a .xml file
     * @param metadata Metadata for the test run
     * @param results Results of the test run
     * @param timestamp Time that the tests were run
     */
    public writeToXmlFile = (
        filePath: string,
        metadata: TestMetaData,
        results: TestResult[],
        timestamp: string
    ): void => {
        try {
            const xmlresults = this.toJunitXml(metadata, results, timestamp);

            fs.writeFileSync(filePath, xmlresults, 'utf8');

            console.info(`Finished writing to ${filePath}`);
        } catch (error) {
            throw Error(error);
        }
    };
}
