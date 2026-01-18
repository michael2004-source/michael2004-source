// A global audio context to avoid creating multiple instances.
const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

/**
 * Decodes a base64 string into a Uint8Array of bytes.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array of the decoded data.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use.
 * @param sampleRate The sample rate of the audio.
 * @param numChannels The number of channels.
 * @returns A promise that resolves with the decoded AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  // FIX: Corrected typo from dataInt116 to dataInt16.
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Plays a base64 encoded audio string.
 * @param base64Audio The base64 encoded raw PCM audio string.
 */
export async function playAudio(base64Audio: string) {
  try {
    if (outputAudioContext.state === 'suspended') {
      await outputAudioContext.resume();
    }
    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
}