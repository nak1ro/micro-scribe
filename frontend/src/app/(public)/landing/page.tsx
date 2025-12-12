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
    FAQSection,
    FinalCTASection,
} from "@/features/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <HeroSection />
            <SocialProofSection />
            <PricingSection />
            <HowItWorksSection />
            <FeaturesSection />
            <UseCasesSection />
            <ProblemSolutionSection />
            <TestimonialsSection />
            <FinalCTASection />
            <FAQSection />
        </PublicLayout>
    );
}
