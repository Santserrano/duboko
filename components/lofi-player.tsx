'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Home,
  SkipBack,
  Images,
  SquarePen,
  Play,
  ChartColumnIncreasing,
  BookOpen,
  Pause,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Timer,
  CalendarIcon,
  Youtube,
  User as UserIcon,
  Music,
  Link,
} from 'lucide-react';
import { lofiStations } from '@/data/stations';
import type { PlayerState } from '@/types/radio';
import PomodoroTimer from './pomodoro-timer';
import StudyStats from './study-stats';
import QuickNotes from './quick-notes';
import DailyTasks from './daily-tasks';
import Calendar from './calendar';
import YouTubePlayer from './youtube-player';
import UserProfile from './user-profile';
import WelcomeCard from './welcome-card';
import MusicPlayer from './music-player';
import PDFReader from './pdf-reader';
import Scenes from './scenes';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import SignInApp from './SignIn';
import Links from './links';

export default function LofiPlayer() {
  const { user, isSignedIn } = useUser();

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    volume: 100,
    currentStation: lofiStations[0],
    currentTime: '00:00',
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showPDFReader, setShowPDFReader] = useState(false);
  const [showScenes, setShowScenes] = useState(false);
  const [showLink, setLinkScenes] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sceneCardPosition, setSceneCardPosition] = useState({ top: 0, left: 0 });
  const imagesButtonRef = useRef<HTMLButtonElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSignInVisible, setIsSignInVisible] = useState(false);

  useEffect(() => {
    if (!isSignedIn && user) {
      try {
        const userId = (user as UserResource).id;
        localStorage.removeItem(`notes_cache_${userId}`);
      } catch (error) {
        console.error('Error accessing user id:', error);
      }
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    audioRef.current = new Audio(playerState.currentStation?.url);
    audioRef.current.volume = playerState.volume / 100;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearInterval(timer);
    };
  }, [playerState.currentStation, playerState.volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        })
        .catch(() => {
          // Manejar el error silenciosamente
        });
    }
  }, []);

  useEffect(() => {
    let savedScene = localStorage.getItem('selectedScene');
    if (!savedScene) {
      savedScene = '/wall/scene01.mp4';
      localStorage.setItem('selectedScene', savedScene);
    }
    if (videoRef.current) {
      videoRef.current.src = savedScene;
    }
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4">
        <div className="backdrop-blur-md p-6 rounded-lg border border-white/20">
          <p className="text-xl font-semibold">
            Duboko solo está disponible en versiones de escritorio
          </p>
        </div>
      </div>
    );
  }

  const changeBackgroundScene = (videoSrc: string) => {
    if (videoRef.current) {
      videoRef.current.src = videoSrc;
      videoRef.current.play();
      localStorage.setItem('selectedScene', videoSrc);
    }
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const isAM = hours < 12;
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = isAM ? 'AM' : 'PM';
    return `${hours}:${formattedMinutes} ${period}`;
  };

  const handleScenesButtonClick = () => {
    if (imagesButtonRef.current) {
      const rect = imagesButtonRef.current.getBoundingClientRect();
      setSceneCardPosition({
        top: rect.top - 135,
        left: rect.left + rect.width / 2 - 150,
      });
    }
    setShowScenes(true);
  };

  const closeScenes = () => {
    setShowScenes(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (playerState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    setPlayerState((prev) => ({ ...prev, volume: newVolume }));
  };

  const changeStation = (direction: 'next' | 'prev') => {
    const currentIndex = lofiStations.findIndex(
      (station) => station.id === playerState.currentStation?.id
    );
    const newIndex = (() => {
      let index = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (index >= lofiStations.length) index = 0;
      if (index < 0) index = lofiStations.length - 1;
      return index;
    })();

    const wasPlaying = playerState.isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayerState((prev) => ({
      ...prev,
      currentStation: lofiStations[newIndex],
      isPlaying: wasPlaying,
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const VolumeIcon =
    playerState.volume === 0 ? VolumeX : playerState.volume < 50 ? Volume1 : Volume2;

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        autoPlay
      >
        <source src="/wall/scene01.mp4" type="video/mp4" />
      </video>

      {isSignInVisible && <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm" />}

      {showWelcome && <WelcomeCard onClose={() => setShowWelcome(false)} />}

      {/* Draggable Components */}
      {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)} />}
      {showStats && <StudyStats onClose={() => setShowStats(false)} />}
      {showNotes && <QuickNotes onClose={() => setShowNotes(false)} />}
      {showTasks && <DailyTasks onClose={() => setShowTasks(false)} />}
      {showCalendar && <Calendar onClose={() => setShowCalendar(false)} />}
      {showYouTube && <YouTubePlayer onClose={() => setShowYouTube(false)} />}
      {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}
      {showMusicPlayer && <MusicPlayer onClose={() => setShowMusicPlayer(false)} />}
      {showPDFReader && <PDFReader onClose={() => setShowPDFReader(false)} />}
      {showLink && <Links onClose={() => setLinkScenes(false)} />}

      {showScenes && (
        <div
          style={{
            position: 'absolute',
            top: sceneCardPosition.top,
            left: sceneCardPosition.left,
          }}
          className="z-50 fixed"
        >
          <Scenes onClose={closeScenes} onSceneSelect={changeBackgroundScene} />
        </div>
      )}

      {isSignInVisible && (
        <div className="absolute z-[200] flex items-center justify-center inset-0">
          <div className="relative bg-transparent p-2 rounded-md">
            <button
              onClick={() => setIsSignInVisible(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-800"
            >
              &times;
            </button>
            <SignInApp />
          </div>
        </div>
      )}

      {/* Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-[1200px] p-4">
          <div className="relative border-1 border-zinc-600 rounded-full bg-black/80 backdrop-blur-sm p-2 px-4 flex items-center justify-between text-white">
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">{formatTime(currentTime)}</span>
              </div>

              <div className="flex-1 flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => changeStation('prev')}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {playerState.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => changeStation('next')}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[playerState.volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-24 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-none [&>span:first-child_span]:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowPomodoro(true)}
                >
                  <Timer className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={handleScenesButtonClick}
                  ref={imagesButtonRef}
                >
                  <Images className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowStats(true)}
                >
                  <ChartColumnIncreasing className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowNotes(true)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowCalendar(true)}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowYouTube(true)}
                >
                  <Youtube className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowMusicPlayer(true)}
                >
                  <Music className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setLinkScenes(true)}
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setShowPDFReader(true)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <SignedOut>
                    <Button size="icon" variant="ghost" onClick={() => setIsSignInVisible(true)}>
                      <UserIcon className="h-6 w-6" />
                    </Button>
                  </SignedOut>

                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
