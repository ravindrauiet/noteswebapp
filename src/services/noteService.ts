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
  labels?: string[];
  isArchived?: boolean;
  isDeleted?: boolean;
  reminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteData {
  title: string;
  content: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  labels?: string[];
  reminderDate?: Date;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  source?: string;
  isPinned?: boolean;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  labels?: string[];
  isArchived?: boolean;
  isDeleted?: boolean;
  reminderDate?: Date;
}

class NoteService {
  private collectionName = 'notes';

  // Create a new note
  async createNote(noteData: CreateNoteData): Promise<Note> {
    try {
      const now = new Date();
      const firestoreData: any = {
        ...noteData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      // Convert reminderDate to Timestamp if it exists
      if (noteData.reminderDate) {
        firestoreData.reminderDate = Timestamp.fromDate(noteData.reminderDate);
      }

      // Ensure all boolean fields have default values
      firestoreData.isPinned = noteData.isPinned || false;
      firestoreData.isArchived = false;
      firestoreData.isDeleted = false;
      firestoreData.labels = noteData.labels || [];

      console.log('Creating note with data:', firestoreData);

      const docRef = await addDoc(collection(db, this.collectionName), firestoreData);

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
          labels: data.labels || [],
          isArchived: data.isArchived || false,
          isDeleted: data.isDeleted || false,
          reminderDate: data.reminderDate?.toDate(),
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
      const firestoreData: any = {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert reminderDate to Timestamp if it exists
      if (updateData.reminderDate) {
        firestoreData.reminderDate = Timestamp.fromDate(updateData.reminderDate);
      } else if (updateData.reminderDate === undefined) {
        // If reminderDate is explicitly set to undefined, remove it
        firestoreData.reminderDate = null;
      }

      console.log('Updating note with data:', firestoreData);

      await updateDoc(noteRef, firestoreData);
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

  // Get notes by status
  async getNotesByStatus(status: 'active' | 'archived' | 'deleted'): Promise<Note[]> {
    try {
      const allNotes = await this.getNotes();
      
      switch (status) {
        case 'active':
          return allNotes.filter(note => !note.isArchived && !note.isDeleted);
        case 'archived':
          return allNotes.filter(note => note.isArchived && !note.isDeleted);
        case 'deleted':
          return allNotes.filter(note => note.isDeleted);
        default:
          return allNotes;
      }
    } catch (error) {
      console.error('Error fetching notes by status:', error);
      throw new Error('Failed to fetch notes by status');
    }
  }

  // Get notes with reminders
  async getNotesWithReminders(): Promise<Note[]> {
    try {
      const allNotes = await this.getNotes();
      return allNotes.filter(note => note.reminderDate && !note.isArchived && !note.isDeleted);
    } catch (error) {
      console.error('Error fetching notes with reminders:', error);
      throw new Error('Failed to fetch notes with reminders');
    }
  }

  // Archive a note
  async archiveNote(noteId: string): Promise<void> {
    try {
      await this.updateNote(noteId, { isArchived: true });
    } catch (error) {
      console.error('Error archiving note:', error);
      throw new Error('Failed to archive note');
    }
  }

  // Unarchive a note
  async unarchiveNote(noteId: string): Promise<void> {
    try {
      await this.updateNote(noteId, { isArchived: false });
    } catch (error) {
      console.error('Error unarchiving note:', error);
      throw new Error('Failed to unarchive note');
    }
  }

  // Soft delete a note
  async softDeleteNote(noteId: string): Promise<void> {
    try {
      await this.updateNote(noteId, { isDeleted: true });
    } catch (error) {
      console.error('Error soft deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  // Restore a note from trash
  async restoreNote(noteId: string): Promise<void> {
    try {
      await this.updateNote(noteId, { isDeleted: false });
    } catch (error) {
      console.error('Error restoring note:', error);
      throw new Error('Failed to restore note');
    }
  }

  // Permanently delete a note
  async permanentDeleteNote(noteId: string): Promise<void> {
    try {
      await this.deleteNote(noteId);
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      throw new Error('Failed to permanently delete note');
    }
  }

  // Add label to note
  async addLabel(noteId: string, label: string): Promise<void> {
    try {
      const note = await this.getNotes();
      const targetNote = note.find(n => n.id === noteId);
      if (!targetNote) throw new Error('Note not found');

      const currentLabels = targetNote.labels || [];
      if (!currentLabels.includes(label)) {
        const updatedLabels = [...currentLabels, label];
        await this.updateNote(noteId, { labels: updatedLabels });
      }
    } catch (error) {
      console.error('Error adding label:', error);
      throw new Error('Failed to add label');
    }
  }

  // Remove label from note
  async removeLabel(noteId: string, label: string): Promise<void> {
    try {
      const note = await this.getNotes();
      const targetNote = note.find(n => n.id === noteId);
      if (!targetNote) throw new Error('Note not found');

      const currentLabels = targetNote.labels || [];
      const updatedLabels = currentLabels.filter(l => l !== label);
      await this.updateNote(noteId, { labels: updatedLabels });
    } catch (error) {
      console.error('Error removing label:', error);
      throw new Error('Failed to remove label');
    }
  }

  // Get all unique labels
  async getAllLabels(): Promise<string[]> {
    try {
      const allNotes = await this.getNotes();
      const labels = new Set<string>();
      
      allNotes.forEach(note => {
        if (note.labels) {
          note.labels.forEach(label => labels.add(label));
        }
      });
      
      return Array.from(labels).sort();
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw new Error('Failed to fetch labels');
    }
  }

  // Set reminder for note
  async setReminder(noteId: string, reminderDate: Date): Promise<void> {
    try {
      await this.updateNote(noteId, { reminderDate });
    } catch (error) {
      console.error('Error setting reminder:', error);
      throw new Error('Failed to set reminder');
    }
  }

  // Remove reminder from note
  async removeReminder(noteId: string): Promise<void> {
    try {
      await this.updateNote(noteId, { reminderDate: undefined });
    } catch (error) {
      console.error('Error removing reminder:', error);
      throw new Error('Failed to remove reminder');
    }
  }
}

export const noteService = new NoteService();
