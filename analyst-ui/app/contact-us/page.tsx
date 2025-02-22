import Footer from "../_components/landing-page/footer";
import ContactForm from "./contact-form";
import { LuBuilding, LuMail, LuPhone, LuClock } from "react-icons/lu";

export default function ContactUs() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 opacity-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">
              Let&apos;s Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
                {" "}Data Analytics
              </span>
            </h1>
            <p className="text-xl text-foreground/70">
              Connect with our team to explore how Analyst Zero can empower your organization with AI-driven insights.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-12 bg-background relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <LuBuilding className="w-6 h-6" />,
                title: "Enterprise Solutions",
                description: "Tailored for your business needs",
              },
              {
                icon: <LuMail className="w-6 h-6" />,
                title: "Email Us",
                description: "test@test.com",
                href: "mailto:test@test.com",
              },
              {
                icon: <LuPhone className="w-6 h-6" />,
                title: "Call Us",
                description: "+1234567890",
                href: "tel:+1234567890",
              },
              {
                icon: <LuClock className="w-6 h-6" />,
                title: "Response Time",
                description: "Within 24 hours",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-background border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition-all">
                <div className="bg-gradient-to-r from-blue-600/10 to-pink-600/10 rounded-lg p-3 inline-block mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-foreground/70 hover:text-foreground">
                    {item.description}
                  </a>
                ) : (
                  <p className="text-foreground/70">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted">
        <ContactForm />
      </section>

      <Footer />
    </div>
  );
}
