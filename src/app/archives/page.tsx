'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Archive, 
  Trash2, 
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotes } from '../../contexts/NoteContext';
import { Note } from '../../services/noteService';
import Navigation from '../../components/Navigation';

export default function ArchivesPage() {
  const { theme, toggleTheme } = useTheme();
  const { 
    getNotesByStatus, 
    unarchiveNote, 
    softDeleteNote, 
    loading, 
    error
  } = useNotes();
  
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArchivedNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const notes = await getNotesByStatus('archived');
      setArchivedNotes(notes);
    } catch (error) {
      console.error('Error loading archived notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getNotesByStatus]);

  useEffect(() => {
    loadArchivedNotes();
  }, [loadArchivedNotes]);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadArchivedNotes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadArchivedNotes]);

  const handleUnarchiveNote = async (noteId: string) => {
    try {
      await unarchiveNote(noteId);
      // Refresh the archived notes list
      await loadArchivedNotes();
    } catch (error) {
      console.error('Error unarchiving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await softDeleteNote(noteId);
      // Refresh the archived notes list
      await loadArchivedNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-primary theme-text-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 theme-text-tertiary" />
            <p className="theme-text-secondary">Loading archived notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mt-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b theme-border theme-shadow">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <Archive className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Archive</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:theme-bg-tertiary transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 theme-text-tertiary" />
            ) : (
              <Sun className="h-5 w-5 theme-text-tertiary" />
            )}
          </button>
          <button
            onClick={loadArchivedNotes}
            disabled={loading}
            className="p-2 rounded-full hover:theme-bg-tertiary transition-colors disabled:opacity-50"
            title="Refresh archived notes"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 theme-text-tertiary animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5 theme-text-tertiary hover:theme-text-primary" />
            )}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 theme-bg-secondary min-h-screen p-4 border-r theme-border">
          <Navigation />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
        {archivedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Archive className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium theme-text-secondary mb-2">No archived notes</h3>
            <p className="theme-text-tertiary">Notes you archive will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {archivedNotes.map((note) => (
              <div
                key={note.id}
                className={`sticky-note sticky-note-${note.color || 'yellow'} p-4 rounded-lg group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">
                    {note.title}
                  </h3>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleUnarchiveNote(note.id)}
                      className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                      title="Unarchive note"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                      title="Move to trash"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                      title="More options"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {note.content}
                </p>
                {note.source && (
                  <p className="text-xs text-gray-600 mb-2">{note.source}</p>
                )}
                <div className="text-xs text-gray-500">
                  Archived on {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
