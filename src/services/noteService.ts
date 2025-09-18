import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Note {
  id: string;
  title: string;
  content: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteData {
  title: string;
  content: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
}

class NoteService {
  private collectionName = 'notes';

  // Create a new note
  async createNote(noteData: CreateNoteData): Promise<Note> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...noteData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      return {
        id: docRef.id,
        ...noteData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  // Get all notes
  async getNotes(): Promise<Note[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notes: Note[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          source: data.source,
          isPinned: data.isPinned || false,
          color: data.color || 'yellow',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  }

  // Update a note
  async updateNote(noteId: string, updateData: UpdateNoteData): Promise<void> {
    try {
      const noteRef = doc(db, this.collectionName, noteId);
      await updateDoc(noteRef, {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    try {
      const noteRef = doc(db, this.collectionName, noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  // Toggle pin status
  async togglePin(noteId: string, isPinned: boolean): Promise<void> {
    try {
      await this.updateNote(noteId, { isPinned });
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw new Error('Failed to toggle pin');
    }
  }

  // Change note color
  async changeColor(noteId: string, color: Note['color']): Promise<void> {
    try {
      await this.updateNote(noteId, { color });
    } catch (error) {
      console.error('Error changing color:', error);
      throw new Error('Failed to change color');
    }
  }

  // Search notes
  async searchNotes(searchQuery: string): Promise<Note[]> {
    try {
      const allNotes = await this.getNotes();
      return allNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  }
}

export const noteService = new NoteService();
