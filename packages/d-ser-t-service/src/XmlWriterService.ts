import * as fs from 'fs';
// @ts-ignore
import * as XMLWriter from 'xml-writer';
import { TestMetaData, TestResult } from './types';

export class XmlWriterService {
    /**
     * TODO
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
     * TODO
     */
    public getNumericalTime = (metadata: TestMetaData): number => {
        return parseInt(metadata.totalTestingTime, 10);
    };

    /**
     * TODO
     */
    public writeAllResults = (
        xw: XMLWriter,
        metadata: TestMetaData,
        results: TestResult[]
    ): void => {
        const numTests = results.length;
        const numFailures = this.countNumFailures(results);
        const testingTime = this.getNumericalTime(metadata);

        xw.startDocument('1.0', 'UTF-8')
            .startElement('testsuites')
            .writeAttribute('name', 'CRIS STT tests')
            .writeAttribute('tests', numTests)
            .writeAttribute('failures', numFailures)
            .writeAttribute('time', testingTime)
            .writeAttribute(
                'average sentence error rate',
                metadata.sentenceErrorRate
            );

        xw.startElement('testsuite')
            .writeAttribute('name', metadata.transcriptionFile)
            .writeAttribute('errors', 0)
            .writeAttribute('failures', numFailures)
            .writeAttribute('skipped', 0)
            .writeAttribute('timestamp', 'TODO')
            .writeAttribute('time', testingTime)
            .writeAttribute('tests', numTests)
            .writeAttribute('Sentence Error Rate', metadata.sentenceErrorRate);

        results.forEach((testcase, index) => {
            xw.startElement('testcase')
                .writeAttribute('classname', `test-${index}`)
                .writeAttribute('name', `test-${index}`)
                .writeAttribute('time', 'TODO')
                .writeAttribute('Expected', testcase.expectedTranscription);

            if (testcase.wordErrorRate > 0) {
                xw.startElement('failure')
                    .writeAttribute('Actual', testcase.actualTranscription)
                    .writeAttribute('Word Error Rate', testcase.wordErrorRate)
                    .endElement('failure');
            }

            xw.endElement('testcase');
        });

        xw.endElement('testsuites');
        xw.endDocument();
    };

    /**
     * TODO
     */
    public writeToXmlFile = (
        filePath: string,
        metadata: TestMetaData,
        results: TestResult[]
    ): void => {
        try {
            console.info(
                `Writing test results in JUnit XML format to ${filePath}`
            );
            // Set up file stream and XMLWriter
            const ws = fs.createWriteStream(filePath);
            function writer(str: string, encoding: string): void {
                ws.write(str, encoding);
            }
            const xmlwriter = new XMLWriter(true, writer);

            // Write to XML file
            this.writeAllResults(xmlwriter, metadata, results);

            ws.end();

            console.info(
                `Finished writing test results in JUnit XML format to ${filePath}`
            );
        } catch (error) {
            throw Error(error);
        }
    };
}
