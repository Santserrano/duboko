import { useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';

interface DraggableWindowProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  resizable?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  onDrag?: (position: { x: number; y: number }) => void; // Callback para notificar posición
}

export default function DraggableWindow({
  children,
  onClose,
  resizable = false,
  defaultWidth = 400,
  defaultHeight = 300,
  className = '',
  size = { width: defaultWidth, height: defaultHeight },
  position: initialPosition = { x: 0, y: 0 }, // Inicia en (0,0)
  onDrag,
}: DraggableWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [windowSize, setWindowSize] = useState(size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const stableSize = useMemo(() => size, [size]);
  const stablePosition = useMemo(() => initialPosition, [initialPosition]);

  useEffect(() => {
    setPosition(stablePosition);
    setWindowSize(stableSize);
  }, [stablePosition, stableSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;

    if (target.dataset.draggable === 'true') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }

    if (resizable && target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        width: windowSize.width,
        height: windowSize.height,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPosition(newPosition);

      if (onDrag) onDrag(newPosition);
    }

    if (isResizing) {
      setWindowSize({
        width: Math.max(200, resizeStart.width + (e.clientX - resizeStart.x)),
        height: Math.max(100, resizeStart.height + (e.clientY - resizeStart.y)),
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onDrag]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove]);

  return (
    <div
      className={`absolute bg-black/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'default',
      }}
    >
      {/* Barra de título */}
      <div
        className="px-2 pt-1 flex justify-end cursor-grab"
        data-draggable="true"
        onMouseDown={handleMouseDown}
      >
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4" style={{ height: `calc(100% - 32px)` }}>
        {children}
      </div>
      {/* Esquina de redimensionado */}
      {resizable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
}