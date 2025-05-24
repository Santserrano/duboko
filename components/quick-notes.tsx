import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DraggableWindow from './draggable-window';
import { Folder, Plus, File, Loader2, Trash, Maximize, Minimize } from 'lucide-react';
import { addGroup, addNote, updateNote, deleteGroup, deleteNote } from '@/actions/notes';
import { useNotes } from '@/context/NotesProvider';
import RichTextEditor from './RichTextEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUser } from '@clerk/nextjs';

interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string;
}

interface QuickNotesProps {
  onClose: () => void;
}

export default function QuickNotes({ onClose }: QuickNotesProps) {
  const { groups, setGroups, loading } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position] = useState({ x: 20, y: 20 });
  const [windowSize] = useState({ width: 440, height: 520 });
  const { user } = useUser();
  const isAuthenticated = Boolean(user);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      if (isAuthenticated) {
        const createdGroup = await addGroup(newGroupName);
        setGroups([...groups, { ...createdGroup, notes: [] }]);
      } else {
        const newGroup = {
          id: crypto.randomUUID(),
          name: newGroupName,
          notes: [],
        };
        setGroups([...groups, newGroup]);
      }
      setNewGroupName('');
      setShowGroupModal(false);
    } catch (error) {
      console.error('❌ Error al agregar grupo:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      if (isAuthenticated) {
        if (selectedNote.id) {
          const updatedNote = await updateNote(
            selectedNote.id,
            selectedNote.title,
            selectedNote.content
          );
          setGroups(
            groups.map((group) =>
              group.id === updatedNote.groupId
                ? {
                    ...group,
                    notes: group.notes.map((note) =>
                      note.id === updatedNote.id ? updatedNote : note
                    ),
                  }
                : group
            )
          );
        } else {
          const newNote = await addNote(
            selectedNote.title,
            selectedNote.content,
            selectedNote.groupId
          );
          setGroups(
            groups.map((group) =>
              group.id === newNote.groupId ? { ...group, notes: [...group.notes, newNote] } : group
            )
          );
        }
      } else {
        if (selectedNote.id) {
          setGroups(
            groups.map((group) =>
              group.id === selectedNote.groupId
                ? {
                    ...group,
                    notes: group.notes.map((note) =>
                      note.id === selectedNote.id ? selectedNote : note
                    ),
                  }
                : group
            )
          );
        } else {
          const newNote = {
            ...selectedNote,
            id: crypto.randomUUID(),
          };
          setGroups(
            groups.map((group) =>
              group.id === newNote.groupId ? { ...group, notes: [...group.notes, newNote] } : group
            )
          );
        }
      }
      setSelectedNote(null);
    } catch (error) {
      console.error('❌ Error al guardar la nota:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (
      !confirm(
        '¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.'
      )
    )
      return;
    try {
      if (isAuthenticated) {
        await deleteGroup(groupId);
      }
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error('❌ Error al eliminar grupo:', error);
    }
  };

  const handleDeleteNote = async (noteId: string, groupId: string) => {
    if (
      !confirm('¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.')
    )
      return;
    try {
      if (isAuthenticated) {
        await deleteNote(noteId);
      }
      setGroups(
        groups.map((group) =>
          group.id === groupId
            ? { ...group, notes: group.notes.filter((note) => note.id !== noteId) }
            : group
        )
      );
    } catch (error) {
      console.error('❌ Error al eliminar nota:', error);
    }
  };

  return (
    <>
      <DraggableWindow
        title="Quick Notes"
        onClose={onClose}
        defaultWidth={400}
        defaultHeight={350}
        resizable={false}
        size={windowSize}
        position={position}
      >
        <div className="h-full flex flex-col text-white relative p-2">
          {isAuthenticated && loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
              <Loader2 className="h-8 w-8 animate-spin text-stone-50" />
              <p className="mt-2 text-sm text-stone-300">Sincronizando...</p>
            </div>
          ) : !selectedNote ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-stone-50">Notas 📁</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGroupModal(true)}
                    className="text-stone-300 hover:text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Grupo
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4 custom-scrollbar overflow-y-auto h-[400px]">
                  {groups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-stone-400" />
                          <span className="font-medium text-stone-200">{group.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSelectedNote({ id: '', title: '', content: '', groupId: group.id })
                            }
                            className="h-8 px-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="h-8 px-2 text-red-400 hover:text-red-300"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="pl-6 space-y-1">
                        {group.notes.map((note) => (
                          <button
                            key={note.id}
                            className="flex items-center w-full hover:bg-stone-800/50 p-2 rounded-lg text-left group/note"
                            onClick={() => setSelectedNote(note)}
                          >
                            <File className="h-4 w-4 text-stone-400 mr-2 flex-shrink-0" />
                            <span className="flex-1 truncate text-stone-300">
                              {note.title || 'Sin título'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id, group.id);
                              }}
                              className="h-8 px-2 opacity-0 group-hover/note:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                  className="flex-1 p-2 bg-transparent border-b border-stone-700 text-base font-semibold focus:outline-none focus:border-stone-500"
                  placeholder="Título de la nota"
                />
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <RichTextEditor
                  content={selectedNote.content}
                  onChange={(content) => setSelectedNote({ ...selectedNote, content })}
                />
              </div>

              <div className="flex justify-between mt-2">
                <Button variant="ghost" onClick={() => setSelectedNote(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNote}>Guardar</Button>
              </div>
            </div>
          )}
        </div>
      </DraggableWindow>

      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-[425px] bg-stone-950 text-stone-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nuevo Grupo</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-600"
              placeholder="Nombre del grupo"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowGroupModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGroup}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
