'use client'

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

export default function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    error?: string;
  }>({});

  async function handleSubmit(formData: FormData) {
    const result = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
    
    setSubmitStatus(result);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground/90 mb-4">Get in Touch</h2>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Tell us about your organization and data needs. Our team will get back to you with personalized solutions.
        </p>
      </div>

      {submitStatus.success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          Thank you for reaching out! Our team will contact you within 24 hours to discuss your requirements.
        </div>
      )}
      
      {submitStatus.error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {submitStatus.error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6 bg-background p-8 rounded-xl border border-foreground/10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Work Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@company.com"
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:ring focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Company Name</label>
            <input
              type="text"
              name="company"
              placeholder="Your Company"
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/70">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              placeholder="Your Role"
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:ring focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">Message</label>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us about your data analytics needs and challenges..."
            className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:ring focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <div className="text-center">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit"
      className="relative h-12 w-full md:w-auto"
      disabled={pending}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-pink-500 to-orange-500 rounded-lg"></div>
      <div className="px-8 h-full bg-black rounded-lg relative group transition duration-300 text-white hover:bg-transparent flex items-center justify-center min-w-[200px]">
        {pending ? 'Sending...' : 'Request Demo'}
      </div>
    </button>
  );
} 