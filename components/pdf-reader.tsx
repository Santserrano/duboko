import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DraggableWindow from './draggable-window';
import { Upload, Link, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFReaderProps {
  onClose: () => void;
}

export default function PDFReader({ onClose }: PDFReaderProps) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdf, setShowPdf] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 700, height: 550 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setShowPdf(true);
    }
  };

  const handleUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowPdf(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setWindowSize({ width: window.innerWidth - 100, height: window.innerHeight - 100 });
      setPosition({ x: 50, y: 20 });
    } else {
      setWindowSize({ width: 700, height: 550 });
      setPosition({ x: 20, y: 20 });
    }
  };

  return (
    <DraggableWindow
      title="PDF Reader"
      onClose={onClose}
      defaultWidth={700}
      defaultHeight={550}
      resizable={true}
      size={windowSize}
      position={position}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primar text-stone-300" />
            <h2 className="text-lg font-semibold text-white">PDF Viewer</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleFullscreen}
              className="hover:bg-secondary"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-stone-300" />
              ) : (
                <Maximize2 className="h-4 w-4 text-stone-300" />
              )}
            </Button>
          </div>
        </div>

        <div className={cn('flex-1 p-4', !showPdf && 'flex items-center justify-center')}>
          {!showPdf ? (
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Open PDF Document</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a file from your device or enter a URL
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full h-24 border-2 border-dashed"
                  >
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Drop PDF here or click to upload</span>
                    </label>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <Input
                    type="url"
                    placeholder="Enter PDF URL"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    required
                    className="w-full"
                  />
                  <Button type="submit" className="w-full">
                    <Link className="mr-2 h-4 w-4" />
                    Open from URL
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-lg overflow-hidden border bg-card">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                style={{ minHeight: windowSize.height - 140 }}
              />
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
