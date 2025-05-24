'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// Verifica si el usuario está en la base de datos y lo crea si no existe
const ensureUserInDatabase = async () => {
  const user = await currentUser();
  if (!user) throw new Error('User is not authenticated.');

  const userId = user.id;
  const email = user.emailAddresses[0]?.emailAddress || '';

  let dbUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: user.firstName || '',
      },
    });
  }

  return userId;
};

// Guardar una sesión Pomodoro
export const savePomodoroSession = async ({
  focusTime,
  breakTime,
  totalTime,
  completedTasks,
}: {
  focusTime: number;
  breakTime: number;
  totalTime: number;
  completedTasks: { title: string; estimatedTime: number }[];
}) => {
  const userId = await ensureUserInDatabase();

  const today = new Date().toISOString().split('T')[0];

  // Obtener la última sesión del usuario
  const lastSession = await prisma.studySession.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  // Calcular la racha
  const streak =
    lastSession &&
    lastSession.date &&
    new Date(lastSession.date).toDateString() ===
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
      ? lastSession.streak + 1
      : 1;

  // Guardar la nueva sesión
  const newSession = await prisma.studySession.create({
    data: {
      userId,
      date: new Date(today),
      focusTime,
      breakTime,
      totalTime,
      streak,
      completedTasks: {
        create: completedTasks.map((task) => ({
          title: task.title,
          estimatedTime: task.estimatedTime,
          completed: true,
        })),
      },
    },
  });

  return newSession;
};
