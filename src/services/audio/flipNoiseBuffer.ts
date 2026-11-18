let audioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;

export function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export async function resumeAudioContextIfNeeded(): Promise<void> {
  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // ignore
    }
  }
}

export function createVelvetBreezeNoiseBuffer(ctx: AudioContext, duration: number = 0.5): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }

  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * Math.max(0.6, duration));
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    b3 = -0.2495 * b3 - white * 0.29;
    const pink = b0 + b1 + b2 + b3 + b4 + white * 0.1848;
    b4 = white * 0.3;

    lastOut = (lastOut + (0.04 * pink)) / 1.04;
    const airyBreeze = Math.sin(i * 0.015) * 0.05 * lastOut;
    data[i] = lastOut * 0.7 + airyBreeze;
  }

  cachedNoiseBuffer = buffer;
  return buffer;
}
