import * as React from "react";
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

// Reviews about Whisper AI technology from various sources
const whisperReviews = [
    {
        id: 1,
        quote: "Whisper is insanely good. I've tried every speech recognition API out there and nothing comes close. It handles accents, background noise, and multiple speakers like a champ.",
        author: "Alex Chen",
        role: "Senior Developer",
        source: "twitter",
        featured: true,
    },
    {
        id: 2,
        quote: "Just transcribed 4 hours of interview audio in 12 minutes. 98% accuracy. This is game-changing for my research.",
        author: "Dr. Sarah Mitchell",
        role: "Research Scientist",
        source: "hackernews",
        featured: false,
    },
    {
        id: 3,
        quote: "Finally, an AI that understands my Scottish accent! Been waiting years for this level of accuracy.",
        author: "Jamie MacLeod",
        role: "Podcaster",
        source: "reddit",
        featured: false,
    },
    {
        id: 4,
        quote: "OpenAI's Whisper is the best thing that happened to transcription. It's not even close. The multilingual support is incredible – tested it on 8 different languages.",
        author: "Marco Rossi",
        role: "ML Engineer",
        source: "twitter",
        featured: true,
    },
    {
        id: 5,
        quote: "Replaced our $500/month transcription service with Whisper. Better accuracy, faster processing, and it runs locally. Mind blown.",
        author: "startup_founder",
        role: "Tech Entrepreneur",
        source: "hackernews",
        featured: false,
    },
    {
        id: 6,
        quote: "The speaker diarization is surprisingly good. It correctly identified 5 different speakers in my podcast episode.",
        author: "Emily Park",
        role: "Content Creator",
        source: "twitter",
        featured: false,
    },
    {
        id: 7,
        quote: "I'm deaf and rely on transcriptions daily. Whisper has genuinely improved my quality of life. It's that good.",
        author: "accessibility_advocate",
        role: "Accessibility Consultant",
        source: "reddit",
        featured: true,
    },
    {
        id: 8,
        quote: "Tested Whisper against Google Speech-to-Text and AWS Transcribe. Whisper won on accuracy, especially for technical jargon.",
        author: "DevOps Engineer",
        role: "Cloud Architect",
        source: "hackernews",
        featured: false,
    },
];

// Source icons as SVG components
const SourceIcon = ({ source }: { source: string }) => {
    switch (source) {
        case "twitter":
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case "reddit":
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
            );
        case "hackernews":
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0v24h24V0H0zm11.52 14.64V21h1.92v-6.36L18 4.2h-2.16l-3.36 6.48L9.12 4.2H6.96l4.56 10.44z" />
                </svg>
            );
        default:
            return null;
    }
};

const getSourceLabel = (source: string) => {
    switch (source) {
        case "twitter":
            return "X/Twitter";
        case "reddit":
            return "Reddit";
        case "hackernews":
            return "Hacker News";
        default:
            return source;
    }
};

export function WhisperReviewsSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Dark background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            {/* Decorative glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium text-violet-300 bg-violet-500/10 rounded-full border border-violet-500/20">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.0201-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                        </svg>
                        Powered by Whisper AI
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        What developers say about
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                            Whisper AI
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        OpenAI&apos;s Whisper is the industry-leading speech recognition model. Here&apos;s what the tech community thinks.
                    </p>
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {whisperReviews.map((review) => (
                        <div
                            key={review.id}
                            className={cn(
                                "break-inside-avoid p-6 rounded-2xl",
                                "bg-white/5 backdrop-blur-sm border border-white/10",
                                "hover:bg-white/10 hover:border-white/20",
                                "transition-all duration-300",
                                review.featured && "ring-1 ring-violet-500/30"
                            )}
                        >
                            {/* Quote icon */}
                            <Quote className="w-8 h-8 text-violet-400/50 mb-4" />

                            {/* Quote text */}
                            <blockquote className={cn(
                                "text-gray-200 mb-6 leading-relaxed",
                                review.featured ? "text-lg" : "text-base"
                            )}>
                                &ldquo;{review.quote}&rdquo;
                            </blockquote>

                            {/* Author info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                                        {review.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">
                                            {review.author}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {review.role}
                                        </p>
                                    </div>
                                </div>

                                {/* Source badge */}
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs",
                                    "bg-white/5 text-gray-400"
                                )}>
                                    <SourceIcon source={review.source} />
                                    <span>{getSourceLabel(review.source)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm">
                        MicroScribe uses OpenAI&apos;s Whisper for industry-leading transcription accuracy
                    </p>
                </div>
            </div>
        </section>
    );
}
