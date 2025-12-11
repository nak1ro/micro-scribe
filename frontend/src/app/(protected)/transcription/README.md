# Transcription Feature

Transcription viewing and interaction.

## Routes: `/dashboard/transcription/[id]`

Detailed transcription view with segments and playback.
**Access**: Protected (requires authentication)

## Components To Build

- **TranscriptionViewer** - Full transcript display with segments
- **TranscriptSegment** - Individual segment with timestamp
- **TranscriptPlayer** - Audio/video player with sync
- **TranscriptExport** - Export options dropdown
- **TranscriptSearch** - Search within transcript
- **SpeakerLabel** - Speaker identification badge
- **ChapterList** - Chapter navigation (future)

## Features

- View full transcript with timestamps
- Click segments to jump to time in audio/video
- Export transcript (SRT, VTT, JSON, PlainText)
- Search within transcript
- Copy text functionality
