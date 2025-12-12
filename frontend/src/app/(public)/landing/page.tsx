import { PublicLayout } from "@/components/layout";
import {
    HeroSection,
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
            <ProblemSolutionSection />
            <HowItWorksSection />
            <FeaturesSection />
            <UseCasesSection />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <FinalCTASection />
        </PublicLayout>
    );
}
