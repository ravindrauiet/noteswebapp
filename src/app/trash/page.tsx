'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotes } from '../../contexts/NoteContext';
import { Note } from '../../services/noteService';
import Navigation from '../../components/Navigation';

export default function TrashPage() {
  const { theme, toggleTheme } = useTheme();
  const { 
    getNotesByStatus, 
    restoreNote, 
    permanentDeleteNote, 
    loading, 
    error, 
    refreshNotes 
  } = useNotes();
  
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const loadDeletedNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const notes = await getNotesByStatus('deleted');
      setDeletedNotes(notes);
    } catch (error) {
      console.error('Error loading deleted notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getNotesByStatus]);

  useEffect(() => {
    loadDeletedNotes();
  }, [loadDeletedNotes]);

  const handleRestoreNote = async (noteId: string) => {
    try {
      await restoreNote(noteId);
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error restoring note:', error);
    }
  };

  const handlePermanentDelete = async (noteId: string) => {
    try {
      await permanentDeleteNote(noteId);
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error permanently deleting note:', error);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      for (const note of deletedNotes) {
        await permanentDeleteNote(note.id);
      }
      setDeletedNotes([]);
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-primary theme-text-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 theme-text-tertiary" />
            <p className="theme-text-secondary">Loading deleted notes...</p>
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
            <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Trash</span>
            {deletedNotes.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {deletedNotes.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {deletedNotes.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Empty Trash</span>
            </button>
          )}
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
            onClick={loadDeletedNotes}
            disabled={loading}
            className="p-2 rounded-full hover:theme-bg-tertiary transition-colors disabled:opacity-50"
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
        {deletedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium theme-text-secondary mb-2">Trash is empty</h3>
            <p className="theme-text-tertiary">Deleted notes will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Notes in trash are deleted after 30 days
                  </h4>
                  <p className="text-sm text-yellow-700">
                    You can restore notes from trash or permanently delete them.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {deletedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`sticky-note sticky-note-${note.color || 'yellow'} p-4 rounded-lg group opacity-75`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">
                      {note.title}
                    </h3>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleRestoreNote(note.id)}
                        className="p-1 hover:bg-green-500 hover:bg-opacity-20 rounded"
                        title="Restore note"
                      >
                        <RotateCcw className="h-4 w-4 text-gray-600 hover:text-green-600" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(note.id)}
                        className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                        title="Permanently delete"
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
                    Deleted on {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Permanently delete note?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. The note will be permanently removed from your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePermanentDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
