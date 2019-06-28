import * as fs from 'fs';

describe('Is Current Model Successful ?', ()=>{
    it('Reads result json file, extract SER and returns a boolen', ()=>{
        const data = fs.readFileSync('../../test_results.json');
        const fileJSON = JSON.parse(data.toString());
        expect(Number.parseFloat(fileJSON.metaData.sentenceErrorRate) > 0.2).toBe(false);
    })
})