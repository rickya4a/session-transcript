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
- **Persist to Database**: Prisma + PostgreSQL with full CRUD API - changes saved when user clicks Save
- **Keyboard Navigation**: Use arrow keys (↑/↓) to navigate between note spans, Enter to view citations
- **Accessibility**: ARIA labels, focus management, keyboard support, and screen reader friendly

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Database**: Prisma ORM + PostgreSQL
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

## Approach and Key Decisions

### 1. Component Architecture
**Decision**: Separation of concerns with presentational and container components

- **Presentational Components** (`TranscriptPanel`, `NotePanel`): Focus solely on rendering UI, accept data via props
- **Container Component** (`SessionView`): Manages state and coordinates interactions between panels
- **Rationale**: This pattern makes components reusable, testable, and easier to reason about. State management is centralized, making data flow predictable.

### 2. Citation Linking Strategy
**Decision**: ID-based bidirectional linking with dynamic reverse lookup

- **Forward Linking (Note -> Transcript)**: Note spans store citation arrays with transcript segment IDs
- **Reverse Linking (Transcript -> Note)**: Dynamic lookup searches all notes to find which ones cite a segment
- **State Management**: 
  - `highlightedSegments`: Array of transcript IDs to highlight
  - `activeSegmentId`: Single segment to scroll into view
  - `activeNoteId`: Single note to scroll into view
- **Rationale**: Using IDs instead of indices makes references robust and allows for dynamic relationships. Bidirectional linking enhances discoverability and trust verification.

### 3. User Experience Design
**Decision**: Clinical workflow-focused with accessibility-first approach

- **Smooth Scrolling**: `scrollIntoView` with smooth behavior for better visual feedback
- **Visual Hierarchy**: Color-coded badges (blue=Clinician, green=Patient, amber=needs confirmation)
- **Keyboard Navigation**: Arrow keys (↑/↓) for navigation, Enter for action
- **Responsive Design**: Mobile-first with tab navigation on small screens, split-view on desktop
- **Rationale**: Clinicians need efficient workflows. Keyboard shortcuts and clear visual feedback reduce cognitive load. Mobile support ensures accessibility across devices.

### 4. Data Persistence Strategy
**Decision**: Manual save with immediate database persistence

- **Save on Demand**: User clicks "Save" button to persist edits to database via PATCH API
- **Immediate Persistence**: Once saved, changes are immediately written to database
- **Error Handling**: Error messages displayed via browser alert() notifications
- **Rationale**: Explicit save action gives users control over when changes are committed. Immediate persistence after save ensures data consistency and prevents data loss on page refresh.

### 5. Database Schema Design
**Decision**: Normalized schema with JSON storage for flexible citations

- **Relationships**: One-to-many (Session → TranscriptSegments, Session → NoteSpans)
- **Citations Storage**: JSON array of IDs in `NoteSpan.citations` field
- **Cascade Delete**: Deleting session removes all related data
- **Rationale**: Normalized structure ensures data integrity. JSON for citations allows flexibility while maintaining referential integrity through application logic.

### 6. Type Safety and Developer Experience
**Decision**: Full TypeScript with shared type definitions

- **Centralized Types**: All interfaces in `types/index.ts`
- **Type-safe API**: Prisma-generated types with manual transformation for frontend
- **Rationale**: Type safety catches errors at compile time, reduces bugs, and improves developer experience with better IDE support.

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
4. Updates `activeNoteId` with the first matching note ID
5. NotePanel highlights and scrolls to the related note

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
- **Edit Note**: Changes save to database via PATCH API when user clicks Save button
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

### Feature Enhancements
- **Audio Playback**: Synchronized audio playback with transcript timestamps for better context
- **Full-Text Search**: Search functionality across transcript and notes with highlighting
- **Multi-Session Management**: List view of all sessions with filtering and sorting
- **Session Comparison**: Side-by-side comparison of multiple sessions
- **Export Functionality**: PDF generation for signed notes with proper formatting
- **Version History**: Track all changes to notes with ability to view and restore previous versions
- **Real-time Collaboration**: Multiple users viewing/editing with presence indicators
- **Bulk Operations**: Select and edit multiple note spans at once

### Technical Improvements
- **Testing**: Add unit tests for components and integration tests for API routes
- **Performance Optimization**: Implement virtual scrolling for large transcripts, memoization for expensive computations
- **Caching Strategy**: Add Redis for session caching, implement API response caching
- **Authentication**: Add user authentication and authorization (NextAuth.js)
- **Audit Logging**: Track all changes with user attribution and timestamps
- **API Rate Limiting**: Protect API endpoints from abuse
- **WebSocket Support**: Real-time updates for collaborative editing

### UX Improvements
- **Undo/Redo**: Implement undo/redo functionality for note edits
- **Keyboard Shortcuts Panel**: Help modal showing all available keyboard shortcuts
- **Customizable Layout**: Allow users to resize panels and save preferences
- **Dark Mode**: Full dark mode support with system preference detection
- **Accessibility Audit**: Comprehensive accessibility audit and improvements based on WCAG 2.1 AA standards

## How I Used AI Tools and What I Learned

### How AI Accelerated Development

#### 1. **Boilerplate and Scaffolding**
- **Component Structure**: AI generated initial component skeletons with proper TypeScript types
- **API Routes**: Generated CRUD API routes with proper error handling and type safety
- **Prisma Schema**: Assisted in designing database schema with proper relationships

#### 2. **Implementation Details**
- **State Management**: AI helped design the state management pattern for bidirectional linking
- **Citation Logic**: Collaborated on the citation linking algorithm and highlighting mechanism
- **Responsive Design**: AI suggested mobile-first responsive patterns and tab navigation approach

#### 3. **Code Quality**
- **Error Handling**: Generated comprehensive error handling patterns for API routes
- **Accessibility**: AI suggested ARIA labels and keyboard navigation patterns

### What I Learned

#### **AI is Excellent For:**
- **Rapid Prototyping**: Quickly generating working code for well-defined requirements
- **Boilerplate Generation**: Creating repetitive code structures (components, API routes, types)
- **Pattern Implementation**: Implementing common patterns (CRUD operations, form handling)
- **Debugging**: Identifying and fixing common errors and type mismatches
- **Documentation**: Generating initial documentation structure and examples

#### **AI Requires Human Judgment For:**
- **Architectural Decisions**: Component structure, state management patterns, data flow design
- **UX Design**: User experience decisions, interaction patterns, visual hierarchy
- **Trade-offs**: Performance vs. complexity, features vs. scope, technical debt decisions
- **Domain Knowledge**: Clinical workflow understanding, healthcare-specific requirements
- **Code Review**: Ensuring code quality, security, and maintainability

#### **Most Effective Approach:**
The most productive workflow was using AI as a **collaborative partner** rather than a replacement for thinking:

1. **Define the Problem**: Clearly articulate what needs to be built
2. **Design the Solution**: Make architectural and UX decisions first
3. **Use AI for Implementation**: Generate code based on the design
4. **Review and Refine**: Critically review AI-generated code, test, and iterate
5. **Learn and Adapt**: Understand why AI made certain choices, learn from patterns

### Key Insight
AI tools dramatically accelerate development when used thoughtfully, but they don't replace the need for:
- **Critical Thinking**: Evaluating AI suggestions and making informed decisions
- **Domain Expertise**: Understanding clinical workflows and user needs
- **Code Quality**: Ensuring maintainability, security, and performance
- **User Experience**: Designing intuitive interactions that feel natural

The best results came from **iterative collaboration** - using AI to generate initial implementations, then refining based on testing, user feedback, and architectural considerations.
