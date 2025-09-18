'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotes } from '../../contexts/NoteContext';
import Navigation from '../../components/Navigation';

export default function LabelsPage() {
  const { theme, toggleTheme } = useTheme();
  const { 
    getAllLabels, 
    loading, 
    error
  } = useNotes();
  
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  const loadLabels = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedLabels = await getAllLabels();
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Error loading labels:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAllLabels]);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    
    try {
      // In a real app, you'd add the label to the database
      // For now, we'll just add it to the local state
      const trimmedLabel = newLabelName.trim();
      if (!labels.includes(trimmedLabel)) {
        setLabels(prev => [...prev, trimmedLabel].sort());
        setNewLabelName('');
        setIsAddingLabel(false);
      }
    } catch (error) {
      console.error('Error adding label:', error);
    }
  };

  const handleEditLabel = (oldLabel: string) => {
    setEditingLabel(oldLabel);
    setNewLabelName(oldLabel);
  };

  const handleUpdateLabel = async () => {
    if (!newLabelName.trim() || !editingLabel) return;
    
    try {
      const trimmedLabel = newLabelName.trim();
      if (trimmedLabel !== editingLabel && !labels.includes(trimmedLabel)) {
        setLabels(prev => 
          prev.map(label => label === editingLabel ? trimmedLabel : label).sort()
        );
        setEditingLabel(null);
        setNewLabelName('');
      }
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  const handleDeleteLabel = async (labelToDelete: string) => {
    try {
      // In a real app, you'd remove the label from all notes and delete it
      setLabels(prev => prev.filter(label => label !== labelToDelete));
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLabel(null);
    setNewLabelName('');
    setIsAddingLabel(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-primary theme-text-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 theme-text-tertiary" />
            <p className="theme-text-secondary">Loading labels...</p>
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
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">Edit Labels</span>
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
            onClick={loadLabels}
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
        <div className="max-w-2xl mx-auto">
          {/* Add New Label */}
          <div className="mb-6">
            {isAddingLabel ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Enter label name"
                  className="flex-1 theme-bg-secondary theme-border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 theme-text-primary placeholder-theme-text-tertiary"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                />
                <button
                  onClick={handleAddLabel}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
                  title="Add label"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingLabel(true)}
                className="flex items-center space-x-2 px-4 py-2 theme-bg-secondary theme-border rounded-lg hover:theme-bg-tertiary transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add new label</span>
              </button>
            )}
          </div>

          {/* Labels List */}
          {labels.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Pencil className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium theme-text-secondary mb-2">No labels yet</h3>
              <p className="theme-text-tertiary">Create your first label to organize your notes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {labels.map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 theme-bg-secondary rounded-lg group"
                >
                  {editingLabel === label ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        className="flex-1 theme-bg-primary theme-border rounded px-2 py-1 focus:outline-none focus:border-blue-500 theme-text-primary"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateLabel()}
                      />
                      <button
                        onClick={handleUpdateLabel}
                        className="p-1 bg-green-500 hover:bg-green-600 rounded text-white"
                        title="Save changes"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="theme-text-primary font-medium">{label}</span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLabel(label)}
                          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                          title="Edit label"
                        >
                          <Edit3 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(label)}
                          className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                          title="Delete label"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
