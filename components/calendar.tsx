'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, XCircleIcon } from 'lucide-react';
import DraggableWindow from './draggable-window';
import { cn } from '@/lib/utils';
import { getUserReminders, saveReminder, deleteReminder } from '@/actions/reminders';

interface CalendarProps {
  onClose: () => void;
}

interface Reminder {
  id: string;
  date: Date;
  note: string;
}

export default function Calendar({ onClose }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 400, height: 450 });

  // Obtener recordatorios al montar el componente
  useEffect(() => {
    const fetchReminders = async () => {
      const userReminders = await getUserReminders();
      setReminders(userReminders);
    };

    fetchReminders();
  }, []);

  // Agregar recordatorio en la base de datos
  const addReminder = async () => {
    if (selectedDate && note.trim() !== '') {
      const response = await saveReminder({ date: selectedDate, note });
      if (response.success && response.reminder) {
        setReminders([...reminders, response.reminder]);
        setNote('');
      }
    }
  };

  // Eliminar recordatorio de la base de datos
  const removeReminder = async (id: string) => {
    const response = await deleteReminder(id);
    if (response.success) {
      setReminders(reminders.filter((reminder) => reminder.id !== id));
    }
  };

  // Verificar si una fecha tiene recordatorios
  const hasReminder = (date: Date) => {
    return reminders.some(
      (reminder) => new Date(reminder.date).toDateString() === date.toDateString()
    );
  };

  // Obtener recordatorios de la fecha seleccionada
  const todaysReminders = reminders.filter(
    (reminder) => new Date(reminder.date).toDateString() === selectedDate?.toDateString()
  );

  return (
    <DraggableWindow
      title="Calendar"
      onClose={onClose}
      defaultWidth={400}
      defaultHeight={450}
      resizable={false}
      size={windowSize}
      position={position}
    >
      <div className="flex flex-col h-full bg-transparent text-white overflow-y-auto max-h-[400px] custom-scrollbar">
        <div className="p-4 space-y-4">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className={cn(
              'rounded-lg border border-stone-700 bg-stone-800/50 backdrop-blur-sm',
              'shadow-xl hover:shadow-stone-500/10 transition-shadow duration-300'
            )}
            modifiers={{
              hasReminder: (date) => hasReminder(date),
            }}
            modifiersClassNames={{
              hasReminder: 'bg-stone-600 text-white hover:bg-stone-700 transition-colors',
            }}
          />

          <div className="space-y-2">
            <div className="relative">
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a reminder"
                className="bg-stone-800/50 border-stone-700 text-white placeholder:text-gray-400
                         focus:ring-orange-500 focus:border-orange-500 pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addReminder();
                  }
                }}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            </div>
            <Button
              onClick={addReminder}
              className="w-full bg-stone-600 hover:bg-stone-900
                       border-none shadow-lg hover:shadow-stone-600 transition-shadow"
            >
              Add Reminder
            </Button>
          </div>
        </div>

        <div className="flex-1 px-4 pb-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-stone-400" />
            Reminders for {selectedDate?.toLocaleDateString()}
          </h3>
          <ScrollArea className="h-[180px] rounded-lg border border-stone-700 bg-stone-800/50 p-4">
            {todaysReminders.length === 0 ? (
              <p className="text-stone-400 text-center italic">No reminders for this date</p>
            ) : (
              <ul className="space-y-1">
                {todaysReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex items-start gap-1 p-2 rounded-md bg-stone-700/50
                             hover:bg-stone-700 transition-colors group"
                  >
                    <span className="flex-1 text-sm">{reminder.note}</span>
                    <button
                      onClick={() => removeReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity
                               text-stone-400 hover:text-red-400"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>
    </DraggableWindow>
  );
}
