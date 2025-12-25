'use client';

import { NoteSpan } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface NotePanelProps {
  noteSpans: NoteSpan[];
  onCitationClick: (citations: string[]) => void;
  activeNoteId?: string;
  onNoteSpanFocus?: (noteId: string) => void;
  onNoteUpdate?: (noteId: string, newText: string) => void;
  editMode?: boolean;
}

const sectionTitles = {
  subjective: 'Subjective',
  objective: 'Objective',
  assessment: 'Assessment',
  plan: 'Plan',
};

const sectionDescriptions = {
  subjective: 'Patient\'s reported experiences and symptoms',
  objective: 'Observable clinical findings',
  assessment: 'Clinical interpretation and diagnosis',
  plan: 'Treatment plan and next steps',
};

export function NotePanel({
  noteSpans,
  onCitationClick,
  activeNoteId,
  onNoteSpanFocus,
  onNoteUpdate,
  editMode = false,
}: NotePanelProps) {
  const noteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (activeNoteId && noteRefs.current[activeNoteId]) {
      noteRefs.current[activeNoteId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeNoteId]);

  const groupedNotes = noteSpans.reduce((acc, note) => {
    if (!acc[note.section]) {
      acc[note.section] = [];
    }
    acc[note.section].push(note);
    return acc;
  }, {} as Record<string, NoteSpan[]>);

  const sections = ['subjective', 'objective', 'assessment', 'plan'] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 lg:p-4 border-b bg-muted/50">
        <h2 className="text-base lg:text-lg font-semibold">Clinical Note (SOAP Format)</h2>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
          Click on a citation to view supporting evidence
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
          {sections.map((section) => {
            const notes = groupedNotes[section] || [];
            if (notes.length === 0) return null;

            return (
              <div key={section} className="space-y-3 lg:space-y-4">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold capitalize text-primary">
                    {sectionTitles[section]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sectionDescriptions[section]}
                  </p>
                  <Separator className="mt-2" />
                </div>
                <div className="space-y-2.5 lg:space-y-3">
                  {notes.map((note, index) => {
                    const isActive = activeNoteId === note.id;
                    const hasCitations = note.citations.length > 0;

                    return (
                      <div
                        key={note.id}
                        ref={(el) => {
                          noteRefs.current[note.id] = el;
                        }}
                        className={cn(
                          'p-3 lg:p-4 rounded-lg border transition-all',
                          'group relative',
                          isActive && 'ring-2 ring-primary shadow-lg',
                          note.needs_confirmation
                            ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/20'
                            : 'bg-card'
                        )}
                        onFocus={() => onNoteSpanFocus?.(note.id)}
                        tabIndex={0}
                        role="article"
                        aria-label={`Note: ${note.text}${note.needs_confirmation ? ' - Needs confirmation' : ''}`}
                      >
                        <div className="flex items-start gap-2 lg:gap-3">
                          <span className="text-xs lg:text-sm text-muted-foreground font-medium min-w-[16px] lg:min-w-[20px]">
                            {index + 1}.
                          </span>
                          <div className="flex-1 space-y-1.5 lg:space-y-2">
                            {editingNoteId === note.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full text-xs lg:text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (onNoteUpdate) {
                                        onNoteUpdate(note.id, editText);
                                      }
                                      setEditingNoteId(null);
                                    }}
                                    className="text-xs px-2.5 lg:px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(null);
                                      setEditText('');
                                    }}
                                    className="text-xs px-2.5 lg:px-3 py-1 border rounded-md hover:bg-muted flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs lg:text-sm leading-relaxed flex-1">{note.text}</p>
                                {editMode && (
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditText(note.text);
                                    }}
                                    className="text-xs p-1 hover:bg-muted rounded transition-colors shrink-0"
                                    aria-label="Edit note"
                                  >
                                    <Edit2 className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap">
                              {note.needs_confirmation ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] lg:text-xs bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                >
                                  <AlertCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-0.5 lg:mr-1" />
                                  <span className="hidden sm:inline">Needs Confirmation</span>
                                  <span className="sm:hidden">Unconfirmed</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] lg:text-xs bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300"
                                >
                                  <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-0.5 lg:mr-1" />
                                  Supported
                                </Badge>
                              )}
                              {hasCitations ? (
                                <button
                                  onClick={() => onCitationClick(note.citations)}
                                  className={cn(
                                    'text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md',
                                    'bg-primary/10 hover:bg-primary/20',
                                    'text-primary font-medium',
                                    'transition-colors cursor-pointer',
                                    'border border-primary/20'
                                  )}
                                  aria-label={`View ${note.citations.length} citation${note.citations.length > 1 ? 's' : ''}`}
                                >
                                  {note.citations.length} Citation{note.citations.length > 1 ? 's' : ''}
                                </button>
                              ) : (
                                <span className="text-[10px] lg:text-xs text-muted-foreground italic">
                                  No transcript
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

