'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { noteService, Note, CreateNoteData, UpdateNoteData } from '../services/noteService';

interface NoteContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (noteData: CreateNoteData) => Promise<void>;
  updateNote: (noteId: string, updateData: UpdateNoteData) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  togglePin: (noteId: string) => Promise<void>;
  changeColor: (noteId: string, color: Note['color']) => Promise<void>;
  searchNotes: (query: string) => Note[];
  refreshNotes: () => Promise<void>;
  // New functionality
  archiveNote: (noteId: string) => Promise<void>;
  unarchiveNote: (noteId: string) => Promise<void>;
  softDeleteNote: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
  permanentDeleteNote: (noteId: string) => Promise<void>;
  addLabel: (noteId: string, label: string) => Promise<void>;
  removeLabel: (noteId: string, label: string) => Promise<void>;
  getAllLabels: () => Promise<string[]>;
  setReminder: (noteId: string, reminderDate: Date) => Promise<void>;
  removeReminder: (noteId: string) => Promise<void>;
  getNotesByStatus: (status: 'active' | 'archived' | 'deleted') => Promise<Note[]>;
  getNotesWithReminders: () => Promise<Note[]>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

interface NoteProviderProps {
  children: ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await noteService.getNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: CreateNoteData) => {
    try {
      setError(null);
      const newNote = await noteService.createNote(noteData);
      setNotes(prevNotes => [newNote, ...prevNotes]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      console.error('Error creating note:', err);
      throw err;
    }
  };

  const updateNote = async (noteId: string, updateData: UpdateNoteData) => {
    try {
      setError(null);
      await noteService.updateNote(noteId, updateData);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, ...updateData, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  const togglePin = async (noteId: string) => {
    try {
      setError(null);
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const newPinStatus = !note.isPinned;
      await noteService.togglePin(noteId, newPinStatus);
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId ? { ...n, isPinned: newPinStatus, updatedAt: new Date() } : n
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle pin');
      console.error('Error toggling pin:', err);
      throw err;
    }
  };

  const changeColor = async (noteId: string, color: Note['color']) => {
    try {
      setError(null);
      await noteService.changeColor(noteId, color);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, color, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change color');
      console.error('Error changing color:', err);
      throw err;
    }
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    return notes.filter(note =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const refreshNotes = async () => {
    await loadNotes();
  };

  // New functionality implementations
  const archiveNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.archiveNote(noteId);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, isArchived: true, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive note');
      console.error('Error archiving note:', err);
      throw err;
    }
  };

  const unarchiveNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.unarchiveNote(noteId);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, isArchived: false, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive note');
      console.error('Error unarchiving note:', err);
      throw err;
    }
  };

  const softDeleteNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.softDeleteNote(noteId);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, isDeleted: true, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      console.error('Error soft deleting note:', err);
      throw err;
    }
  };

  const restoreNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.restoreNote(noteId);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, isDeleted: false, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore note');
      console.error('Error restoring note:', err);
      throw err;
    }
  };

  const permanentDeleteNote = async (noteId: string) => {
    try {
      setError(null);
      await noteService.permanentDeleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete note');
      console.error('Error permanently deleting note:', err);
      throw err;
    }
  };

  const addLabel = async (noteId: string, label: string) => {
    try {
      setError(null);
      await noteService.addLabel(noteId, label);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { 
                ...note, 
                labels: [...(note.labels || []), label], 
                updatedAt: new Date() 
              }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add label');
      console.error('Error adding label:', err);
      throw err;
    }
  };

  const removeLabel = async (noteId: string, label: string) => {
    try {
      setError(null);
      await noteService.removeLabel(noteId, label);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { 
                ...note, 
                labels: (note.labels || []).filter(l => l !== label), 
                updatedAt: new Date() 
              }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove label');
      console.error('Error removing label:', err);
      throw err;
    }
  };

  const getAllLabels = async () => {
    try {
      setError(null);
      return await noteService.getAllLabels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch labels');
      console.error('Error fetching labels:', err);
      throw err;
    }
  };

  const setReminder = async (noteId: string, reminderDate: Date) => {
    try {
      setError(null);
      await noteService.setReminder(noteId, reminderDate);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, reminderDate, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set reminder');
      console.error('Error setting reminder:', err);
      throw err;
    }
  };

  const removeReminder = async (noteId: string) => {
    try {
      setError(null);
      await noteService.removeReminder(noteId);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? { ...note, reminderDate: undefined, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove reminder');
      console.error('Error removing reminder:', err);
      throw err;
    }
  };

  const getNotesByStatus = async (status: 'active' | 'archived' | 'deleted') => {
    try {
      setError(null);
      return await noteService.getNotesByStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes by status');
      console.error('Error fetching notes by status:', err);
      throw err;
    }
  };

  const getNotesWithReminders = async () => {
    try {
      setError(null);
      return await noteService.getNotesWithReminders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes with reminders');
      console.error('Error fetching notes with reminders:', err);
      throw err;
    }
  };

  const value: NoteContextType = {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    changeColor,
    searchNotes,
    refreshNotes,
    archiveNote,
    unarchiveNote,
    softDeleteNote,
    restoreNote,
    permanentDeleteNote,
    addLabel,
    removeLabel,
    getAllLabels,
    setReminder,
    removeReminder,
    getNotesByStatus,
    getNotesWithReminders,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};
