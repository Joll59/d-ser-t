import * as fs from 'fs';
import * as path from 'path';
import * as builder from 'xmlbuilder';

import { TestMetaData, TestResult } from './types';

export class XmlWriterService {
    /**
     * Counts number of failures (defined as a result with wordErrorRate > 0).
     *
     * @param results Results of a test run
     */
    public getFailureCount = (results: TestResult[]): number => {
        let count = 0;
        results.forEach(elem => {
            if (elem.wordErrorRate > 0) {
                count++;
            }
        });
        return count;
    };

    /**
     * Uses the xmlbuilder module to generate a string containing test results
     * and the relevant metrics in JUnit XML format for a single run.
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
        const testCount = results.length;
        const failureCount = this.getFailureCount(results);

        // Extracts testing string time from metadata in number form.
        const totalTestingTime = parseInt(metadata.totalTestingTime, 10);

        const testsuites = builder
            .create('testsuites', { encoding: 'utf-8' })
            // JUNIT attributes.
            .att('name', 'CRIS STT tests')
            .att('tests', testCount)
            .att('failures', failureCount)
            .att('time', totalTestingTime)
            // d-ser-t-specific attributes.
            .att('SER', metadata.sentenceErrorRate)
            .att('AWER', metadata.averageWordErrorRate);

        const testsuite = testsuites
            .ele('testsuite')
            // JUNIT attributes.
            .att('name', metadata.transcriptionFile)
            .att('tests', testCount)
            .att('failures', failureCount)
            .att('time', totalTestingTime)
            .att('timestamp', timestamp)
            .att('errors', 0)
            .att('skipped', 0)
            // d-ser-t-specific attributes.
            .att('SER', metadata.sentenceErrorRate)
            .att('AWER', metadata.averageWordErrorRate);

        results.forEach((result, index) => {
            const testcase = testsuite
                .ele('testcase')
                // JUNIT attributes.
                .att('classname', `test-${index + 1}`)
                // d-ser-t-specific attributes.
                .att('WER', result.wordErrorRate)
                .att('expected', result.expectedTranscription)
                // JUNIT attributes.
                .att('name', 'N/A')
                .att('time', 'N/A');

            if (result.wordErrorRate > 0) {
                testcase
                    // JUNIT attributes.
                    .ele('failure')
                    // d-ser-t-specific attributes.
                    .att('actual', result.actualTranscription)
                    .end({ pretty: true });
            }
            testcase.end({ pretty: true });
        });
        testsuite.end({ pretty: true });
        const finalXml = testsuites.end({ pretty: true });

        return finalXml.toString();
    };

    /**
     * Writes the test results and top-level metrics in JUnit XML format at the
     * specified filepath.
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
            if (path.extname(String(filePath)).substr(1) !== 'xml') {
                throw Error('Invalid input - filePath must end with .xml');
                return;
            } else {
                const xmlresults = this.toJunitXml(
                    metadata,
                    results,
                    timestamp
                );
                fs.writeFileSync(filePath, xmlresults, 'utf8');
                console.info(`Finished writing to ${filePath}`);
            }
        } catch (error) {
            throw Error(error);
        }
    };
}
