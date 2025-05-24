'use server';

import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

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

// Obtener los grupos del usuario
export const getGroups = async () => {
  const userId = await ensureUserInDatabase();

  const groups = await prisma.noteGroup.findMany({
    where: { userId },
    include: { notes: true },
  });

  return groups;
};

// Agregar un nuevo grupo
export const addGroup = async (name: string) => {
  const userId = await ensureUserInDatabase();

  const group = await prisma.noteGroup.create({
    data: {
      name,
      userId,
    },
  });

  return group;
};

// Agregar una nota dentro de un grupo
export const addNote = async (title: string, content: string, groupId: string) => {
  const userId = await ensureUserInDatabase();

  const group = await prisma.noteGroup.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) throw new Error('Invalid group ID or access denied.');

  const note = await prisma.note.create({
    data: {
      title,
      content,
      groupId,
    },
  });

  return note;
};

// Actualizar una nota existente
export const updateNote = async (id: string, title: string, content: string) => {
  const userId = await ensureUserInDatabase();

  const note = await prisma.note.findFirst({
    where: {
      id,
      group: { userId },
    },
  });

  if (!note) throw new Error('Note not found or access denied.');

  const updatedNote = await prisma.note.update({
    where: { id },
    data: { title, content },
  });

  return updatedNote;
};

// Eliminar un grupo
export const deleteGroup = async (groupId: string) => {
  const userId = await ensureUserInDatabase();

  const group = await prisma.noteGroup.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) throw new Error('Group not found or access denied.');

  await prisma.noteGroup.delete({
    where: { id: groupId },
  });
};

// Eliminar una nota
export const deleteNote = async (noteId: string) => {
  const userId = await ensureUserInDatabase();

  const note = await prisma.note.findFirst({
    where: { id: noteId, group: { userId } },
  });

  if (!note) throw new Error('Note not found or access denied.');

  await prisma.note.delete({
    where: { id: noteId },
  });
};
