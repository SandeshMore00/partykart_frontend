import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, AlertCircle, Edit2, Save, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "@/config";

interface Note {
  note_id: number;
  note_text: string;
  assigned_date: string; // YYYY-MM-DD format
  created_at: string; // ISO timestamp
}

interface NotesResponse {
  page: number;
  limit: number;
  total: number;
  data: Note[];
}

const MAX_CHARACTERS = 200;
const DEFAULT_LIMIT = 10;
const INITIAL_DISPLAY = 5;

export default function Notes() {
  const { isAdmin, isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_DISPLAY);
  
  const [newNote, setNewNote] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Check admin access
  useEffect(() => {
    if (!isAdmin() && !isSuperAdmin()) {
      navigate("/");
    }
  }, [isAdmin, isSuperAdmin, navigate]);

  // Fetch notes from API
  const fetchNotes = async (page: number = 1) => {
    if (!user?.token) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await authFetch(config.NOTES_FETCH(page, DEFAULT_LIMIT), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch notes' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: NotesResponse = await response.json();
      
      if (page === 1) {
        // First page - replace all notes
        setNotes(data.data);
        setDisplayedCount(INITIAL_DISPLAY);
      } else {
        // Subsequent pages - append to existing notes
        setNotes((prevNotes) => {
          const newNotes = [...prevNotes, ...data.data];
          // Show INITIAL_DISPLAY more notes from the newly loaded page
          setDisplayedCount(prevNotes.length + INITIAL_DISPLAY);
          return newNotes;
        });
      }
      
      setTotalNotes(data.total);
      setCurrentPage(data.page);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load notes on mount
  useEffect(() => {
    if (user?.token && (isAdmin() || isSuperAdmin())) {
      fetchNotes(1);
    }
  }, [user?.token]);

  const handleAddNote = async () => {
    setError("");

    // Validate note text
    if (!newNote.trim()) {
      setError("Note cannot be empty");
      return;
    }

    if (newNote.length > MAX_CHARACTERS) {
      setError(`Note cannot exceed ${MAX_CHARACTERS} characters`);
      return;
    }

    // Validate date
    if (!newNoteDate) {
      setError("Please select a date");
      return;
    }

    setCreating(true);
    
    try {
      const response = await authFetch(config.NOTES_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_text: newNote.trim(),
          assigned_date: newNoteDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create note' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Reset form and close
      setNewNote("");
      const today = new Date();
      setNewNoteDate(today.toISOString().split('T')[0]);
      setShowAddForm(false);
      
      // Refresh notes list
      await fetchNotes(1);
    } catch (err) {
      console.error("Error creating note:", err);
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setDeleting(noteId);
    setError("");
    
    try {
      const response = await authFetch(config.NOTES_DELETE(noteId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete note' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Remove note from local state immediately for better UX
      setNotes(notes.filter((note) => note.note_id !== noteId));
      setTotalNotes(totalNotes - 1);
      
      // If we were editing this note, cancel edit
      if (editingId === noteId) {
        handleCancelEdit();
      }
      
      // Refresh to sync with backend
      await fetchNotes(currentPage);
    } catch (err) {
      console.error("Error deleting note:", err);
      setError(err instanceof Error ? err.message : "Failed to delete note");
      // Refresh to get correct state
      await fetchNotes(currentPage);
    } finally {
      setDeleting(null);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.note_id);
    setEditText(note.note_text);
    setEditDate(note.assigned_date);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditDate("");
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setError("");

    // Validate note text
    if (!editText.trim()) {
      setError("Note cannot be empty");
      return;
    }

    if (editText.length > MAX_CHARACTERS) {
      setError(`Note cannot exceed ${MAX_CHARACTERS} characters`);
      return;
    }

    // Validate date
    if (!editDate) {
      setError("Please select a date");
      return;
    }

    setUpdating(editingId);
    
    try {
      const response = await authFetch(config.NOTES_UPDATE(editingId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_text: editText.trim(),
          assigned_date: editDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update note' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Update note in local state immediately for better UX
      setNotes(
        notes.map((note) =>
          note.note_id === editingId
            ? {
                ...note,
                note_text: editText.trim(),
                assigned_date: editDate,
              }
            : note
        )
      );

      handleCancelEdit();
      
      // Refresh to sync with backend
      await fetchNotes(currentPage);
    } catch (err) {
      console.error("Error updating note:", err);
      setError(err instanceof Error ? err.message : "Failed to update note");
    } finally {
      setUpdating(null);
    }
  };

  const handleShowMore = async () => {
    const nextCount = displayedCount + INITIAL_DISPLAY;
    
    // If we've shown all notes from current page, load next page
    if (nextCount > notes.length) {
      const totalPages = Math.ceil(totalNotes / DEFAULT_LIMIT);
      if (currentPage < totalPages) {
        // Load next page - this will append to notes and update displayedCount
        await fetchNotes(currentPage + 1);
      } else {
        // No more pages, just show all remaining
        setDisplayedCount(notes.length);
      }
    } else {
      // Show more from current page
      setDisplayedCount(nextCount);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Don't render if not admin
  if (!isAdmin() && !isSuperAdmin()) {
    return null;
  }

  const displayedNotes = notes.slice(0, displayedCount);
  const hasMore = displayedCount < totalNotes;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes</h1>
          <p className="text-gray-600">
            Manage your notes (max {MAX_CHARACTERS} characters per note)
          </p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => {
              setShowAddForm(true);
              setError("");
            }}
            className="flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="note-date">Date</Label>
              <Input
                id="note-date"
                type="date"
                value={newNoteDate}
                onChange={(e) => setNewNoteDate(e.target.value)}
                className="mt-1"
                disabled={creating}
              />
            </div>
            <div>
              <Label htmlFor="note-input">Note (max {MAX_CHARACTERS} characters)</Label>
              <Input
                id="note-input"
                type="text"
                value={newNote}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_CHARACTERS) {
                    setNewNote(value);
                    setError("");
                  } else {
                    setError(`Note cannot exceed ${MAX_CHARACTERS} characters`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !creating) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Enter your note here..."
                className="mt-1"
                maxLength={MAX_CHARACTERS}
                disabled={creating}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {newNote.length}/{MAX_CHARACTERS} characters
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewNote("");
                setError("");
                const today = new Date();
                setNewNoteDate(today.toISOString().split('T')[0]);
              }}
              disabled={creating}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || !newNoteDate || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-pink-600" />
            <p className="text-gray-500">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No notes yet. Add your first note above!</p>
          </div>
        ) : (
          <>
            {displayedNotes.map((note) => (
              <div
                key={note.note_id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                {editingId === note.note_id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-date-${note.note_id}`}>Date</Label>
                        <Input
                          id={`edit-date-${note.note_id}`}
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="mt-1"
                          disabled={updating === note.note_id}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-text-${note.note_id}`}>Note</Label>
                        <Input
                          id={`edit-text-${note.note_id}`}
                          type="text"
                          value={editText}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_CHARACTERS) {
                              setEditText(value);
                              setError("");
                            } else {
                              setError(`Note cannot exceed ${MAX_CHARACTERS} characters`);
                            }
                          }}
                          className="mt-1"
                          maxLength={MAX_CHARACTERS}
                          disabled={updating === note.note_id}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {editText.length}/{MAX_CHARACTERS} characters
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updating === note.note_id}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim() || !editDate || updating === note.note_id}
                        >
                          {updating === note.note_id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatDate(note.assigned_date)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created: {formatDate(note.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-900 break-words">{note.note_text}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(note)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={deleting === note.note_id}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.note_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleting === note.note_id}
                      >
                        {deleting === note.note_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Show More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleShowMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Show More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notes Count */}
      {totalNotes > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {displayedNotes.length} of {totalNotes} notes
        </div>
      )}
    </div>
  );
}
