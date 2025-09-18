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
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};
