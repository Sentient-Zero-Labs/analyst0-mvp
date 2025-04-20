import Link from "next/link";
import {
  LuBrain, LuDatabase, LuLayoutDashboard, LuMessageSquare,
  LuShieldCheck, LuZap, LuSlack, LuGlobe, LuKey, LuLock, LuBrainCircuit
} from "react-icons/lu";
import { SiMysql, SiPostgresql, SiSnowflake } from "react-icons/si";
import Footer from "./footer";
import TokenHandler from "../../_components/TokenHandler";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <TokenHandler />
      {/* Hero Section with Diagram */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 opacity-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text Content */}
            <div className="text-left">
              <h1 className="text-6xl font-bold mb-6">
                Transform your data workflow with AI agents
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">
                  100x Faster Insights
                </span>
              </h1>
              <p className="text-xl text-foreground/70 mb-8">
                Leverage AI-powered analytics to unlock insights from your data 100x faster than traditional methods.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact-us"
                  className="px-8 py-3 border border-violet-500/20 rounded-lg font-medium hover:bg-violet-500/5 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* Right side - Interactive Diagram */}
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Central AI Circle */}
                <div className="w-64 h-64 relative mb-16">
                  <div className="absolute inset-0 bg-violet-400/20 rounded-full animate-pulse" />
                  <div className="absolute inset-4 bg-violet-400/10 rounded-full flex items-center justify-center">
                    <LuBrainCircuit className="w-24 h-24 text-violet-500" />
                  </div>

                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center">
                        <SiMysql className="w-8 h-8 text-violet-500" />
                      </div>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center">
                        <SiPostgresql className="w-8 h-8 text-violet-500" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center">
                        <SiSnowflake className="w-8 h-8 text-violet-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-violet-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-violet-50/50 dark:bg-violet-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Analyst Zero?</h2>
            <p className="text-xl text-foreground/70">Everything you need to understand your data</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <LuBrain className="w-6 h-6" />,
                title: "AI-Powered Analysis",
                description: "Ask questions in plain English and get instant insights from your data"
              },
              {
                icon: <LuMessageSquare className="w-6 h-6" />,
                title: "Natural Conversations",
                description: "Chat with your data like you're talking to a human analyst"
              },
              {
                icon: <LuDatabase className="w-6 h-6" />,
                title: "Multiple Data Sources",
                description: "Connect to PostgreSQL, MySQL, Snowflake and more"
              },
              {
                icon: <LuZap className="w-6 h-6" />,
                title: "Real-time Insights",
                description: "Get instant answers to your business questions"
              },
              {
                icon: <LuShieldCheck className="w-6 h-6" />,
                title: "Enterprise Security",
                description: "Bank-grade security with role-based access control"
              },
              {
                icon: <LuLayoutDashboard className="w-6 h-6" />,
                title: "Advanced Analytics",
                description: "Predictive analytics and trend analysis at your fingertips"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-background rounded-xl p-6 border border-violet-500/10 hover:border-violet-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with Visual Flow */}
      <section className="py-24 bg-violet-50/50 dark:bg-violet-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-foreground/70">Get started in minutes</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20" />

            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  number: "01",
                  title: "Connect Your Data",
                  description: "Securely connect your databases with just a few clicks",
                  icon: <LuDatabase className="w-8 h-8" />
                },
                {
                  number: "02",
                  title: "Create Agents",
                  description: "Set up AI agents tailored to your data needs in minutes",
                  icon: <LuBrainCircuit className="w-8 h-8" />
                },
                {
                  number: "03",
                  title: "Get Insights",
                  description: "Ask questions in plain English and receive instant insights",
                  icon: <LuMessageSquare className="w-8 h-8" />
                }
              ].map((step, idx) => (
                <div key={idx} className="relative bg-background p-8 rounded-xl border border-violet-500/10">
                  <div className="absolute -top-4 left-8 px-4 py-2 bg-violet-500 rounded-full text-white text-sm">
                    Step {step.number}
                  </div>
                  <div className="mb-6 text-violet-500">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Security Section with Flow Diagram */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-xl text-foreground/70">Your data never leaves your secure environment</p>
          </div>

          {/* Data Flow Diagram */}
          <div className="mb-16">
            <div className="relative max-w-4xl mx-auto">
              {/* Flow Steps */}
              <div className="grid grid-cols-3 gap-12 relative">
                {/* Connection Lines */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20" />
                <div className="absolute top-[calc(50%-1px)] left-0 w-full h-[2px] bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10" />

                {/* Step 1: User Query */}
                <div className="relative group">
                  <div className="bg-background border border-violet-500/20 rounded-xl p-6 relative z-10 h-full transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
                    <div className="absolute -top-3 -left-3 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <LuMessageSquare className="w-6 h-6 text-violet-500" />
                      </div>
                      <h4 className="font-semibold mb-2">1. Your Query</h4>
                      <p className="text-sm text-foreground/70">You ask a question in plain English</p>
                    </div>
                  </div>
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                    <div className="w-3 h-3 bg-violet-500/20 rounded-full">
                      <div className="w-2 h-2 bg-violet-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Step 2: AI Processing */}
                <div className="relative group">
                  <div className="bg-background border border-violet-500/20 rounded-xl p-6 relative z-10 h-full transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
                    <div className="absolute -top-3 -left-3 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <LuBrainCircuit className="w-6 h-6 text-violet-500" />
                      </div>
                      <h4 className="font-semibold mb-2">2. SQL Generation Engine</h4>
                      <p className="text-sm text-foreground/70">Our AI agent transforms your query using only schema metadata</p>

                      {/* SQL Generation Details */}
                      <div className="mt-4 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-violet-500/10 rounded-lg">
                            <LuShieldCheck className="w-4 h-4 text-violet-500" />
                          </div>
                          <span className="text-violet-500 font-medium text-sm">Secure Processing</span>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {[
                            "Only table schemas used",
                            "No access to actual data",
                            "Optimized query generation"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-foreground/70">
                              <div className="w-1 h-1 bg-violet-500/50 rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                    <div className="w-3 h-3 bg-violet-500/20 rounded-full">
                      <div className="w-2 h-2 bg-violet-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Step 3: Secure Execution */}
                <div className="relative group">
                  <div className="bg-background border border-violet-500/20 rounded-xl p-6 relative z-10 h-full transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5">
                    <div className="absolute -top-3 -left-3 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <LuDatabase className="w-6 h-6 text-violet-500" />
                      </div>
                      <h4 className="font-semibold mb-2">3. Secure Execution</h4>
                      <p className="text-sm text-foreground/70">Query executes in your environment, results delivered directly to you</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Callouts */}
              <div className="mt-16 grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <LuShieldCheck className="w-5 h-5" />,
                    title: "Zero Data Access",
                    description: "We never see or store your actual data"
                  },
                  {
                    icon: <LuKey className="w-5 h-5" />,
                    title: "Metadata Only",
                    description: "AI works with table schemas only"
                  },
                  {
                    icon: <LuLock className="w-5 h-5" />,
                    title: "Your Environment",
                    description: "All queries execute in your secure environment"
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 p-4 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-xl border border-violet-500/10 hover:border-violet-500/20 transition-all duration-300"
                  >
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-foreground/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Integrations</h2>
            <p className="text-xl text-foreground/70">Connect with your favorite tools and databases</p>
          </div>

          <div className="grid gap-16">
            {/* Data Sources */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-center">Data Sources</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <SiMysql className="w-12 h-12" />,
                    title: "MySQL",
                    description: "Connect to your MySQL databases securely"
                  },
                  {
                    icon: <SiPostgresql className="w-12 h-12" />,
                    title: "PostgreSQL",
                    description: "Full PostgreSQL database support"
                  },
                  {
                    icon: <SiSnowflake className="w-12 h-12" />,
                    title: "Snowflake",
                    description: "Enterprise-grade Snowflake integration"
                  }
                ].map((source, idx) => (
                  <div key={idx} className="flex flex-col items-center p-6 bg-violet-50/50 dark:bg-violet-950/10 rounded-xl">
                    <div className="text-violet-600 mb-4">{source.icon}</div>
                    <h4 className="text-xl font-semibold mb-2">{source.title}</h4>
                    <p className="text-center text-foreground/70">{source.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interfaces */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-center">Interfaces</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: <LuGlobe className="w-12 h-12" />,
                    title: "Web Platform",
                    description: "Access your analytics from anywhere with our modern web interface",
                    features: ["Interactive dashboards", "Real-time analytics", "Team collaboration"]
                  },
                  {
                    icon: <LuSlack className="w-12 h-12" />,
                    title: "Slack Integration",
                    description: "Get insights directly in your Slack channels",
                    features: ["Natural language queries", "Automated reports", "Team notifications"]
                  }
                ].map((interface_, idx) => (
                  <div key={idx} className="p-8 bg-violet-50/50 dark:bg-violet-950/10 rounded-xl">
                    <div className="text-violet-600 mb-4">{interface_.icon}</div>
                    <h4 className="text-xl font-semibold mb-2">{interface_.title}</h4>
                    <p className="mb-4 text-foreground/70">{interface_.description}</p>
                    <ul className="space-y-2">
                      {interface_.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center text-sm text-foreground/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-violet-50/50 dark:bg-violet-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Data Teams</h2>
            <p className="text-xl text-foreground/70">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Analyst Zero has transformed how our team interacts with data. The AI-powered insights have been game-changing.",
                author: "Sarah Chen",
                role: "Data Science Lead",
                company: "TechCorp Inc."
              },
              {
                quote: "The natural language interface makes it incredibly easy for our entire team to access data insights.",
                author: "Michael Rodriguez",
                role: "Analytics Manager",
                company: "DataFlow Systems"
              },
              {
                quote: "Seamless integration with our existing tools and excellent security features. Exactly what we needed.",
                author: "Emily Watson",
                role: "CTO",
                company: "Innovation Labs"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-background p-8 rounded-xl border border-violet-500/10">
                <div className="mb-6">
                  <svg className="h-8 w-8 text-violet-500/20" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-foreground/70 mb-6">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-foreground/70">{testimonial.role}</p>
                  <p className="text-sm text-foreground/70">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Enhanced */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-foreground/70">Enterprise-grade analytics with AI-powered intelligence</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ... existing features grid ... */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-violet-50/50 dark:bg-violet-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Data Analytics?</h2>
            <p className="text-xl text-foreground/70 mb-8">
              Join leading companies using Analyst Zero to make better decisions with data.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact-us"
                className="px-8 py-3 border border-violet-500/20 rounded-lg font-medium hover:bg-violet-500/5 transition-colors"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
