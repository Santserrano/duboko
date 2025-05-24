import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import DraggableWindow from './draggable-window';
import { MetricCard } from './metric-card';
import { SessionCard } from './session-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SessionDetails } from './session-details';
import { useStudyStats } from '@/hooks/useStudyStats';

interface StudyStatsProps {
  onClose: () => void;
}

interface CompletedTask {
  title: string;
  estimatedTime: number;
}

interface Session {
  date: string;
  focusTime: number;
  breakTime: number;
  completedTasks: CompletedTask[];
}

interface DailyStat {
  date: string;
  studyTime: number;
  breakTime: number;
}

interface StudyStats {
  minutesListened: number;
  sessionsCompleted: number;
  totalHours: number;
  dayStreak: number;
  dailyStats: DailyStat[];
  sessions: Session[];
}

const demoStats: StudyStats = {
  minutesListened: 2460,
  sessionsCompleted: 15,
  totalHours: 41,
  dayStreak: 7,
  dailyStats: Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      studyTime: Math.floor(Math.random() * 180 + 60),
      breakTime: Math.floor(Math.random() * 60 + 30),
    };
  }),
  sessions: Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const formattedDate = date.toISOString();
    return {
      date: formattedDate,
      focusTime: Math.floor(Math.random() * 180 + 60),
      breakTime: Math.floor(Math.random() * 60 + 30),
      completedTasks: [
        { title: 'Demo Task 1', estimatedTime: 45 },
        { title: 'Demo Task 2', estimatedTime: 30 },
      ],
    };
  }),
};

export default function StudyStats({ onClose }: StudyStatsProps) {
  const { isSignedIn } = useAuth();
  const { stats } = useStudyStats();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 500, height: 400 });
  const [isHovered, setIsHovered] = useState(false);
  const [cachedStats, setCachedStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedStats);

  const activeStats = isSignedIn
    ? stats && Object.keys(stats).length > 0
      ? stats
      : cachedStats
    : demoStats;

  useEffect(() => {
    if (!cachedStats) {
      const storedStats = localStorage.getItem('studyStats');
      if (storedStats) {
        try {
          const parsedStats = JSON.parse(storedStats) as StudyStats;
          setCachedStats(parsedStats);
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing stored stats:', error);
        }
      }
    }
  }, [cachedStats]);

  useEffect(() => {
    if (isSignedIn && stats && Object.keys(stats).length > 0) {
      localStorage.setItem('studyStats', JSON.stringify(stats));
      setCachedStats(stats as StudyStats);
      setIsLoading(false);
    }
  }, [isSignedIn, stats]);

  useEffect(() => {
    if (!isSignedIn) {
      localStorage.removeItem('studyStats');
      setCachedStats(null);
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!stats && cachedStats) {
      setIsLoading(false);
    }
  }, [cachedStats, stats]);

  const formatTime = (value: number) => {
    if (!value) return '0:00';
    const totalSeconds = value * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeStats) {
    return null;
  }

  const formattedDailyStats = activeStats.dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'long',
      year: 'numeric',
    }),
    studyTime: stat.studyTime,
    breakTime: stat.breakTime,
  }));

  const formattedSessions = activeStats.sessions.map((session) => ({
    ...session,
    date: new Date(session.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'long',
      year: 'numeric',
    }),
  }));

  if (selectedSession) {
    return (
      <SessionDetails
        date={new Date(selectedSession.date + 'Z').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        focusTime={formatTime(selectedSession.focusTime)}
        breakTime={formatTime(selectedSession.breakTime)}
        tasks={selectedSession.completedTasks.map((task) => ({
          name: task.title,
          plannedTime: formatTime(task.estimatedTime),
          spentTime: formatTime(task.estimatedTime),
        }))}
        onBack={() => setSelectedSession(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <DraggableWindow
      title="Study Statistics"
      onClose={onClose}
      defaultWidth={500}
      defaultHeight={400}
      resizable={false}
      size={windowSize}
      position={position}
    >
      <div
        className="relative space-y-3 bg-transparent p-4 custom-scrollbar overflow-y-auto h-[310px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {!isSignedIn && isHovered && (
              <div className="absolute inset-0 h-400 flex items-center rounded-lg justify-center bg-transparent transition-all duration-300 backdrop-blur-sm z-[400]">
                <div className="text-center p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Inicia sesión para trackear tu estudio
                  </h3>
                  <p className="text-gray-300">
                    Obtén acceso a estadísticas personalizadas y seguimiento detallado
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <MetricCard value={activeStats.minutesListened} label="Min. total" />
              <MetricCard value={activeStats.sessionsCompleted} label="Sessions" />
              <MetricCard value={activeStats.totalHours} label="Total hours" />
              <MetricCard value={activeStats.dayStreak} label="Day streak" />
            </div>

            <div className="rounded-lg bg-black/20 backdrop-blur-sm p-4 border border-white/10">
              <ChartContainer
                config={{
                  studyTime: {
                    label: 'Focus time',
                    color: 'hsl(24, 100%, 50%)',
                  },
                  breakTime: {
                    label: 'Break time',
                    color: 'hsl(24, 70%, 70%)',
                  },
                }}
                className="h-[200px]"
              >
                <BarChart data={formattedDailyStats}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="studyTime"
                    fill="hsl(24, 100%, 50%)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="breakTime"
                    fill="hsl(24, 70%, 70%)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Sessions List */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Sessions</h2>
              <div className="space-y-2">
                {formattedSessions.map((session, index) => (
                  <SessionCard
                    key={index}
                    title={session.date}
                    duration={formatTime(session.focusTime)}
                    date={session.date}
                    onSeeDetails={() => setSelectedSession(session)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DraggableWindow>
  );
}
