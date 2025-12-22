import { PublicLayout } from "@/components/layout";
import {
    HeroSection,
    SocialProofSection,
    ProblemSolutionSection,
    HowItWorksSection,
    FeaturesSection,
    UseCasesSection,
    PricingSection,
    TestimonialsSection,
    WhisperReviewsSection,
    FAQSection,
    FinalCTASection,
    SectionSeparator,
} from "@/features/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <HeroSection />
            <SectionSeparator />
            <PricingSection />
            <SectionSeparator />
            <HowItWorksSection />
            <SectionSeparator />
            <FeaturesSection />
            <WhisperReviewsSection />
            <SectionSeparator />
            <UseCasesSection />
            <SectionSeparator />
            <ProblemSolutionSection />
            <SectionSeparator />
            <FinalCTASection />
            <SectionSeparator />
            <FAQSection />
        </PublicLayout>
    );
}
