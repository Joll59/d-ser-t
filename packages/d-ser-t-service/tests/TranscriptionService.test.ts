// import { TranscriptionService } from '../src/index';
// import { TranscriptionServiceConfig } from '../lib/types';

type PublicInterfaceOf<Class> = {
    [Member in Exclude<keyof Class, []>]: Class[Member];
}

// TODO Decide to test private methods or not.
/* Need to figure out how/if I should test private Methods
withing classes, will also need to mock speech services
const dummyConfig: TranscriptionServiceConfig = {
    endpointID: '1234',
    serviceRegion: 'home',
    subscriptionKey : 'key'
};
const TestSTTService = new TranscriptionService(dummyConfig);
TestSTTService.batchTranscribe(['https://www.google.com'],2); */

describe('TranscriptionService', ()=>{
    it('Testing Mocks', ()=>{
        expect(true).toEqual(true);
    })
})