'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import DraggableWindow from './draggable-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSiteIcon } from '../utils/get-site-icon';
import { saveBookmark, getUserBookmarks, deleteBookmark } from '@/actions/bookmark';
import { useAuth } from '@clerk/nextjs';

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

interface LinksScene {
  onClose: () => void;
}

export default function Links({ onClose }: LinksScene) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });
  const { isSignedIn } = useAuth(); // Detectar si el usuario está autenticado
  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 300, height: 400 });
  const [loading, setLoading] = useState(true);

  const handleAddBookmark = async () => {
    if (newBookmark.url) {
      const newEntry = {
        id: crypto.randomUUID(),
        title: newBookmark.title || newBookmark.url,
        url: newBookmark.url,
      };

      if (isSignedIn) {
        const response = await saveBookmark({ title: newEntry.title, url: newEntry.url });
        if (response.success) {
          setBookmarks([...bookmarks, response.bookmark]);
          localStorage.setItem('bookmarks', JSON.stringify([...bookmarks, response.bookmark]));
        }
      } else {
        setBookmarks([...bookmarks, newEntry]);
        localStorage.setItem('bookmarks', JSON.stringify([...bookmarks, newEntry]));
      }

      setNewBookmark({ title: '', url: '' });
      setIsAdding(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    if (isSignedIn) {
      await deleteBookmark(id);
    }

    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  useEffect(() => {
    if (isSignedIn) {
      const cachedBookmarks = localStorage.getItem('bookmarks');

      if (cachedBookmarks) {
        // Si ya hay datos guardados en localStorage, cargarlos
        setBookmarks(JSON.parse(cachedBookmarks));
        setLoading(false); // Dejar de cargar si ya tenemos datos
      } else {
        setLoading(true); // Empezar a cargar si no hay datos
        getUserBookmarks()
          .then((fetchedBookmarks) => {
            setBookmarks(fetchedBookmarks);
            localStorage.setItem('bookmarks', JSON.stringify(fetchedBookmarks)); // Guardar en localStorage
          })
          .finally(() => setLoading(false)); // Terminar la carga
      }
    } else {
      setLoading(false); // Si no está autenticado, solo dejamos de cargar
    }
  }, [isSignedIn]);

  return (
    <DraggableWindow
      title="Links"
      onClose={onClose}
      defaultWidth={300}
      defaultHeight={400}
      resizable={false} // Desactivamos el redimensionamiento
      size={windowSize}
      position={position}
      className="text-white"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex gap-2"> Favorites 📁 </h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} />
          </Button>
        </div>

        {isAdding && (
          <div className="mb-2 space-y-2 p-3 bg-white/5 rounded-lg">
            <Input
              placeholder="Title"
              value={newBookmark.title}
              onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
              className="bg-black/30 border-white/10"
            />
            <Input
              placeholder="URL"
              value={newBookmark.url}
              onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
              className="bg-black/30 border-white/10"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="w-full" onClick={handleAddBookmark}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsAdding(false);
                  setNewBookmark({ title: '', url: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="mt-2 text-sm text-white">Cargando bookmarks...</p>
          </div>
        )}

        {!loading && bookmarks.length === 0 ? (
          <p className="text-white/50 text-center text-sm mt-8">
            Bookmark your favorite links to quick-access.
          </p>
        ) : (
          <div className="space-y-1">
            {bookmarks.map((bookmark) => {
              const Icon = getSiteIcon(bookmark.url);
              return (
                <a
                  key={bookmark.id}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <Icon size={18} className="text-white/70" />
                  <span className="text-sm flex-1 truncate">{bookmark.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveBookmark(bookmark.id);
                    }}
                  >
                    <Plus className="rotate-45" size={8} />
                  </Button>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </DraggableWindow>
  );
}
