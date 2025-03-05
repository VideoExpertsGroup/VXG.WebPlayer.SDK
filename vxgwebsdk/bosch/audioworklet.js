class ResamplerWorkletNode extends AudioWorkletProcessor{
    constructor() {
        super();
        this.init();
        this.port.onmessage = (event) => {
            switch(event.data.command) {
                case 'config':
                    if (event.data.samplerate) {
                        this.originalSampleRate = event.data.samplerate;
                        console.log('samplerate set to ' + this.originalSampleRate);
                    }
                    break;
                default:
                    console.log('unknown command: ' + JSON.stringify(event.data))
            }
        };
    }

    init() {
        this.CONST = {
            BIAS: 0x84, //aka 132, or 1000 0100
            MAX: 32635  //32767 (max 15-bit integer) minus BIAS
        };
        this.originalSampleRate = 48000;
        this.pcmToMuLawMap = new Array(65536);
        for(var i=-32768; i<32768; i++) {
            this.pcmToMuLawMap[(i&0xffff)] = this.encodePCM(i);
        }
    }

    encodePCM(pcm) {
        //console.log(pcm);
        //var val = pcm - 32768;
        var val = pcm;
        //Get the sign bit.  Shift it for later use without further modification
        var sign = val<0 ? 0x80 : 0;
        //If the number is negative, make it positive (now it's a magnitude)
        if (sign != 0)
            val = -val;
        //The magnitude must be less than 32635 to avoid overflow
        if (val > this.CONST.MAX) val = this.CONST.MAX;
        //Add 132 to guarantee a 1 in the eight bits after the sign bit
        val += this.CONST.BIAS;
        /* Finding the "exponent"
         * Bits:
         * 1 2 3 4 5 6 7 8 9 A B C D E F G
         * S 7 6 5 4 3 2 1 0 . . . . . . .
         * We want to find where the first 1 after the sign bit is.
         * We take the corresponding value from the second row as the exponent value.
         * (i.e. if first 1 at position 7 -> exponent = 2) */
        var exponent = 7;
        //Move to the right and decrement exponent until we hit the 1
        for (var expMask = 0x4000; (val & expMask) == 0; exponent--, expMask >>= 1) { }

        /* The last part - the "mantissa"
         * We need to take the four bits after the 1 we just found.
         * To get it, we shift 0x0f :
         * 1 2 3 4 5 6 7 8 9 A B C D E F G
         * S 0 0 0 0 0 1 . . . . . . . . . (meaning exponent is 2)
         * . . . . . . . . . . . . 1 1 1 1
         * We shift it 5 times for an exponent of two, meaning
         * we will shift our four bits (exponent + 3) bits.
         * For convenience, we will actually just shift the number, then and with 0x0f. */
        var mantissa = (val >> (exponent + 3)) & 0x0f;

        //The mu-law byte bit arrangement is SEEEMMMM (Sign, Exponent, and Mantissa.)
        var mulaw = (sign | exponent << 4 | mantissa);

        //Last is to flip the bits
        return 0xff&(~mulaw);
    }

    process(inputs, outputs, params) {
        if (inputs.length > 0 && inputs[0].length > 0) {
            let downsampled = this.downsampleBuffer(inputs[0][0], 8000);
            let g711 = this.bufferToG711(downsampled);
            this.postMessage(g711);
        }
        return true;
    }

    // check https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js
    downsampleBuffer(buffer, targetSampleRate) {
        if (targetSampleRate === this.originalSampleRate) {
            return buffer;
        }
        let sampleRateRatio = this.originalSampleRate / targetSampleRate;
        let newLength = Math.round(buffer.length / sampleRateRatio);
        let result = new Float32Array(newLength);
        let offsetResult = 0;
        let offsetBuffer = 0;
        while (offsetResult < result.length) {
            var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            var accum = 0,
                count = 0;
            for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }
            result[offsetResult] = accum / count;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }
        return result;
    }

    mergeBuffers(bufferArray, recLength) {
        let result = new Float32Array(recLength);
        let offset = 0;
        for (let i = 0; i < bufferArray.length; i++) {
            result.set(bufferArray[i], offset);
            offset += bufferArray[i].length;
        }
        return result;
    }

    bufferToG711(data /*Float32Array*/) {
        let buffer = new ArrayBuffer(data.length);
        let view = new DataView(buffer);
        let offset = 0;
        let sum = 0;
        for(var i=0; i<data.length; i++, offset+=1) {
            let val = Math.max(-1, Math.min(1, data[i]));
            //val = val < 0 ? val * 0x8000 : val * 0x7FFF;
            val = val * 0x8000; //range -32768 - +32768
            //view.setInt16(offset, val, false);
            val = this.sampleToG711(Math.round(val));
            view.setInt8(offset, val, false);
            sum += Math.abs(data[i]);
        }
        let uint8 = new Uint8Array(buffer);
        let avg = sum/data.length;
        return {
            'buffer': uint8,
            'avg': avg
        };
    }

    sampleToG711(pcm) {
        return this.pcmToMuLawMap[(pcm&0xffff)];
    }

    postMessage(msg) {
        this.port.postMessage(msg);
    }
}

registerProcessor('resampler-node', ResamplerWorkletNode);
