'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Pin, 
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotes } from '../../contexts/NoteContext';
import { Note } from '../../services/noteService';
import Navigation from '../../components/Navigation';

export default function RemindersPage() {
  const { theme, toggleTheme } = useTheme();
  const { 
    getNotesWithReminders, 
    removeReminder, 
    loading, 
    error, 
    refreshNotes 
  } = useNotes();
  
  const [reminderNotes, setReminderNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReminderNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading reminder notes...');
      const notes = await getNotesWithReminders();
      console.log('Loaded reminder notes:', notes);
      setReminderNotes(notes);
    } catch (error) {
      console.error('Error loading reminder notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getNotesWithReminders]);

  useEffect(() => {
    loadReminderNotes();
  }, [loadReminderNotes]);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadReminderNotes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadReminderNotes]);

  const handleRemoveReminder = async (noteId: string) => {
    try {
      await removeReminder(noteId);
      // Refresh the reminders list
      await loadReminderNotes();
    } catch (error) {
      console.error('Error removing reminder:', error);
    }
  };

  const formatReminderDate = (date: Date) => {
    const now = new Date();
    const reminderDate = new Date(date);
    const diffInMs = reminderDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `Overdue by ${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'}`;
    } else if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Tomorrow';
    } else if (diffInDays <= 7) {
      return `In ${diffInDays} days`;
    } else {
      return reminderDate.toLocaleDateString();
    }
  };

  const isOverdue = (date: Date) => {
    return new Date(date) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-primary theme-text-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 theme-text-tertiary" />
            <p className="theme-text-secondary">Loading reminders...</p>
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
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Reminders</span>
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
            onClick={loadReminderNotes}
            disabled={loading}
            className="p-2 rounded-full hover:theme-bg-tertiary transition-colors disabled:opacity-50"
            title="Refresh reminders"
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
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
            <p>Debug: Found {reminderNotes.length} reminder notes</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <button 
              onClick={loadReminderNotes}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Refresh Data
            </button>
          </div>

        {reminderNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium theme-text-secondary mb-2">No reminders yet</h3>
            <p className="theme-text-tertiary">Set reminders for your notes to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminderNotes.map((note) => (
              <div
                key={note.id}
                className={`sticky-note sticky-note-${note.color || 'yellow'} p-4 rounded-lg group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-1">
                      {note.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                      {note.content}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span className={isOverdue(note.reminderDate!) ? 'text-red-600 font-medium' : ''}>
                        {formatReminderDate(note.reminderDate!)}
                      </span>
                      {note.reminderDate && (
                        <span className="text-gray-500">
                          • {new Date(note.reminderDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleRemoveReminder(note.id)}
                      className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                      title="Remove reminder"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                      title="More options"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
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
