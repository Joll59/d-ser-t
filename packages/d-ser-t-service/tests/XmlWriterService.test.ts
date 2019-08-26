import * as fs from 'fs';
import { isNumber } from 'util';
import { XmlWriterService } from '../src/index';
import { TestMetaData, TestResult } from '../src/types';

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
            const numFailures = xws.countNumFailures(mockResults);
            expect(numFailures).toEqual(1);
        });
    });

    describe('getNumericalTime', () => {
        const time = xws.getNumericalTime(mockMetaData);
        it('returns a Number', () => {
            expect(isNumber(time)).toBe(true);
        });
        it('returns the correct time', () => {
            expect(time).toEqual(10);
        });
    });

    describe('toJUnitXml', () => {
        const expected =
            `<?xml version="1.0" encoding="utf-8"?>\n` +
            `<testsuites name="CRIS STT tests" tests="2" failures="1" time="10" avg_SER="0.5">\n` +
            `  <testsuite name="test_transcription_file.txt" errors="0" failures="1" skipped="0" timestamp="2019-01-01 00:00:00" time="10" tests="2" SER="0.5">\n` +
            `    <testcase classname="test-1" name="test-1" time="n/a" expected="alright">\n` +
            `      <failure actual="all right" WER="1"/>\n` +
            `    </testcase>\n` +
            `    <testcase classname="test-2" name="test-2" time="n/a" expected="hi"/>\n` +
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
