// Mock data for UI development
import type { TranscriptionData, ViewerSegment } from "./types";

const mockSegments: ViewerSegment[] = [
    {
        id: "seg-1",
        text: "Hello and welcome to today's episode of the Tech Talk podcast.",
        startSeconds: 0,
        endSeconds: 4.2,
        speaker: "John",
        isEdited: false,
    },
    {
        id: "seg-2",
        text: "We have a fantastic guest joining us today to discuss the future of artificial intelligence.",
        startSeconds: 4.2,
        endSeconds: 9.5,
        speaker: "John",
        isEdited: false,
    },
    {
        id: "seg-3",
        text: "Thank you so much for having me, John. It's great to be here.",
        startSeconds: 9.5,
        endSeconds: 13.0,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-4",
        text: "I've been following your work on machine learning for years now, and I'm really excited to dive into some of these topics.",
        startSeconds: 13.0,
        endSeconds: 19.5,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-5",
        text: "Let's start with the basics. What got you interested in AI in the first place?",
        startSeconds: 19.5,
        endSeconds: 24.0,
        speaker: "John",
        isEdited: false,
    },
    {
        id: "seg-6",
        text: "Well, it all started back in college when I took my first computer science course.",
        startSeconds: 24.0,
        endSeconds: 28.5,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-7",
        text: "I was fascinated by the idea that we could teach machines to learn and adapt.",
        startSeconds: 28.5,
        endSeconds: 33.0,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-8",
        text: "That's really interesting. And how has the field evolved since then?",
        startSeconds: 33.0,
        endSeconds: 37.5,
        speaker: "John",
        isEdited: false,
    },
    {
        id: "seg-9",
        text: "Oh, tremendously! The advances in deep learning and neural networks have been nothing short of revolutionary.",
        startSeconds: 37.5,
        endSeconds: 43.0,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-10",
        text: "We're now able to solve problems that seemed impossible just a decade ago.",
        startSeconds: 43.0,
        endSeconds: 48.0,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-11",
        text: "Things like natural language understanding, image recognition, and even creative tasks.",
        startSeconds: 48.0,
        endSeconds: 53.5,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-12",
        text: "Speaking of creative tasks, what are your thoughts on AI-generated art?",
        startSeconds: 53.5,
        endSeconds: 58.0,
        speaker: "John",
        isEdited: false,
    },
    {
        id: "seg-13",
        text: "That's a great question, and it's something I've been thinking about a lot lately.",
        startSeconds: 58.0,
        endSeconds: 62.5,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-14",
        text: "I think there's a place for AI as a tool to augment human creativity, not replace it.",
        startSeconds: 62.5,
        endSeconds: 68.0,
        speaker: "Jane",
        isEdited: false,
    },
    {
        id: "seg-15",
        text: "That's a really balanced perspective. Thank you for sharing your insights with us today.",
        startSeconds: 68.0,
        endSeconds: 73.5,
        speaker: "John",
        isEdited: false,
    },
];

export const mockTranscription: TranscriptionData = {
    id: "mock-transcription-1",
    fileName: "Tech_Talk_Episode_42.mp3",
    status: "completed",
    durationSeconds: 73.5,
    languageCode: "en",
    segments: mockSegments,
    audioUrl: null, // No audio for mock
};

// Alternative mock with no speakers (for testing without speaker labels)
export const mockTranscriptionNoSpeakers: TranscriptionData = {
    id: "mock-transcription-2",
    fileName: "Voice_Note_Recording.m4a",
    status: "completed",
    durationSeconds: 45.0,
    languageCode: "uk",
    segments: mockSegments.map(seg => ({ ...seg, speaker: null })),
    audioUrl: null,
};

// Mock for pending state
export const mockTranscriptionPending: TranscriptionData = {
    id: "mock-transcription-3",
    fileName: "New_Recording.wav",
    status: "processing",
    durationSeconds: 120.0,
    languageCode: "en",
    segments: [],
    audioUrl: null,
};
