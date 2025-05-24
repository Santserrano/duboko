'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import DraggableWindow from './draggable-window';
import {
  Moon,
  Music,
  Coffee,
} from 'lucide-react';
import {
  ZENO_FM_STATIONS,
  AMBIENT_SOUNDS,
  createAudioElement,
  embedSpotifyPlaylist,
} from '@/utils/audio-controls';
import { Alert } from '@heroui/react';

interface MusicPlayerProps {
  onClose: () => void;
}

export default function MusicPlayer({ onClose }: MusicPlayerProps) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [currentStation, setCurrentStation] = useState<string | null>(null);
  const [ambientVolumes, setAmbientVolumes] = useState({
    fire: 0,
    nature: 0,
    rain: 0,
    wind: 0,
  });

  const radioRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundsRef = useRef<Record<string, HTMLAudioElement>>({});

  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 350, height: 550 });

  useEffect(() => {
    const savedAmbientSounds = localStorage.getItem('ambientSounds');
    const currentAmbientSounds = ambientSoundsRef.current;

    if (savedAmbientSounds) {
      try {
        const soundData = JSON.parse(savedAmbientSounds) as Record<string, string>;
        Object.entries(soundData).forEach(([key, src]) => {
          if (typeof src === 'string') {
            setupAudio(key, src);
          }
        });
      } catch (error) {
        console.error('Error parsing ambient sounds:', error);
      }
    } else {
      const sounds = Object.entries(AMBIENT_SOUNDS).reduce(
        (acc, [key, src]) => {
          acc[key] = src;
          setupAudio(key, src);
          return acc;
        },
        {} as Record<string, string>
      );

      localStorage.setItem('ambientSounds', JSON.stringify(sounds));
    }

    return () => {
      Object.values(currentAmbientSounds).forEach((audio) => {
        audio.pause();
      });
    };
  }, []);

  const setupAudio = (key: string, src: string) => {
    const audio = createAudioElement(src);
    audio.loop = true;
    ambientSoundsRef.current[key] = audio;
  };

  const handleVolumeChange = (sound: string, newVolume: number) => {
    setAmbientVolumes((prev) => ({ ...prev, [sound]: newVolume }));

    if (!ambientSoundsRef.current[sound]) {
      setupAudio(sound, AMBIENT_SOUNDS[sound as keyof typeof AMBIENT_SOUNDS]);
    }

    const audio = ambientSoundsRef.current[sound];
    audio.volume = newVolume / 100;

    if (newVolume > 0) {
      if (audio.paused) audio.play();
    } else {
      if (!audio.paused) audio.pause();
    }
  };

  const handleMoodSelect = (mood: string) => {
    if (radioRef.current) {
      radioRef.current.pause();
    }

    if (currentStation === mood) {
      setCurrentStation(null);
      return;
    }

    const audio = new Audio(ZENO_FM_STATIONS[mood as keyof typeof ZENO_FM_STATIONS]);
    audio.play();
    radioRef.current = audio;
    setCurrentStation(mood);
  };

  const handleSpotifyUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && spotifyUrl.includes('spotify.com/playlist/')) {
      setEmbedUrl(embedSpotifyPlaylist(spotifyUrl));
      setSpotifyUrl('');
    }
  };

  const moods = [
    { id: 'sleepy', icon: <Moon className="h-6 w-6" />, label: 'Sleepy' },
    { id: 'jazzy', icon: <Music className="h-6 w-6" />, label: 'Jazzy' },
    { id: 'chill', icon: <Coffee className="h-6 w-6" />, label: 'Chill' },
  ];

  return (
    <DraggableWindow
      title="Music Player"
      onClose={onClose}
      defaultWidth={350}
      defaultHeight={550}
      resizable={false}
      size={windowSize}
      position={position}
    >
      <div className="text-white space-y-3 overflow-y-auto max-h-[450px] px-2 custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Custom playlist ✨</h2>
        </div>

        <Input
          type="text"
          placeholder="Paste a Spotify playlist link"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          onKeyDown={handleSpotifyUrlSubmit}
          className="bg-white/10 border-white/20"
        />

        <div className="grid grid-cols-3 gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`p-2 rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
                currentStation === mood.id ? 'bg-green-500/20' : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => handleMoodSelect(mood.id)}
            >
              {mood.icon}
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-green-900/20 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-xs">Spotify Playlist</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-green-500">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.694.469-1.04.246-2.855-1.742-6.445-2.137-10.667-1.171-.408.096-.82-.148-.917-.558-.096-.408.149-.82.559-.917 4.633-1.059 8.606-.608 11.809 1.359.353.215.444.676.23 1.041zm1.476-3.281c-.303.465-.943.588-1.409.285-3.265-2.007-8.24-2.589-12.098-1.415-.505.156-1.04-.143-1.195-.648-.156-.505.143-1.04.648-1.195 4.406-1.34 9.881-.687 13.649 1.563.465.303.588.943.285 1.409zm.127-3.415c-3.915-2.325-10.377-2.54-14.126-1.405-.604.183-1.244-.157-1.427-.761-.183-.604.157-1.244.761-1.427 4.303-1.307 11.446-1.055 15.944 1.622.559.331.744 1.053.413 1.611-.331.559-1.053.744-1.611.413z" />
            </svg>
          </div>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="mb-1"
            />
          ) : (
            <div className="text-sm text-white/50 text-center py-4">
              Paste a Spotify playlist link above to start listening
            </div>
          )}
        </div>

        <div className="space-y-4 pt-1 px-4">
          <h3 className="font-medium">Sounds 🍃</h3>
          <div className="flex items-center text-xs justify-center w-full">
            <Alert
              color="warning"
              className="gap-2 text-clip"
              description={`Es posible experimentar problemas con los sonidos. Lo solucionaremos pronto.`}
            />
          </div>
          {Object.entries(ambientVolumes).map(([sound, volume]) => (
            <div key={sound} className="flex items-center gap-4">
              <span className="text-sm capitalize w-16">{sound}</span>
              <Slider
                value={[volume]}
                onValueChange={([newValue]) => handleVolumeChange(sound, newValue)}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </DraggableWindow>
  );
}
