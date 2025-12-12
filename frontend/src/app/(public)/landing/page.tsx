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
    SectionSeparator,
} from "@/features/landing";

export default function LandingPage() {
    return (
        <PublicLayout>
            <HeroSection />
            <SectionSeparator variant="gradient" />
            <SocialProofSection />
            <SectionSeparator />
            <PricingSection />
            <SectionSeparator/>
            <HowItWorksSection />
            <SectionSeparator />
            <FeaturesSection />
            <SectionSeparator/>
            <UseCasesSection />
            <SectionSeparator />
            <ProblemSolutionSection />
            <SectionSeparator/>
            <TestimonialsSection />
            <SectionSeparator />
            <FinalCTASection />
            <SectionSeparator/>
            <FAQSection />
        </PublicLayout>
    );
}
