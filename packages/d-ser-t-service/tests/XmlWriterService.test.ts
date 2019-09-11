import * as fs from 'fs';

import { TestMetaData, TestResult } from '../src/types';
import { XmlWriterService } from '../src/XmlWriterService';

const mockMetaData: TestMetaData = {
    transcriptionFile: 'test_transcription_file.txt',
    sentenceErrorRate: '0.5',
    averageWordErrorRate: '0.5',
    totalTestingTime: '10 seconds',
};

const mockResults: TestResult[] = [
    {
        actualTranscription: 'all right',
        expectedTranscription: 'alright',
        wordErrorRate: 1,
    },
    {
        actualTranscription: 'hi',
        expectedTranscription: 'hi',
        wordErrorRate: 0,
    },
];

const mockFilePath = 'fake_test_results.xml';
const mockBadFilePath = 'fake_test_results.json';
const mockTimestamp = '2019-01-01 00:00:00';

const xws = new XmlWriterService();

afterAll(() => {
    try {
        fs.unlinkSync(mockFilePath);
    } catch (err) {
        console.error(err);
    }
});

describe('XMLWriterService', () => {
    describe('countNumFailures', () => {
        it('returns the correct number of failures', () => {
            const numFailures = xws.getFailureCount(mockResults);
            expect(numFailures).toEqual(1);
        });
    });

    describe('toJUnitXml', () => {
        const expected =
            `<?xml version="1.0" encoding="utf-8"?>\n` +
            `<testsuites name="CRIS STT tests" tests="2" failures="1" time="10" SER="0.5" AWER="0.5">\n` +
            `  <testsuite name="test_transcription_file.txt" tests="2" failures="1" time="10" timestamp="2019-01-01 00:00:00" errors="0" skipped="0" SER="0.5" AWER="0.5">\n` +
            `    <testcase classname="test-1" WER="1" expected="alright" name="N/A" time="N/A">\n` +
            `      <failure actual="all right"/>\n` +
            `    </testcase>\n` +
            `    <testcase classname="test-2" WER="0" expected="hi" name="N/A" time="N/A"/>\n` +
            `  </testsuite>\n` +
            `</testsuites>`;

        it('returns the correct xml', () => {
            expect(
                xws.toJunitXml(mockMetaData, mockResults, mockTimestamp)
            ).toEqual(expected);
        });
    });

    describe('writeToXmlFile', () => {
        it("throws an Error when file path doesn't end in .xml", () => {
            expect(() => {
                xws.writeToXmlFile(
                    mockBadFilePath,
                    mockMetaData,
                    mockResults,
                    mockTimestamp
                );
            }).toThrowError(Error);
        });
        it('creates a .xml file at the specified path', () => {
            xws.writeToXmlFile(
                mockFilePath,
                mockMetaData,
                mockResults,
                mockTimestamp
            );
            expect(fs.existsSync(mockFilePath)).toEqual(true);
        });
    });
});
