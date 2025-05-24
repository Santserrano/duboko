import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DraggableWindow from './draggable-window';
import { Fullscreen, Minimize2, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  onClose: () => void;
}

export default function YouTubePlayer({ onClose }: YouTubePlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 700, height: 480 });

  useEffect(() => {
    if (isExpanded) {
      const expandedSize = { width: 1000, height: 600 };
      const centerPosition = {
        x: (window.innerWidth - expandedSize.width) / 2,
        y: (window.innerHeight - expandedSize.height) / 2,
      };
      setWindowSize(expandedSize);
      setPosition(centerPosition);
    } else {
      const defaultSize = { width: 700, height: 480 };
      const defaultPosition = {
        x: (window.innerWidth - defaultSize.width) / 2,
        y: (window.innerHeight - defaultSize.height) / 2,
      };
      setWindowSize(defaultSize);
      setPosition(defaultPosition);
    }
  }, [isExpanded]);

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <div
      className={cn(
        'inset-0 flex items-center justify-center transition-all duration-300',
        isExpanded ? 'z-[200]' : 'z-[100]'
      )}
    >
      {isExpanded && (
        <div className="fixed inset-0 backdrop-blur-sm z-[150]" style={{ pointerEvents: 'none' }} />
      )}

      <DraggableWindow
        title="YouTube"
        onClose={onClose}
        resizable={!isExpanded}
        className={cn(isExpanded ? 'fixed z-[200]' : 'z-[100]')}
        size={windowSize}
        position={position}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-secondary"
              >
                {isExpanded ? (
                  <Minimize2 className="h-2 w-2 text-stone-300" />
                ) : (
                  <Fullscreen className="h-2 w-2 text-stone-300" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 p-2">
            {!videoId ? (
              <div className="w-full max-w-md mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl text-white font-semibold">Watch YouTube Video</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a YouTube video URL to start watching
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full"
                    />
                    <Button type="submit" className="w-full">
                      <Link2 className="mr-2 h-4 w-4" />
                      Play video
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div
                className={cn(
                  'relative w-full rounded-lg overflow-hidden',
                  isExpanded ? 'h-[500px]' : 'h-[400px]'
                )}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
      </DraggableWindow>
    </div>
  );
}
