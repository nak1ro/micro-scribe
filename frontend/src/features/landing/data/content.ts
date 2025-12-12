// Landing Page Content - Centralized for easy updates
// All strings, numbers, and configuration in one place

export const siteConfig = {
    name: "MicroScribe",
    tagline: "Transcription made easy",
    description:
        "AI-powered transcription with timestamps, summaries, and translations. Upload and get results in seconds.",
};

export const heroContent = {
    headline: "Transcribe Audio in Minutes with AI Accuracy",
    subheadline:
        "AI-powered transcription with timestamps, summaries, and translations. Upload your audio or video and get results in seconds.",
    primaryCTA: {
        label: "Start Free",
        href: "/auth?mode=signup",
    },
    secondaryCTA: {
        label: "See How It Works",
        href: "#how-it-works",
    },
    trustBadges: [
        "Free tier available",
        "No credit card required",
        "50+ languages",
    ],
    stats: [
        { value: "1.2M+", label: "Minutes transcribed" },
        { value: "50K+", label: "Happy users" },
        { value: "50+", label: "Languages" },
    ],
};

export const problemSolutionContent = {
    heading: "Why Manual Transcription Doesn't Work",
    items: [
        {
            icon: "Clock",
            problem: "Slow & Time-Consuming",
            solution: "Transcribe hours of audio in minutes, not days",
        },
        {
            icon: "DollarSign",
            problem: "Expensive Services",
            solution: "Start free, upgrade only when you need more",
        },
        {
            icon: "XCircle",
            problem: "Inaccurate Results",
            solution: "AI-powered accuracy with timestamps and speaker detection",
        },
    ],
};

export const howItWorksContent = {
    heading: "3 Easy Steps to Perfect Transcription",
    steps: [
        {
            number: 1,
            icon: "Upload",
            title: "Upload",
            description: "Drag & drop your audio or video file (MP3, WAV, MP4, etc.)",
        },
        {
            number: 2,
            icon: "Zap",
            title: "Transcribe",
            description: "Our AI processes your file with timestamps and speaker labels",
        },
        {
            number: 3,
            icon: "Edit",
            title: "Edit & Export",
            description: "Review, edit, summarize, or export in multiple formats",
        },
    ],
    cta: {
        label: "Try It Now – Free Account",
        href: "/auth?mode=signup",
    },
};

export const featuresContent = {
    heading: "Everything You Need for Perfect Transcriptions",
    subheading: "Powered by advanced AI technology",
    features: [
        {
            icon: "Zap",
            title: "Lightning Fast",
            description: "Upload files up to 5 hours long and get transcripts in minutes",
        },
        {
            icon: "Target",
            title: "AI-Powered Accuracy",
            description: "Industry-leading accuracy with speaker detection and timestamps",
        },
        {
            icon: "Bot",
            title: "AI Summarization",
            description: "Get instant summaries – perfect for long meetings or podcasts",
        },
        {
            icon: "Globe",
            title: "Multi-Language Support",
            description: "Transcribe in 50+ languages with automatic detection",
        },
        {
            icon: "Languages",
            title: "Translation",
            description: "Translate your transcripts into multiple languages instantly",
        },
        {
            icon: "Edit3",
            title: "Smart Editor",
            description: "Edit transcripts inline – click text to jump to audio position",
        },
        {
            icon: "Download",
            title: "Export Options",
            description: "Download as TXT, SRT, VTT, DOCX, or PDF",
        },
        {
            icon: "Clock",
            title: "Precise Timestamps",
            description: "Every sentence timestamped automatically for easy reference",
        },
    ],
};

export const useCasesContent = {
    heading: "Perfect for Everyone",
    cases: [
        {
            icon: "Mic",
            title: "Content Creators",
            description:
                "Transcribe YouTube videos, podcasts, and interviews for show notes and SEO",
        },
        {
            icon: "GraduationCap",
            title: "Students & Researchers",
            description: "Turn lectures and research interviews into searchable text",
        },
        {
            icon: "Briefcase",
            title: "Business Professionals",
            description: "Convert meetings and calls into actionable summaries",
        },
        {
            icon: "Newspaper",
            title: "Journalists & Writers",
            description: "Transcribe interviews and get AI summaries instantly",
        },
        {
            icon: "BookOpen",
            title: "Language Learners",
            description: "Transcribe and translate content to learn faster",
        },
        {
            icon: "Accessibility",
            title: "Accessibility",
            description: "Make audio content accessible to deaf and hard-of-hearing audiences",
        },
    ],
};

// Plan limits from backend configuration
export const planLimits = {
    free: {
        dailyTranscriptionLimit: 10,
        maxMinutesPerFile: 10,
        maxFileSizeMB: 100, // 104857600 bytes
        maxFilesPerUpload: 1,
        maxConcurrentJobs: 1,
        priorityProcessing: false,
        translation: false,
        allModels: false,
        unlimitedStorage: false,
    },
    pro: {
        dailyTranscriptionLimit: null, // unlimited
        maxMinutesPerFile: 300, // 5 hours
        maxFileSizeMB: 1024, // 1GB
        maxFilesPerUpload: 50,
        maxConcurrentJobs: 5,
        priorityProcessing: true,
        translation: true,
        allModels: true,
        unlimitedStorage: true,
    },
};

export const pricingContent = {
    heading: "Simple, Transparent Pricing",
    subheading: "Start free, upgrade as you grow",
    tiers: [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out",
            features: [
                `${planLimits.free.dailyTranscriptionLimit} transcriptions/day`,
                `Up to ${planLimits.free.maxMinutesPerFile} min per file`,
                `${planLimits.free.maxFileSizeMB}MB max file size`,
                "Basic timestamps",
                "TXT export",
                "1 language",
            ],
            limitations: [
                "No translation",
                "No priority processing",
                "Standard queue",
            ],
            cta: {
                label: "Start Free",
                href: "/auth?mode=signup",
                variant: "outline" as const,
            },
            highlighted: false,
        },
        {
            name: "Pro",
            price: "$12",
            period: "month",
            description: "For power users",
            badge: "Most Popular",
            features: [
                "Unlimited transcriptions",
                `Up to ${planLimits.pro.maxMinutesPerFile / 60} hours per file`,
                `${planLimits.pro.maxFileSizeMB / 1024}GB max file size`,
                `Up to ${planLimits.pro.maxFilesPerUpload} files at once`,
                `${planLimits.pro.maxConcurrentJobs} concurrent jobs`,
                "Priority processing",
                "All export formats",
                "50+ languages",
                "Translation",
                "Unlimited storage",
            ],
            limitations: [],
            cta: {
                label: "Get Started",
                href: "/auth?mode=signup",
                variant: "default" as const,
            },
            highlighted: true,
        },
    ],
    note: "All plans start with a free trial • No credit card required • Cancel anytime",
};

export const testimonialsContent = {
    heading: "Loved by Thousands",
    testimonials: [
        {
            quote:
                "MicroScribe saves me hours every week. I just upload my podcast episodes and get perfect transcripts in minutes.",
            name: "Sarah Chen",
            role: "Podcaster",
            rating: 5,
        },
        {
            quote:
                "Finally, a transcription tool that actually works! The accuracy is incredible, even with my professors' accents.",
            name: "Marcus Johnson",
            role: "Graduate Student",
            rating: 5,
        },
        {
            quote:
                "The meeting summaries feature is a game-changer. Our team productivity has skyrocketed.",
            name: "Emily Rodriguez",
            role: "Product Manager",
            rating: 5,
        },
        {
            quote:
                "As a journalist, I need accurate transcripts fast. MicroScribe delivers every time.",
            name: "David Kim",
            role: "Investigative Journalist",
            rating: 5,
        },
        {
            quote:
                "I use it for all my YouTube videos. The closed captions look professional and save me so much time.",
            name: "Alex Turner",
            role: "Content Creator",
            rating: 5,
        },
        {
            quote:
                "Being able to search through my research interviews is invaluable. Worth every penny.",
            name: "Dr. Lisa Patel",
            role: "Research Scientist",
            rating: 5,
        },
    ],
};

export const faqContent = {
    heading: "Frequently Asked Questions",
    questions: [
        {
            question: "What file formats do you support?",
            answer:
                "We support all major audio and video formats including MP3, WAV, M4A, MP4, MOV, AVI, WebM, and more. If your file plays on your device, we can transcribe it.",
        },
        {
            question: "How accurate is the transcription?",
            answer:
                "Our AI achieves 95%+ accuracy on clear audio. Accuracy depends on audio quality, background noise, and speaker clarity. You can always edit the transcript in our built-in editor.",
        },
        {
            question: "What languages do you support?",
            answer:
                "We support 50+ languages including English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Japanese, Korean, Chinese, and many more.",
        },
        {
            question: "Can I edit the transcription?",
            answer:
                "Yes! Our in-browser editor lets you make corrections with ease. Click any text to jump to that point in the audio for verification.",
        },
        {
            question: "What's included in the free tier?",
            answer: `The free tier includes ${planLimits.free.dailyTranscriptionLimit} transcriptions per day, up to ${planLimits.free.maxMinutesPerFile} minutes per file. No credit card required to get started.`,
        },
        {
            question: "How long does transcription take?",
            answer:
                "Most files are processed in 2-5 minutes. Longer files (over 1 hour) may take 10-15 minutes. Pro users get priority processing for faster results.",
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer:
                "Yes, you can cancel your subscription at any time from your account settings. Your data remains accessible until the end of your billing period.",
        },
        {
            question: "Is my data secure?",
            answer:
                "Absolutely. All uploads are encrypted in transit and at rest. We never share your data with third parties, and you can delete your files at any time.",
        },
        {
            question: "Do you offer refunds?",
            answer:
                "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
        },
        {
            question: "Can I transcribe YouTube videos?",
            answer:
                "Yes! You can download YouTube videos and upload them directly. We support all common video formats.",
        },
    ],
};

export const finalCTAContent = {
    heading: "Ready to Transform Your Audio into Text?",
    subheading: "Join thousands who are saving time with AI transcription",
    cta: {
        label: "Start Free – No Credit Card Required",
        href: "/auth?mode=signup",
    },
    note: `Free tier includes ${planLimits.free.dailyTranscriptionLimit} transcriptions/day • Upgrade anytime`,
};
