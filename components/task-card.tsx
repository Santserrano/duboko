'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, Timer, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskProps {
  id: string;
  title: string;
  estimatedTime: number;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({
  id,
  title,
  estimatedTime,
  onDelete,
  onComplete,
  isDragging,
}: TaskProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    if (checked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onComplete(id);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-2 backdrop-blur-sm transition-all ${isDragging ? 'ring-2 ring-orange-500' : ''}`}
    >
      <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-5 w-5 text-white/40" />
      </div>

      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckboxChange}
        className="h-4 w-4 border-white/20 data-[state=checked]:bg-orange-500"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="text-sm font-medium text-white truncate">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
          <Timer className="h-3 w-3 text-white/70" />
          <span className="text-xs text-white/70">{estimatedTime}min</span>
        </div>

        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/70"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
