'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// Guardar un bookmark en Supabase
export const saveBookmark = async ({ title, url }: { title: string; url: string }) => {
  const user = await currentUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  try {
    const newBookmark = await prisma.bookmark.create({
      data: {
        title,
        url,
        userId: user.id, // Guardamos solo el userId sin relación con `User`
      },
    });

    return { success: true, bookmark: newBookmark };
  } catch (error) {
    return { success: false, message: 'Failed to save bookmark.' };
  }
};

// Obtener los bookmarks del usuario autenticado
export const getUserBookmarks = async () => {
  const user = await currentUser();
  if (!user) return [];

  return await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
};

// Eliminar un bookmark
export const deleteBookmark = async (bookmarkId: string) => {
  const user = await currentUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  try {
    await prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId: user.id, // Solo permite borrar si el bookmark pertenece al usuario
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to delete bookmark.' };
  }
};
