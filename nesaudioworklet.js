class NESAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferL = [];
    this.bufferR = [];

    this.port.onmessage = (e) => {
      const { left, right } = e.data;
      this.bufferL.push(left);
      this.bufferR.push(right);
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const outL = output[0];
    const outR = output[1];

    for (let i = 0; i < outL.length; i++) {
      outL[i] = this.bufferL.length ? this.bufferL.shift() : 0;
      outR[i] = this.bufferR.length ? this.bufferR.shift() : 0;
    }

    return true;
  }
}

registerProcessor("nes-audio", NESAudioProcessor);
