import React from 'react';
import { RESUME_DATA } from '@/data/resume-data';
import Link from 'next/link';

const TechBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 mr-2 mb-2">
    {children}
  </span>
);

export default function ResumePage() {
  const { personal, skills, languages, experience, projects, education } = RESUME_DATA;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* --- Header --- */}
        <header className="border-b border-slate-100 pb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            {personal.name}
          </h1>
          <p className="text-xl text-blue-600 font-semibold mb-6">
            {personal.title}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-500 mb-6">
            <span className="flex items-center gap-2">
              📍 {personal.location}
            </span>
            <a href={`mailto:${personal.email}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              ✉️ {personal.email}
            </a>
            <span className="flex items-center gap-2">
              📱 {personal.phone}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed max-w-2xl">
            {personal.bio}
          </p>

          <div className="mt-6 flex gap-4">
            {personal.website && (
              <a href={personal.website} target="_blank" className="text-sm font-bold text-slate-900 hover:underline">
                🌐 Portfolio / Live Demo
              </a>
            )}
            <a href={personal.github} target="_blank" className="text-sm font-bold text-slate-900 hover:underline">
              GitHub ↗
            </a>
          </div>
        </header>

        {/* --- Skills & Languages --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Skills</h2>
          </div>
          <div className="col-span-3">
            <div className="flex flex-wrap mb-6">
              {skills.map((skill) => (
                <TechBadge key={skill}>{skill}</TechBadge>
              ))}
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Languages</h3>
            <div className="flex gap-4 text-sm text-slate-600">
              {languages.map((lang) => (
                <span key={lang} className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{lang}</span>
              ))}
            </div>
          </div>
        </section>

        {/* --- Experience --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-lg font-bold text-slate-900">Experience</h2>
          </div>
          <div className="col-span-3 space-y-10">
            {experience.map((job, index) => (
              <div key={index} className="relative pl-6 border-l border-slate-200">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                  <h3 className="text-base font-bold text-slate-900">{job.role}</h3>
                  <span className="text-xs font-mono text-slate-500">{job.period}</span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{job.company}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  {job.description}
                </p>
                {/* Tags for job */}
                <div className="flex flex-wrap gap-2">
                  {job.tags?.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wide text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Projects --- */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-8 pb-2 border-b border-slate-100">Selected Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed h-20 overflow-hidden text-ellipsis">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map(t => (
                    <span key={t} className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* --- Education --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-lg font-bold text-slate-900">Education</h2>
          </div>
          <div className="col-span-3 space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{edu.school}</h3>
                  <p className="text-sm text-slate-600">{edu.degree}</p>
                </div>
                <span className="text-sm font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-12 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            ← Back to Services
          </Link>
        </footer>

      </div>
    </div>
  );
}