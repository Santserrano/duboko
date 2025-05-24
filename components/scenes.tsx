import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const scenes = [
  { id: 1, name: 'Scene 1', videoSrc: '/wall/scene01.mp4', imageSrc: '/wall/canvas/01.png' },
  { id: 2, name: 'Scene 2', videoSrc: '/wall/scene02.mp4', imageSrc: '/wall/canvas/02.png' },
  { id: 3, name: 'Scene 3', videoSrc: '/wall/scene03.mp4', imageSrc: '/wall/canvas/03.png' },
  { id: 4, name: 'Scene 4', videoSrc: '/wall/scene04.mp4', imageSrc: '/wall/canvas/04.png' },
  { id: 5, name: 'Scene 5', videoSrc: '/wall/scene05.mp4', imageSrc: '/wall/canvas/05.png' },
  { id: 6, name: 'Scene 6', videoSrc: '/wall/scene06.mp4', imageSrc: '/wall/canvas/06.png' },
  { id: 7, name: 'Scene 7', videoSrc: '/wall/scene07.mp4', imageSrc: '/wall/canvas/07.png' },
  { id: 8, name: 'Scene 8', videoSrc: '/wall/scene08.mp4', imageSrc: '/wall/canvas/08.png' },
  { id: 9, name: 'Scene 9', videoSrc: '/wall/scene09.mp4', imageSrc: '/wall/canvas/09.png' },
  { id: 10, name: 'Scene 10', videoSrc: '/wall/scene10.mp4', imageSrc: '/wall/canvas/10.png' },
  { id: 11, name: 'Scene 11', videoSrc: '/wall/scene11.mp4', imageSrc: '/wall/canvas/11.png' },
  { id: 12, name: 'Scene 12', videoSrc: '/wall/scene12.mp4', imageSrc: '/wall/canvas/12.png' },
  { id: 13, name: 'Scene 13', videoSrc: '/wall/scene13.mp4', imageSrc: '/wall/canvas/13.png' },
  { id: 14, name: 'Scene 14', videoSrc: '/wall/scene14.mp4', imageSrc: '/wall/canvas/14.png' },
  { id: 15, name: 'Scene 15', videoSrc: '/wall/scene15.mp4', imageSrc: '/wall/canvas/15.png' },
  { id: 16, name: 'Scene 16', videoSrc: '/wall/scene16.mp4', imageSrc: '/wall/canvas/16.png' },
];

interface ScenesProps {
  onClose: () => void;
  onSceneSelect: (videoSrc: string) => void;
}

export default function Scenes({ onClose, onSceneSelect }: ScenesProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [cachedImages, setCachedImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadImages = async () => {
      const newCachedImages: { [key: string]: string } = {};
      for (const scene of scenes) {
        const cachedImage = localStorage.getItem(scene.imageSrc);
        if (cachedImage) {
          newCachedImages[scene.imageSrc] = cachedImage;
        } else {
          try {
            const response = await fetch(scene.imageSrc);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              localStorage.setItem(scene.imageSrc, base64data);
              setCachedImages((prev) => ({ ...prev, [scene.imageSrc]: base64data }));
            };
            reader.readAsDataURL(blob);
          } catch (error) {
            console.error('Error loading image:', error);
          }
        }
      }
      setCachedImages(newCachedImages);
    };

    loadImages();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('scene-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  return (
    <div className="fixed max-w-lg bg-black/40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20">
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-gray-300 hover:text-gray-800 z-[999]"
        aria-label="Close scene selector"
      >
        <X size={12} />
      </button>
      <div className="relative">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full z-10"
          aria-label="Scroll left"
          disabled={scrollPosition <= 0}
        >
          <ChevronLeft color="#ffff" size={16} />
        </button>
        <div id="scene-container" className="flex overflow-x-auto space-x-3 p-3 scrollbar-hide">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="flex-none w-28 h-24 cursor-pointer"
              onClick={() => {
                localStorage.setItem('selectedScene', scene.videoSrc);
                onSceneSelect(scene.videoSrc);
                onClose();
              }}
            >
              <Image
                src={cachedImages[scene.imageSrc] || scene.imageSrc}
                alt={scene.name}
                width={300}
                height={150}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full z-10"
          aria-label="Scroll right"
          disabled={scrollPosition >= (scenes.length - 1) * 200}
        >
          <ChevronRight color="#ffff" size={16} />
        </button>
      </div>
    </div>
  );
}
