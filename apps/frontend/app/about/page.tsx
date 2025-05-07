import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mb-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

       


        <h2 className="text-3xl font-bold mb-4">Terms and Conditions</h2>
        <p className="text-base mb-2"><strong>Effective Date:</strong> May 8, 2025</p>

        <div className="space-y-4 text-base">
          <p>
            Welcome to Six (“we”, “us”, or “our”), a platform built to help you discover meaningful connections using the power of artificial intelligence and shared social networks. These Terms and Conditions (“Terms”) govern your access to and use of our website, located at https://sixsocialapp.com (the “Site”).
          </p>
          <p>
            By accessing or using the Site, you agree to be legally bound by these Terms. If you do not agree, please do not use the Site.
          </p>

          <h3 className="font-semibold mt-6">1. About Six</h3>
          <p>
          Six is an AI-powered matchmaking platform designed to help people form real connections — whether for friendship or dating. Users engage in a brief voice conversation with Six’s AI, which asks thoughtful, dynamic questions to understand their personality and preferences. Based on the insights gathered from this call, we introduce them to a potential match via messages. We provide light-touch support to help users connect meaningfully with their match — all while keeping the experience private, secure, and effortless.
          </p>

          <h3 className="font-semibold mt-6">2. Eligibility</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Be at least 18 years old,</li>
            <li>Have the legal authority to enter into these Terms,</li>
            <li>Use the Site only for personal, non-commercial purposes (unless otherwise agreed in writing).</li>
          </ul>

          <h3 className="font-semibold mt-6">3. User Data and Privacy</h3>
          <p>We care deeply about your privacy. By using our Site, you agree to the way we collect, store, and use your information as described here:</p>

          <strong>a. What We Collect</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>Your name and contact details (e.g., email or phone number)</li>
            <li>Social links (e.g., Instagram handle) if voluntarily submitted</li>
            <li>Voice data from AI calls (used strictly for analysis, not stored long-term)</li>
            <li>Device and usage information (for analytics and bug fixing)</li>
          </ul>

          <strong>b. How We Use Your Data</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>Determine your position on the waitlist</li>
            <li>Initiate onboarding and follow-ups via SMS or iMessage</li>
            <li>Improve match quality via voice personality recognition and social proximity analysis</li>
            <li>Build new features and user experiences based on feedback and engagement</li>
          </ul>

          <strong>c. We Never Share or Sell Your Data</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>Sell your personal data to third parties</li>
            <li>Share your identifiable information without your explicit consent</li>
            <li>Use your social data to target ads</li>
          </ul>
          <p>
            All data analysis is conducted in-house or with vetted tools that comply with GDPR, CCPA, and Apple’s privacy requirements.
          </p>

          <strong>d. Third-Party Services</strong>
          <p>
            We may use tools like Twilio for SMS delivery or GPT-4 for AI analysis. These services only access anonymized or non-identifiable data where possible, and all integrations are under strict confidentiality and compliance guidelines.
          </p>

          <h3 className="font-semibold mt-6">4. User Responsibilities</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate and truthful information when signing up</li>
            <li>Refrain from impersonating others or submitting fake identities</li>
            <li>Use the platform for authentic, respectful engagement</li>
          </ul>
          <p>We reserve the right to remove users from the waitlist or platform if their behavior violates our terms or ethical standards.</p>

          <h3 className="font-semibold mt-6">5. Intellectual Property</h3>
          <p>
            All content on the Site, including but not limited to the logo, brand name, copy, product design, UI/UX, and any AI processes described, is owned by Six or its licensors. You may not copy, modify, distribute, or use this content without permission.
          </p>

          <h3 className="font-semibold mt-6">6. No Warranties</h3>
          <p>
            The Site is provided “as is” and “as available.” We make no guarantees that the service will be uninterrupted, secure, or error-free. While we aim to offer magical matches, we can’t promise every experience will be perfect.
          </p>

          <h3 className="font-semibold mt-6">7. Limitation of Liability</h3>
          <p>
            To the fullest extent allowed by law, Six is not liable for any indirect, incidental, or consequential damages arising from your use of the Site or any user interaction.
          </p>

          <h3 className="font-semibold mt-6">8. Changes to the Terms</h3>
          <p>
            We may occasionally update these Terms. If we do, we’ll post them on this page and update the effective date. Continued use of the Site after changes implies your acceptance of the updated Terms.
          </p>

          <h3 className="font-semibold mt-6">9. Apple Business Messages Compliance</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Not initiating unsolicited messages</li>
            <li>Allowing users full control over when and how conversations are started</li>
            <li>Providing a clear and immediate way for users to stop receiving messages</li>
          </ul>
          <p>
            Apple users may engage with us via iMessage only after tapping a clear opt-in call-to-action on our website or app.
          </p>

          <h3 className="font-semibold mt-6">10. Contact</h3>
          <p>
            If you have questions about these Terms or your privacy, please contact us at:  
            <br />
            <strong>Email:</strong> contact@sixsocialapp.com
          </p>
        </div>
      </div>
    </main>
  )
}
