'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// Obtener las estadísticas de estudio del usuario
export async function fetchStudyStats() {
  const user = await currentUser();
  if (!user) throw new Error('User is not authenticated.');

  const userId = user.id;

  // Buscar todas las sesiones de estudio del usuario
  const sessions = await prisma.studySession.findMany({
    where: { userId },
    orderBy: { date: 'asc' }, // Asegura orden cronológico
    include: { completedTasks: true },
  });

  if (!sessions.length) {
    return {
      minutesListened: 0,
      sessionsCompleted: 0,
      totalHours: 0,
      dayStreak: 0,
      dailyStats: [],
      sessions: [],
    };
  }

  // Procesar las estadísticas
  const totalMinutes = sessions.reduce((acc, session) => acc + session.totalTime, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const sessionsCompleted = sessions.length;

  // Calcular la racha de días consecutivos
  let streak = 1;
  for (let i = sessions.length - 1; i > 0; i--) {
    const prevDate = new Date(sessions[i - 1].date).setHours(0, 0, 0, 0);
    const currentDate = new Date(sessions[i].date).setHours(0, 0, 0, 0);
    if (currentDate - prevDate === 24 * 60 * 60 * 1000) {
      streak++;
    } else {
      break;
    }
  }

  // Generar estadísticas diarias
  const dailyStats = sessions.map((session) => ({
    date: session.date,
    totalTime: session.totalTime, // Tiempo total de estudio (en minutos)
    breakTime: session.breakTime, // Tiempo de descanso (en minutos)
    completedTasks: session.completedTasks.length, // Número de tareas completadas
  }));

  return {
    minutesListened: totalMinutes,
    sessionsCompleted,
    totalHours,
    dayStreak: streak,
    dailyStats,
    sessions,
  };
}
