'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (title: string, estimatedTime: number) => void;
}

export function AddTaskDialog({ open, onOpenChange, onAddTask }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(title, estimatedTime);
    setTitle('');
    setEstimatedTime(25);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-stone-950 text-white">
        <DialogHeader>
          <DialogTitle>Agregar nueva tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la tarea</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10"
              placeholder="Ej: Review design sprint"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Tiempo estimado (minutos)</Label>
            <Input
              id="time"
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(Number(e.target.value))}
              className="bg-white/5 border-white/10"
              min={1}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar tarea</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
