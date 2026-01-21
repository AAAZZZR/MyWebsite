"use client";
import React from 'react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import Tilt from 'react-parallax-tilt';

// Service card component with 3D tilt
const ServiceCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <Tilt
    tiltMaxAngleX={10}
    tiltMaxAngleY={10}
    perspective={1000}
    glareEnable={true}
    glareMaxOpacity={0.3}
    glareColor="#ffffff"
    scale={1.02}
    className="h-full"
  >
    <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-colors shadow-xl">
      <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-6 text-3xl border border-white/10 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-300 text-lg leading-relaxed">
        {desc}
      </p>
    </div>
  </Tilt>
);

export default function CompanyHome() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* --- Hero Section --- */}
      <section className="w-full max-w-5xl px-6 py-32 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-tight drop-shadow-2xl">
          Level up daily routine & Increase efficiency <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
            Less than $10/Day
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-12 leading-relaxed">
          We build custom AI agents that handle your paperwork, data entry, and repetitive workflows.
          Save hours every day for <strong>less than the cost of lunch.</strong>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/#contact"
            className="px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]"
          >
            Start Saving Time
          </Link>
          <Link
            href="/me"
            className="px-8 py-4 text-lg font-bold text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            Meet the Developer
          </Link>
        </div>
      </section>

      {/* --- Services Section --- */}
      <section className="w-full max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white">Why Choose Automation?</h2>
          <p className="text-slate-400 mt-4 text-lg">High-impact technical solutions at a fraction of the hiring cost.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ServiceCard
            icon="🤖"
            title="The <$10/Day Employee"
            desc="Why hire a virtual assistant for simple tasks? Our AI agents work 24/7 to process your documents, read emails, and enter data automatically."
          />

          <ServiceCard
            icon="⚡"
            title="Seamless Workflow Automation"
            desc="Connect your messy Excel sheets, Gmail, and CRM into one smooth pipeline. We use n8n to make your apps talk to each other without you lifting a finger."
          />

          <ServiceCard
            icon="💻"
            title="Modern Web Infrastructure"
            desc="Need a dashboard to visualize your data? We build high-performance Next.js applications that are fast, SEO-friendly, and easy to manage."
          />

          <ServiceCard
            icon="☁️"
            title="Set-and-Forget Cloud"
            desc="We handle the boring server stuff. Secure deployment on AWS/Azure means your automation runs smoothly in the background while you sleep."
          />
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="w-full px-6 py-24 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-6 text-white">
              Save your time today.
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Tell us what boring task you hate doing the most. We'll build a bot to do it for you.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all border border-white/5">
                  ✉️
                </div>
                <span className="text-slate-200 font-medium text-lg">ausrudyc2025@gmail.com</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all border border-white/5">
                  🌍
                </div>
                <span className="text-slate-200 font-medium text-lg">Remote / Worldwide Service</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-slate-900 rounded-3xl p-1 border border-white/10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}