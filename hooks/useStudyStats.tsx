import { useEffect, useState } from 'react';
import { fetchStudyStats } from '@/actions/stats'; // Función para obtener datos desde la base de datos.

export function useStudyStats() {
  const [stats, setStats] = useState({
    minutesListened: 0,
    sessionsCompleted: 0,
    totalHours: 0,
    dayStreak: 0,
    dailyStats: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStudyStats(); // Traer datos desde la API/BD.
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, setStats };
}
