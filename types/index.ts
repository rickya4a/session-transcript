export interface TranscriptSegment {
  id: string;
  speaker: 'clinician' | 'patient';
  text: string;
  start_ms: number;
  end_ms: number;
}

export interface NoteSpan {
  id: string;
  section: 'subjective' | 'objective' | 'assessment' | 'plan';
  text: string;
  citations: string[]; // transcript segment IDs
  needs_confirmation: boolean;
}

export interface Session {
  id: string;
  patient_name: string;
  session_date: string;
  transcript: TranscriptSegment[];
  note: NoteSpan[];
  signed: boolean;
  signed_at?: string;
}

