import { LuSparkles, LuShieldCheck, LuTarget, LuActivity, LuUsers, LuTrendingUp } from "react-icons/lu";
import Footer from "../_components/landing-page/footer";
import Link from "next/link";

export default function About() {
  return (
    <div className="bg-background">
      {/* Modern Hero Section with Geometric Patterns */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 opacity-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text Content */}
            <div className="text-left">
              <h1 className="text-6xl font-bold text-foreground/90 mb-6">
                Redefining
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
                  {" "}Enterprise Analytics
                </span>
              </h1>
              <p className="text-xl text-foreground/70 mb-8">
                Empowering organizations with AI-driven insights that transform raw data into actionable intelligence.
              </p>
              <Link 
                href="/contact-us"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                Transform Your Business
              </Link>
            </div>

            {/* Right side - Illustration */}
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Analytics Dashboard */}
                <div className="absolute top-0 left-0 w-56">
                  <div className="flex flex-col gap-3">
                    <div className="h-3 w-full bg-blue-400/20 rounded-full" />
                    <div className="h-3 w-3/4 bg-pink-400/20 rounded-full" />
                  </div>
                </div>

                {/* Top Right Circle */}
                <div className="absolute top-0 right-0">
                  <div className="w-16 h-16 rounded-full bg-purple-400/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-purple-400/20" />
                  </div>
                </div>

                {/* Central AI Circle */}
                <div className="w-64 h-64 relative mb-16">
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full" />
                  <div className="absolute inset-4 bg-purple-400/10 rounded-full flex items-center justify-center">
                    <div className="text-5xl font-bold text-blue-500">AI</div>
                  </div>
                  
                  {/* Orbiting Points */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-pink-400 rounded-full" />
                  </div>
                </div>

                {/* Database and Insights */}
                <div className="flex flex-col items-center gap-8">
                  {/* Database boxes */}
                  <div className="flex gap-8">
                    {["SQL", "PG", "Snow"].map((db, i) => (
                      <div key={db} className="w-28 h-16 border-2 rounded-xl bg-background flex items-center justify-center"
                        style={{
                          borderColor: i === 0 ? "#60A5FA40" : i === 1 ? "#C084FC40" : "#F472B640",
                          color: i === 0 ? "#60A5FA" : i === 1 ? "#C084FC" : "#F472B6"
                        }}
                      >
                        <span className="text-lg font-medium">{db}</span>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  <div className="flex flex-col gap-3 w-full max-w-md">
                    <div className="px-6 py-2.5 bg-purple-400/5 border border-purple-400/20 rounded-xl">
                      <span className="text-base text-purple-400">Predictive Analytics</span>
                    </div>
                    <div className="px-6 py-2.5 bg-blue-400/5 border border-blue-400/20 rounded-xl">
                      <span className="text-base text-blue-400">Real-time Insights</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement with Modern Cards */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground/90 mb-4">Our Mission</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-pink-600 mx-auto"/>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LuSparkles className="w-8 h-8" />,
                title: "Innovation First",
                description: "Pioneering AI solutions that redefine how enterprises interact with their data."
              },
              {
                icon: <LuActivity className="w-8 h-8" />,
                title: "Data Democracy",
                description: "Making advanced analytics accessible to every business professional."
              },
              {
                icon: <LuTrendingUp className="w-8 h-8" />,
                title: "Rapid Insights",
                description: "Delivering real-time analytics that drive immediate business value."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition-all">
                <div className="bg-gradient-to-r from-blue-600/10 to-pink-600/10 rounded-lg p-3 inline-block mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-foreground/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Values Section */}
      <section className="py-24 bg-muted relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground/90 mb-4">Our Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-pink-600 mx-auto"/>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <LuShieldCheck className="w-12 h-12" />,
                title: "Enterprise Security",
                description: "Bank-grade security for your sensitive data analytics."
              },
              {
                icon: <LuTarget className="w-12 h-12" />,
                title: "Precision",
                description: "Accurate insights driving confident decisions."
              },
              {
                icon: <LuUsers className="w-12 h-12" />,
                title: "Collaboration",
                description: "Unified analytics for cross-functional teams."
              }
            ].map((value, idx) => (
              <div key={idx} 
                className="relative group bg-background rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-foreground/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10"/>
                <div className="text-gradient mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-foreground/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-gradient-to-r from-blue-600/10 to-pink-600/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Analytics?</h2>
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join leading enterprises in revolutionizing how teams interact with data.
            </p>
            <Link 
              href="/contact-us"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

