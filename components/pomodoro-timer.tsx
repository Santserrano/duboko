import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import DraggableWindow from './draggable-window';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  Timer,
  Radio,
  TimerIcon,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddTaskDialog } from './add-task-dialog';
import { TaskList } from './task-list';
import { savePomodoroSession } from '../actions/pomodoro';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  onClose: () => void;
}

interface TimerConfig {
  sessions: number;
  pomodoroTime: number;
  breakTime: number;
}

interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
}

export default function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [state, setState] = useState<'waiting' | 'study' | 'break' | 'ended'>('waiting');
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [config, setConfig] = useState<TimerConfig>({
    sessions: 4,
    pomodoroTime: 25,
    breakTime: 5,
  });
  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 360, height: 550 });

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(0);
    setIsBreak(false);
    setCurrentSession(0);
    setState('waiting');
    setProgress(0);
  }, []);

  const endSession = useCallback(async () => {
    const focusTime = config.pomodoroTime * currentSession;
    const breakTime = config.breakTime * (currentSession - 1);
    const totalTime = focusTime + breakTime;
    const completedTasks = tasks.filter((task) => task.completed);

    try {
      await savePomodoroSession({
        focusTime,
        breakTime,
        totalTime,
        completedTasks: completedTasks.map((task) => ({
          title: task.title,
          estimatedTime: task.estimatedTime,
        })),
      });

      resetTimer();
      setState('waiting');
    } catch (error) {
      console.error('Error al guardar la sesión:', error);
    }
  }, [config, currentSession, tasks, resetTimer]);

  useEffect(() => {
    if (state === 'ended') {
      endSession();
    }
  }, [state, endSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          const totalTime = isBreak ? config.breakTime * 60 : config.pomodoroTime * 60;
          const newProgress = ((totalTime - newTime) / totalTime) * 100;
          setProgress(newProgress);
          return newTime;
        });
      }, 1000);
    } else if (time === 0 && isActive) {
      if (isBreak) {
        setTime(config.pomodoroTime * 60);
        setIsBreak(false);
        setState('study');
        setCurrentSession((prev) => prev + 1);
        setProgress(0);
      } else {
        if (currentSession < config.sessions) {
          setTime(config.breakTime * 60);
          setIsBreak(true);
          setState('break');
          setProgress(0);
        } else {
          setIsActive(false);
          setState('ended');
          setProgress(100);
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isBreak, config, currentSession]);

  const toggleTimer = () => {
    if (state === 'waiting') {
      setState('study');
      setCurrentSession(1);
      setTime(config.pomodoroTime * 60);
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSettings = () => {
    setTime(config.pomodoroTime * 60);
    setShowSettings(false);
    resetTimer();
  };

  const getStateStyles = () => {
    switch (state) {
      case 'study':
        return 'from-orange-500/20 to-rose-500/20 text-orange-500';
      case 'break':
        return 'from-blue-500/20 to-cyan-500/20 text-blue-500';
      case 'ended':
        return 'from-green-500/20 to-emerald-500/20 text-green-500';
      default:
        return 'from-neutral-500/20 to-stone-500/20 text-neutral-500';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'study':
        return <Timer className="h-5 w-5" />;
      case 'break':
        return <Radio className="h-5 w-5" />;
      case 'ended':
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <TimerIcon className="h-5 w-5" />;
    }
  };

  const handleAddTask = (title: string, estimatedTime: number) => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      estimatedTime,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  const handleTasksReorder = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTaskComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: true } : task)));
  };

  if (showSettings) {
    return (
      <DraggableWindow
        title="Timer Settings"
        onClose={onClose}
        defaultWidth={330}
        defaultHeight={420}
        resizable={false}
        size={windowSize}
        position={position}
      >
        <Card className="p-6 bg-black/40 border-0">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Number of Sessions</label>
                <Input
                  type="number"
                  value={config.sessions}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      sessions: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                  className="bg-white/10 text-white/80 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Focus Time (minutes)</label>
                <Input
                  type="number"
                  value={config.pomodoroTime}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      pomodoroTime: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                  className="bg-white/10 text-white/80 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Break Time (minutes)</label>
                <Input
                  type="number"
                  value={config.breakTime}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      breakTime: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                  className="bg-white/10 text-white/80 border-white/20"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                className="text-white/80 bg-stone-700"
                variant="ghost"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </div>
        </Card>
      </DraggableWindow>
    );
  }

  return (
    <DraggableWindow
      title="Pomodoro Timer"
      onClose={onClose}
      defaultWidth={360}
      defaultHeight={550}
      resizable={false}
      size={windowSize}
      position={position}
    >
      <Card className="p-2 bg-transparent border-0">
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              className={cn(
                'px-3 py-1.5 bg-gradient-to-r shadow-lg flex items-center gap-2',
                getStateStyles()
              )}
            >
              {getStateIcon()}
              <span className="font-medium">
                {state === 'study' && 'Focus Time'}
                {state === 'break' && 'Break Time'}
                {state === 'ended' && 'Session Complete'}
                {state === 'waiting' && 'Ready to Start'}
              </span>
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-2">
            <div
              className="font-mono text-white text-4xl font-bold tracking-wider"
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            >
              {formatTime(time)}
            </div>
            <div className="text-sm text-white/60">
              Session {currentSession} of {config.sessions}
            </div>
            <div className="relative pt-2">
              <Progress value={progress} className="h-2 w-full bg-white/20" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 text-stone-300" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'rounded-full h-16 w-16 transition-all',
                isActive
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-500'
              )}
              onClick={toggleTimer}
            >
              {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4 text-stone-300" />
            </Button>
          </div>

          {/* Tasks Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/80">Tasks</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-white/60 hover:text-black"
                onClick={() => setIsAddTaskOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <Card className="bg-white/5 border-white/10 p-2 overflow-y-auto max-h-[200px] custom-scrollbar">
        <TaskList
          tasks={tasks}
          onTasksReorder={handleTasksReorder}
          onTaskDelete={handleTaskDelete}
          onTaskComplete={handleTaskComplete}
        />
      </Card>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAddTask={handleAddTask}
      />
    </DraggableWindow>
  );
}
