export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  currentStation: RadioStation | null;
  currentTime: string;
}
