'use client';

import { useState } from 'react';
import { 
  Menu, 
  Search, 
  RefreshCw, 
  List, 
  Settings, 
  Grid3X3, 
  User,
  Lightbulb,
  Bell,
  Pencil,
  Archive,
  Trash2,
  Plus,
  CheckSquare,
  Palette,
  Image as ImageIcon,
  Sun,
  Moon,
  Pin,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../contexts/NoteContext';

interface Note {
  id: string;
  title: string;
  content: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { 
    notes, 
    loading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote, 
    togglePin, 
    changeColor, 
    searchNotes, 
    refreshNotes 
  } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple'>('yellow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredNotes = searchQuery ? searchNotes(searchQuery) : notes;

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  const handleCreateNote = async () => {
    if (newNoteTitle.trim() || newNoteContent.trim()) {
      try {
        setIsSubmitting(true);
        await createNote({
          title: newNoteTitle,
          content: newNoteContent,
          color: selectedColor,
        });
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsCreatingNote(false);
      } catch (error) {
        console.error('Error creating note:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await togglePin(noteId);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleChangeColor = async (noteId: string, color: Note['color']) => {
    try {
      await changeColor(noteId, color);
    } catch (error) {
      console.error('Error changing color:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

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
          <Menu className="h-6 w-6 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-gray-900" />
            </div>
            <span className="text-xl font-medium">Keep</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-tertiary" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full theme-bg-secondary theme-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 theme-text-primary placeholder-theme-text-tertiary"
            />
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
            onClick={refreshNotes}
            disabled={loading}
            className="p-2 rounded-full hover:theme-bg-tertiary transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 theme-text-tertiary animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5 theme-text-tertiary hover:theme-text-primary" />
            )}
          </button>
          <List className="h-6 w-6 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
          <Settings className="h-6 w-6 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
          <Grid3X3 className="h-6 w-6 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 theme-bg-secondary min-h-screen p-4 border-r theme-border">
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-yellow-400 text-gray-900">
              <Lightbulb className="h-5 w-5" />
              <span className="font-medium">Notes</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-tertiary cursor-pointer">
              <Bell className="h-5 w-5 theme-text-tertiary" />
              <span className="theme-text-secondary">Reminders</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-tertiary cursor-pointer">
              <Pencil className="h-5 w-5 theme-text-tertiary" />
              <span className="theme-text-secondary">Edit labels</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-tertiary cursor-pointer">
              <Archive className="h-5 w-5 theme-text-tertiary" />
              <span className="theme-text-secondary">Archive</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-tertiary cursor-pointer">
              <Trash2 className="h-5 w-5 theme-text-tertiary" />
              <span className="theme-text-secondary">Trash</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Note Creation */}
          <div className="mb-6">
            <div className="theme-bg-secondary rounded-lg p-4 theme-border theme-shadow">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Take a note..."
                  value={isCreatingNote ? newNoteTitle : ''}
                  onChange={(e) => {
                    setNewNoteTitle(e.target.value);
                    if (!isCreatingNote) setIsCreatingNote(true);
                  }}
                  onFocus={() => setIsCreatingNote(true)}
                  className="flex-1 bg-transparent theme-text-primary placeholder-theme-text-tertiary focus:outline-none"
                />
                <div className="flex space-x-2">
                  <CheckSquare className="h-5 w-5 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
                  <Palette className="h-5 w-5 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
                  <ImageIcon className="h-5 w-5 theme-text-tertiary hover:theme-text-primary cursor-pointer" />
                </div>
              </div>
              {isCreatingNote && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Add a note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-transparent theme-text-primary placeholder-theme-text-tertiary focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {(['yellow', 'pink', 'blue', 'green', 'orange', 'purple'] as const).map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedColor === color ? 'border-gray-600' : 'border-gray-300'
                          } sticky-note-${color}`}
                        />
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsCreatingNote(false);
                          setNewNoteTitle('');
                          setNewNoteContent('');
                        }}
                        className="px-4 py-2 theme-text-tertiary hover:theme-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateNote}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg text-white flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium theme-text-secondary mb-4">PINNED</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`sticky-note sticky-note-${note.color || 'yellow'} p-4 rounded-lg cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">{note.title}</h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                        >
                          <Pin className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">{note.content}</p>
                    {note.source && (
                      <p className="text-xs text-gray-600">{note.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-medium theme-text-secondary mb-4">OTHERS</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`sticky-note sticky-note-${note.color || 'yellow'} p-4 rounded-lg cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-800 line-clamp-2 flex-1">{note.title}</h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                        >
                          <Pin className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">{note.content}</p>
                    {note.source && (
                      <p className="text-xs text-gray-600">{note.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
              <h3 className="text-lg font-medium theme-text-secondary mb-2">Loading notes...</h3>
              <p className="theme-text-tertiary">Please wait while we fetch your notes</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium theme-text-secondary mb-2">No notes yet</h3>
              <p className="theme-text-tertiary">Create your first note to get started!</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}