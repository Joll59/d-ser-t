import * as argv from 'yargs';

import { start } from './main';

// tslint:disable-next-line: no-unused-expression
argv
    .scriptName('d-ser-t')
    .options({
        subscriptionKey: {
            alias: ['s', 'key'],
            description: 'Microsoft speech subscription key',
            required: true,
            requiresArg: true,
            type: 'string',
        },
        region: {
            alias: ['r', 'service-region', 'sr'],
            description: 'Microsoft Speech service region',
            required: true,
            requiresArg: true,
            type: 'string',
        },
        endpointId: {
            alias: ['e', 'endpoint-Id'],
            description: 'Custom Speech endpoint ID',
            requiresArg: true,
            type: 'string',
        },
        audioDirectory: {
            alias: ['folder', 'd'],
            description:
                'Directory containing PCM wav audio files slated for transcription',
            // required: true,
            requiresArg: true,
            type: 'string',
        },
        transcriptionFile: {
            alias: ['t', 'transcription-file'],
            description:
                'Transcription .txt file mapping audio files to transcription',
            example:
                '<audiofile.wav> <tabcharacter"\\t"> <audio transcription> per line',
            // required: true,
            requiresArg: true,
            type: 'string',
        },
        audioFile: {
            alias: 'f',
            description:
                'Singular audio file to transcribe, no transcription file, audio directory',
            type: 'string',
            requiresArg: true,
        },
        outFile: {
            alias: 'o',
            description:
                'Where to save the test results in .json or .xml format',
            type: 'string',
            requiresArg: true,
        },
        concurrentCalls: {
            alias: ['c', 'cc'],
            description:
                'Number of concurrent calls you want to make to speech service default is 5',
            type: 'string',
            requiresArg: true,
        },
        exceptions: {
            alias: 'x',
            description: 'An exception file for transcribed words',
            type: 'string',
            requiresArg: true,
        },
    })
    .conflicts('d', 'f')
    .conflicts('f', 't')
    .conflicts('f', 'o')
    .help('help')
    .command(
        ['$0'],
        'Minimal command to run the service: -r [string] -s [string] -f [string]',
        // tslint:disable-next-line: no-empty
        (): any => {},
        param => {
            const values = {
                audioDirectory: param.audioDirectory as string,
                audioFile: param.audioFile as string,
                concurrentCalls: param.concurrentCalls as string,
                transcriptionFile: param.transcriptionFile as string,
                subscriptionKey: param.subscriptionKey as string,
                endpointId: param.endpointId as string,
                outFile: param.outFile as string,
                region: param.region as string,
                exceptions: param.exceptions as string,
            };
            start(values);
        }
    ).argv;
