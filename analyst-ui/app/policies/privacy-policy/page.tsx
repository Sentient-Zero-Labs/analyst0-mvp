import Footer from "@/app/_components/landing-page/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 opacity-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-foreground/70">Last Updated: March 15, 2024</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <p className="text-foreground/70">
              At Analyst Zero, we prioritize the security and privacy of your data. Our platform is designed with 
              enterprise-grade security measures, ensuring your business intelligence remains protected while leveraging 
              our AI-powered analytics capabilities.
            </p>
          </div>

          {/* Key Sections - Keep structure but update content */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Data Collection & Processing</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <p>We collect and process:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Database metadata and schema information</li>
                  <li>User authentication details</li>
                  <li>Query patterns (anonymized)</li>
                  <li>Usage analytics for service improvement</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <p>Our security measures include:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>End-to-end encryption for all data transmissions</li>
                  <li>Secure database connections</li>
                  <li>Regular security audits</li>
                  <li>Role-based access control</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <p>For privacy-related inquiries:</p>
                <ul className="list-none pl-6 mt-2 space-y-2">
                  <li>Email: test@test.com</li>
                  <li>Phone: +1234567890</li>
                  <li>Response Time: Within 24 hours</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
