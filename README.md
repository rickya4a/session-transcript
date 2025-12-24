# AidMi Session Detail - Evidence-Backed Clinical Notes

A Next.js application that demonstrates evidence-backed clinical note documentation for behavioral health sessions. This project showcases the core interaction of viewing AI-generated clinical notes alongside their source transcript, with clickable citations that highlight supporting evidence.

## Features

- **Split-View Layout**: Responsive design with transcript and clinical note panels side-by-side
- **SOAP Format Notes**: Clinical notes organized by Subjective, Objective, Assessment, and Plan sections
- **Interactive Citations**: Click citations in notes to highlight corresponding transcript segments with smooth scrolling
- **Visual Flagging**: Clear distinction between supported claims and claims needing confirmation
- **Timestamp Display**: Formatted timestamps (MM:SS) for all transcript segments
- **Speaker Differentiation**: Visual distinction between Clinician and Patient speakers

- **Edit Mode**: Inline editing of note spans with save functionality - changes persist to database
- **Bidirectional Linking**: Click transcript segments to highlight which note spans cite them
- **Sign Note Flow**: Modal confirmation dialog with database persistence
- **Persist to Database**: Prisma + SQLite with full CRUD API - all changes saved automatically
- **Keyboard Navigation**: Use arrow keys (↑/↓) to navigate between note spans, Enter to view citations
- **Accessibility**: ARIA labels, focus management, keyboard support, and screen reader friendly

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Database**: Prisma ORM + SQLite
- **Styling**: Tailwind CSS v3.4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: tailwindcss-animate

## Installation

```bash
# Install dependencies
npm install

# Setup database and seed with sample data
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Additional Commands

```bash
# View/edit database with Prisma Studio
npm run db:studio

# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

## Key Design Decisions

### 1. Component Architecture
- **Separation of Concerns**: Split into presentational components (TranscriptPanel, NotePanel) and container component (SessionView)
- **State Management**: Centralized state in SessionView for coordinating interactions between panels
- **Reusability**: Components accept props for data and callbacks, making them reusable and testable

### 2. Citation Linking Logic
- **Forward Linking (Note -> Transcript)**: Note spans store citation arrays referencing transcript segment IDs
- **Reverse Linking (Transcript -> Note)**: Dynamic lookup to find all notes citing a segment
- **Highlighting States**: 
  - `highlightedSegments`: Array of transcript IDs to highlight
  - `activeSegmentId`: Single segment to scroll into view
  - `highlightedNotes`: Array of note IDs to highlight
  - `activeNoteId`: Single note to scroll into view

### 3. User Experience Decisions
- **Smooth Scrolling**: `scrollIntoView` with smooth behavior for better visual feedback
- **Visual Hierarchy**: Color-coded badges for speakers, sections, and confirmation status
- **Keyboard Shortcuts**: Arrow keys for navigation, Enter for action - familiar patterns
- **Responsive Design**: Grid layout adapts to screen size (stacked on mobile, side-by-side on desktop)

### 4. Accessibility Considerations
- **Aria Labels**: Descriptive labels for all interactive elements
- **Keyboard Navigation**: Full keyboard support without mouse
- **Focus Management**: Visible focus indicators and proper tab order
- **Screen Reader Support**: Semantic HTML and descriptive text alternatives

### 5. Data Model
- **Immutable Data**: Session data stored separately, updated through callbacks
- **Citation by ID**: Using string IDs instead of indices for robust referencing
- **needs_confirmation Flag**: Simple boolean to identify unsupported claims

## How It Works

### Interactive Citation Flow
1. User clicks a citation button on a note span
2. `onCitationClick` callback fires with citation IDs
3. SessionView updates `highlightedSegments` state
4. TranscriptPanel re-renders with highlighted segments
5. Active segment scrolls into view smoothly

### Bidirectional Linking Flow
1. User clicks a transcript segment
2. `onSegmentClick` callback fires with segment ID
3. SessionView searches all notes for citations matching the segment
4. Updates `highlightedNotes` with matching note IDs
5. NotePanel highlights related notes

### Keyboard Navigation
- **↑/↓ Arrow Keys**: Navigate between note spans sequentially
- **Enter Key**: Jump to citations for the focused note span
- Context-aware: Only active when not in input fields

### Sign Note Flow
1. User clicks "Sign Note" button
2. Modal displays note summary and validation warnings
3. If unsupported claims exist, warning is shown
4. User confirms and note is marked as signed
5. Changes are saved to database via API
6. Signed badge replaces the Sign button

### Database Persistence
- **Edit Note**: Changes automatically save to SQLite database via PATCH API
- **Sign Note**: Signature and timestamp persist to database
- **Data Survives**: All changes survive page refresh
- **API Routes**: 
  - `GET /api/sessions` - List all sessions
  - `GET /api/sessions/[id]` - Get single session
  - `PATCH /api/sessions/[id]` - Update session (edit/sign)
  - `DELETE /api/sessions/[id]` - Delete session

## UI Design Highlights

- **Clinical Focus**: Clean, professional design appropriate for healthcare professionals
- **Color Coding**: 
  - Blue badges for Clinician
  - Green badges for Patient
  - Amber for needs confirmation
  - Green for supported claims
- **Visual Feedback**: Hover states, transitions, and shadows for interactive elements
- **Information Density**: Balanced layout with appropriate whitespace

## Database Schema

### Models
- **Session**: Patient name, date, signed status, timestamps
- **TranscriptSegment**: Speaker, text, timing (start_ms, end_ms)
- **NoteSpan**: Section (SOAP), text, citations, needs_confirmation

### Relationships
- Session has many TranscriptSegments (one-to-many)
- Session has many NoteSpans (one-to-many)
- Cascade delete: Deleting session removes all related data

## What I Would Improve With More Time

### Implemented ✅
- ~~Database Integration~~ ✅ Prisma + SQLite
- ~~Edit Mode~~ ✅ Inline editing with save
- ~~Sign Note Persistence~~ ✅ Saves to database

### Future Enhancements
- **PostgreSQL**: Switch from SQLite for production
- **Audio Playback**: Synchronized with transcript timestamps
- **Search**: Full-text search in transcript and notes
- **Multi-Session**: List and compare multiple sessions
- **Export**: PDF generation for signed notes
- **Real-time Collaboration**: Multiple users viewing/editing
- **Version History**: Track changes to notes over time

## AI Tool Usage

AI tools (Claude, GitHub Copilot) accelerated development significantly:
- **Boilerplate**: Component structure, TypeScript types
- **Mock Data**: Realistic behavioral health conversation
- **API Routes**: CRUD operations and error handling
- **Documentation**: Initial structure and examples

### Key Learning
AI tools are excellent for accelerating implementation of well-defined tasks, but architectural decisions and UX design require human judgment. The most effective approach is using AI for rapid iteration while maintaining critical thinking about design tradeoffs.
