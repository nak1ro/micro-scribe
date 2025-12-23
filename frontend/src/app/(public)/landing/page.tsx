import { PublicLayout } from "@/components/layout";
import {
    HeroSection,
    ProblemSolutionSection,
    HowItWorksSection,
    FeaturesSection,
    UseCasesSection,
    PricingSection,
    WhisperReviewsSection,
    FAQSection,
    FinalCTASection,
    LandingBackground,
    TestimonialsSection,
} from "@/features/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <LandingBackground>
                <HeroSection />
                <ProblemSolutionSection />
                <HowItWorksSection />
                <PricingSection />
                <FeaturesSection />
                <WhisperReviewsSection />
                <UseCasesSection />
                <FAQSection />
                <FinalCTASection />
            </LandingBackground>
        </PublicLayout>
    );
}


