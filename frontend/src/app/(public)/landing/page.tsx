import {PublicLayout} from "@/components/layout";
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
    SectionSeparator,
} from "@/features/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <HeroSection/>
            <ProblemSolutionSection/>
            <HowItWorksSection/>
            <PricingSection/>
            <FeaturesSection/>
            <WhisperReviewsSection/>
            <UseCasesSection/>
            <FAQSection/>
            <FinalCTASection/>
        </PublicLayout>
    );
}
