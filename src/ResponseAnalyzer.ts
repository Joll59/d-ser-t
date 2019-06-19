
import { DetailedSpeechPhrase } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/ServiceMessages/DetailedSpeechPhrase';
import { wordErrorRate as calculateWER } from 'word-error-rate';

import { TranscriptionAnalyzer } from './TranscriptionAnalyzer';
import { TestResult } from './types';

export class ResponseAnalyzer {
    private readonly transcriptAnalyzer: TranscriptionAnalyzer;

    constructor(transcriptAnalyzer: TranscriptionAnalyzer) {
        this.transcriptAnalyzer = transcriptAnalyzer;
    }

    /**
     * Creates, prints, and returns meta data for a single recording and its
     * expected transcription.
     *
     * @returns a TestResult object - the `actualTranscription`,
     * `expectedTranscription`, and `wordErrorRate` for any one recording.
     */
    handleResponse(expectedTranscription: string, response: DetailedSpeechPhrase): TestResult {
        try {
            // const actualTranscription = response.NBest[0].Lexical.toLowerCase();
            const actualTranscription = 'dfsasda& dsjh&&& ..wow ()ba badhl . fsda-sdf';

            // Check if the transcription contains special characters that the
            // system does not currently account for.
            this.transcriptAnalyzer.analyzeActualTranscription(actualTranscription);

            const wordErrorRate = calculateWER(actualTranscription, expectedTranscription);

            console.log(`Actual Response: "${actualTranscription}"`);
            console.log(`Expected Response: "${expectedTranscription}"`);
            console.log(`Word Error Rate: ${wordErrorRate}\n`);

            const result: TestResult = {
                actualTranscription,
                expectedTranscription,
                wordErrorRate
            };

            return result;
        } catch (error) {
            throw Error(error);
        }
    }

    /**
     * Sentence Error Rate (SER) is a measure of perfect transcriptions between 0
     * and 1. An SER of 0 would mean every recording was transcribed perfectly, and
     * an SER of 1 would mean no recordings were transcribed perfectly.
     */
    calculateSER (results: TestResult[]) {
        let incorrectTranscriptions = 0;

        for (const result of results) {
            if (result.wordErrorRate > 0) {
                incorrectTranscriptions++;
            }
        }

        const totalTranscriptions = results.length;
        return (incorrectTranscriptions / totalTranscriptions).toPrecision(3);
    }
}