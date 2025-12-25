'use client';

import { useState, useCallback, useEffect } from 'react';
import { Session } from '@/types';
import { TranscriptPanel } from './TranscriptPanel';
import { NotePanel } from './NotePanel';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { CheckCircle, FileText, User, Calendar, Edit3, MessageSquare, ClipboardList } from 'lucide-react';

interface SessionViewProps {
  session: Session;
  onSessionUpdate?: (session: Session) => void;
}

async function updateSessionInDB(sessionId: string, updates: Partial<Session>) {
  const response = await fetch(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update session');
  }

  return response.json();
}

export function SessionView({ session, onSessionUpdate }: SessionViewProps) {
  const [highlightedSegments, setHighlightedSegments] = useState<string[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string>();
  const [activeNoteId, setActiveNoteId] = useState<string>();
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [localSession, setLocalSession] = useState(session);
  const [focusedNoteIndex, setFocusedNoteIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'transcript' | 'note'>('note');

  // Citation click handler (Note -> Transcript)
  const handleCitationClick = useCallback((citations: string[]) => {
    setHighlightedSegments(citations);
    if (citations.length > 0) {
      setActiveSegmentId(citations[0]);
      // Auto-switch to transcript tab on mobile
      setMobileTab('transcript');
    }
  }, []);

  // Segment click handler (Transcript -> Note) - Bidirectional linking
  const handleSegmentClick = useCallback((segmentId: string) => {
    // Find all notes that cite this segment
    const relatedNotes = localSession.note.filter((note) =>
      note.citations.includes(segmentId)
    );
    
    const relatedNoteIds = relatedNotes.map((note) => note.id);
    
    if (relatedNoteIds.length > 0) {
      setActiveNoteId(relatedNoteIds[0]);
      // Auto-switch to note tab on mobile
      setMobileTab('note');
    }
  }, [localSession.note]);

  const handleNoteSpanFocus = useCallback((noteId: string) => {
    const index = localSession.note.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      setFocusedNoteIndex(index);
      // Auto-highlight citations when note is focused
      const note = localSession.note[index];
      if (note.citations.length > 0) {
        handleCitationClick(note.citations);
      }
    }
  }, [localSession.note, handleCitationClick]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(focusedNoteIndex + 1, localSession.note.length - 1);
        setFocusedNoteIndex(nextIndex);
        const nextNote = localSession.note[nextIndex];
        setActiveNoteId(nextNote.id);
        handleCitationClick(nextNote.citations);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(focusedNoteIndex - 1, 0);
        setFocusedNoteIndex(prevIndex);
        const prevNote = localSession.note[prevIndex];
        setActiveNoteId(prevNote.id);
        handleCitationClick(prevNote.citations);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const currentNote = localSession.note[focusedNoteIndex];
        if (currentNote) {
          handleCitationClick(currentNote.citations);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedNoteIndex, localSession.note, handleCitationClick]);

  const handleSignNote = async () => {
    try {
      const signedAt = new Date().toISOString();
      const updatedSession = {
        ...localSession,
        signed: true,
        signed_at: signedAt,
      };
      
      // Save to database
      await updateSessionInDB(session.id, {
        signed: true,
        signed_at: signedAt,
      });
      
      setLocalSession(updatedSession);
      onSessionUpdate?.(updatedSession);
      setShowSignDialog(false);
    } catch (error) {
      console.error('Error signing note:', error);
      alert('Failed to sign note. Please try again.');
    }
  };

  const handleNoteUpdate = async (noteId: string, newText: string) => {
    try {
      const updatedNotes = localSession.note.map(note => 
        note.id === noteId ? { ...note, text: newText } : note
      );
      const updatedSession = {
        ...localSession,
        note: updatedNotes,
      };
      
      // Save to database
      await updateSessionInDB(session.id, {
        note: updatedNotes,
      });
      
      setLocalSession(updatedSession);
      onSessionUpdate?.(updatedSession);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const unsupportedClaims = localSession.note.filter((note) => note.needs_confirmation);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-3 lg:p-4">
          {/* Title and Actions Row */}
          <div className="flex items-center justify-between gap-3 mb-2 lg:mb-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <h1 className="text-lg lg:text-xl font-bold truncate">Session Detail</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {localSession.signed ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-4 h-4 lg:mr-1" />
                  <span className="hidden sm:inline">Signed</span>
                </Badge>
              ) : (
                <>
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    className={editMode ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <Edit3 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{editMode ? 'Exit Edit' : 'Edit'}</span>
                  </Button>
                  <Button
                    onClick={() => setShowSignDialog(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Patient Info Row */}
          <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="truncate max-w-[150px] lg:max-w-none">{session.patient_name}</span>
            </div>
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>{new Date(session.session_date).toLocaleDateString()}</span>
            </div>
            {!localSession.signed && unsupportedClaims.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-xs">
                {unsupportedClaims.length} claim{unsupportedClaims.length > 1 ? 's' : ''} need confirmation
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-b bg-card">
        <div className="flex">
          <button
            onClick={() => setMobileTab('transcript')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mobileTab === 'transcript'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Transcript
          </button>
          <button
            onClick={() => setMobileTab('note')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mobileTab === 'note'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Clinical Note
          </button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop: Side by Side */}
        <div className="hidden lg:grid lg:grid-cols-2 h-full">
          <TranscriptPanel
            segments={session.transcript}
            highlightedSegments={highlightedSegments}
            onSegmentClick={handleSegmentClick}
            activeSegmentId={activeSegmentId}
          />
          <NotePanel
            noteSpans={localSession.note}
            onCitationClick={handleCitationClick}
            activeNoteId={activeNoteId}
            onNoteSpanFocus={handleNoteSpanFocus}
            onNoteUpdate={handleNoteUpdate}
            editMode={editMode}
          />
        </div>

        {/* Mobile: Tabbed View */}
        <div className="lg:hidden h-full">
          {mobileTab === 'transcript' ? (
            <TranscriptPanel
              segments={session.transcript}
              highlightedSegments={highlightedSegments}
              onSegmentClick={handleSegmentClick}
              activeSegmentId={activeSegmentId}
            />
          ) : (
            <NotePanel
              noteSpans={localSession.note}
              onCitationClick={handleCitationClick}
              activeNoteId={activeNoteId}
              onNoteSpanFocus={handleNoteSpanFocus}
              onNoteUpdate={handleNoteUpdate}
              editMode={editMode}
            />
          )}
        </div>
      </div>

      {/* Sign Note Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sign Clinical Note</DialogTitle>
            <DialogDescription>
              Please review the note before signing. This action confirms that you have verified the accuracy of the documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Note Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{session.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(session.session_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Entries:</span>
                  <span className="font-medium">{session.note.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supported Claims:</span>
                  <span className="font-medium text-green-600">
                    {session.note.filter((n) => !n.needs_confirmation).length}
                  </span>
                </div>
                {unsupportedClaims.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Needs Confirmation:</span>
                    <span className="font-medium text-amber-600">
                      {unsupportedClaims.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {unsupportedClaims.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/20">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ⚠️ This note contains {unsupportedClaims.length} claim{unsupportedClaims.length > 1 ? 's' : ''} without supporting evidence. Please verify before signing.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignNote} className="bg-primary">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm and Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden lg:block border-t bg-muted/50 px-4 py-2">
        <p className="text-xs text-muted-foreground text-center">
          Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑</kbd> / <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↓</kbd> Navigate notes • <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Enter</kbd> View citations
        </p>
      </div>
    </div>
  );
}

