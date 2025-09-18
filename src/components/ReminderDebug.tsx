'use client';

import { useState } from 'react';
import { useNotes } from '../contexts/NoteContext';
import { Clock, RefreshCw, Plus } from 'lucide-react';

export default function ReminderDebug() {
  const { notes, createNote, getNotesWithReminders } = useNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [reminderNotes, setReminderNotes] = useState<any[]>([]);

  const testCreateReminder = async () => {
    try {
      setIsLoading(true);
      const testNote = await createNote({
        title: 'Test Reminder Note',
        content: 'This is a test note with a reminder',
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        color: 'yellow'
      });
      console.log('Created test note with reminder:', testNote);
      alert('Test reminder note created! Check the reminders page.');
    } catch (error) {
      console.error('Error creating test reminder:', error);
      alert('Error creating test reminder: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetReminders = async () => {
    try {
      setIsLoading(true);
      const reminders = await getNotesWithReminders();
      setReminderNotes(reminders);
      console.log('Reminder notes:', reminders);
    } catch (error) {
      console.error('Error getting reminders:', error);
      alert('Error getting reminders: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Reminder Debug Tool</h3>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={testCreateReminder}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create Test Reminder</span>
          </button>
          
          <button
            onClick={testGetReminders}
            disabled={isLoading}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Get Reminders</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p>Total notes: {notes.length}</p>
          <p>Notes with reminders: {reminderNotes.length}</p>
        </div>

        {reminderNotes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Reminder Notes:</h4>
            {reminderNotes.map((note) => (
              <div key={note.id} className="p-2 bg-white rounded border text-sm">
                <p><strong>Title:</strong> {note.title}</p>
                <p><strong>Content:</strong> {note.content}</p>
                <p><strong>Reminder:</strong> {note.reminderDate ? new Date(note.reminderDate).toLocaleString() : 'None'}</p>
                <p><strong>ID:</strong> {note.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
