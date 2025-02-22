import Footer from "@/app/_components/landing-page/footer";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 opacity-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-foreground/70">Last Updated: March 15, 2024</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <p className="text-foreground/70">
              Welcome to Analyst Zero. By using our services, you agree to these terms. Our platform provides 
              enterprise-grade AI-powered analytics solutions, designed to transform how organizations interact with their data.
            </p>
          </div>

          {/* Key Sections */}
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Service Usage</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access to AI-powered analytics tools</li>
                  <li>Secure database integrations</li>
                  <li>Real-time insights generation</li>
                  <li>Enterprise collaboration features</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Enterprise Commitments</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>99.9% uptime guarantee</li>
                  <li>24/7 enterprise support</li>
                  <li>Regular feature updates</li>
                  <li>Dedicated success manager</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <p>For terms-related inquiries:</p>
                <ul className="list-none pl-6 mt-2 space-y-2">
                  <li>Email: test@test.com</li>
                  <li>Phone: +1234567890</li>
                  <li>Business Hours: 24/7 Support</li>
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
