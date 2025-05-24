'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getGroups } from '@/actions/notes';
import { useUser } from '@clerk/nextjs';

// Interfaces
interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string;
}

interface NoteGroup {
  id: string;
  name: string;
  notes: Note[];
}

interface NotesContextType {
  groups: NoteGroup[];
  loading: boolean;
  setGroups: (groups: NoteGroup[]) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();
  const [groups, setGroups] = useState<NoteGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn && user) {
        // Usuario autenticado - usar base de datos
        const userId = user.id;
        const cacheKey = `notes_cache_${userId}`;

        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          setGroups(JSON.parse(cachedData));
          setLoading(false);
        } else {
          try {
            const fetchedGroups = await getGroups();
            setGroups(fetchedGroups);
            localStorage.setItem(cacheKey, JSON.stringify(fetchedGroups));
          } catch (error) {
            console.error('Error fetching groups:', error);
          } finally {
            setLoading(false);
          }
        }
      } else {
        // Usuario no autenticado - usar localStorage
        const localGroups = localStorage.getItem('local_notes');
        if (localGroups) {
          setGroups(JSON.parse(localGroups));
        } else {
          setGroups([]);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [isSignedIn, user]);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!loading) {
      if (isSignedIn && user) {
        localStorage.setItem(`notes_cache_${user.id}`, JSON.stringify(groups));
      } else {
        localStorage.setItem('local_notes', JSON.stringify(groups));
      }
    }
  }, [groups, isSignedIn, user, loading]);

  return (
    <NotesContext.Provider value={{ groups, setGroups, loading }}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within a NotesProvider');
  return context;
}
