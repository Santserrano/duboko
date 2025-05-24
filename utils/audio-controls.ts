export const ZENO_FM_STATIONS = {
  sleepy: 'https://stream.zeno.fm',
  jazzy: 'https://stream.zeno.fm',
  chill: 'https://stream.zeno.fm',
};

export const AMBIENT_SOUNDS = {
  fire: '/sounds/fire.mp3',
  nature: '/sounds/nature.mp3',
  rain: '/sounds/rain.mp3',
  wind: '/sounds/wind.mp3',
};

export function createAudioElement(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.loop = true;
  return audio;
}

export function embedSpotifyPlaylist(url: string): string {
  const playlistId = url.split('/playlist/')[1]?.split('?')[0];
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
}
