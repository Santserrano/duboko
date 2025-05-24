'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// Obtener los recordatorios del usuario autenticado
export const getUserReminders = async () => {
  const user = await currentUser();
  if (!user) return [];

  return await prisma.reminder.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  });
};

// Guardar un recordatorio
export const saveReminder = async ({ date, note }: { date: Date; note: string }) => {
  const user = await currentUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  try {
    const newReminder = await prisma.reminder.create({
      data: {
        date,
        note,
        userId: user.id,
      },
    });

    return { success: true, reminder: newReminder };
  } catch (error) {
    return { success: false, message: 'Failed to save reminder.' };
  }
};

// Eliminar un recordatorio
export const deleteReminder = async (reminderId: string) => {
  const user = await currentUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  try {
    await prisma.reminder.deleteMany({
      where: {
        id: reminderId,
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to delete reminder.' };
  }
};
