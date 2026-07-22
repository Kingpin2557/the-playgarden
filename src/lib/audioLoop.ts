let sharedContext: AudioContext | null = null;

function getContext() {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

const bufferCache = new Map<string, Promise<AudioBuffer>>();

function loadBuffer(url: string) {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const context = getContext();
  const buffer = fetch(url)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data));
  bufferCache.set(url, buffer);
  return buffer;
}


function createGain(context: AudioContext, volume: number) {
  const gain = context.createGain();
  gain.gain.value = volume;
  gain.connect(context.destination);
  return gain;
}

export async function playOneShot(url: string, volume: number) {
  const context = getContext();
  const buffer = await loadBuffer(url);
  context.resume();

  const gain = createGain(context, volume);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start();
  source.onended = () => {
    source.disconnect();
    gain.disconnect();
  };
}

export function createAudioLoop(volume: number) {
  const context = getContext();
  const gain = createGain(context, volume);

  let source: AudioBufferSourceNode | null = null;
  let currentUrl: string | null = null;

  function stop() {
    source?.stop();
    source?.disconnect();
    source = null;
    currentUrl = null;
  }

  async function play(url: string) {
    if (currentUrl === url) return;
    stop();
    currentUrl = url;

    const buffer = await loadBuffer(url);
    if (currentUrl !== url) return;

    context.resume();
    source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
  }

  return { play, stop };
}
