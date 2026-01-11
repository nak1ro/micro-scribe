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
} from "@/features/marketing/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <LandingBackground>
                <HeroSection />
                <ProblemSolutionSection />
                <HowItWorksSection />
                <FeaturesSection />
                <UseCasesSection />
                <PricingSection />
                <WhisperReviewsSection />
                <FAQSection />
                <FinalCTASection />
            </LandingBackground>
        </PublicLayout>
    );
}


