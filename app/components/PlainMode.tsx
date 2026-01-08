'use client';

import type { Experience, Project, Links } from '../types';

interface PlainModeProps {
  experienceData: Experience[];
  projectsData: Project[];
  linksData: Links;
}

export default function PlainMode({ experienceData, projectsData, linksData }: PlainModeProps) {
  // Normalize description to always be an array
  const normalizeDescription = (description?: string | string[]): string[] => {
    if (!description) return [];
    return Array.isArray(description) ? description : [description];
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <header className="py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Shivansh Soni
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            Engineer & Builder
          </p>
          <div className="text-gray-700 leading-relaxed max-w-3xl mx-auto space-y-3">
            <p>
              Hey, I'm Shivansh, an engineer who's previously built systems at{' '}
              <span className="font-semibold">[Stealth Startup]</span>,{' '}
              <a
                href="https://magichour.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-magenta-600 hover:text-magenta-700 font-semibold underline decoration-magenta-300"
              >
                MagicHour AI
              </a>, and{' '}
              <a
                href="https://www.happyrobot.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 font-semibold underline decoration-cyan-300"
              >
                Happyrobot
              </a>.
            </p>
            <p>
              Currently I'm building applied AI, fashion tech, and developer tools. I'm also
              studying EECS and Business at{' '}
              <span className="text-yellow-700 font-semibold">UC Berkeley's M.E.T. program</span>.
            </p>
          </div>
        </header>

        {/* Experience Section */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-3">
            Experience
          </h2>
          <div className="space-y-8">
            {experienceData.map((exp, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-cyan-500">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white"></div>
                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                <p className="text-lg text-cyan-600 font-semibold">{exp.company}</p>
                <p className="text-sm text-gray-500 font-mono mb-3">{exp.period}</p>
                {normalizeDescription(exp.description).length > 0 && (
                  <ul className="space-y-2">
                    {normalizeDescription(exp.description).map((desc, i) => (
                      <li key={i} className="text-gray-700 flex">
                        <span className="mr-2 text-cyan-600">•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-3">
            Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsData.map((project, index) => (
              <div
                key={index}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="text-xl font-bold text-magenta-600 group-hover:text-magenta-700 mb-2 flex items-center gap-2">
                      {project.name}
                      <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    </h3>
                  </a>
                ) : (
                  <h3 className="text-xl font-bold text-magenta-600 mb-2">
                    {project.name}
                  </h3>
                )}
                <p className="text-cyan-600 font-medium mb-3">{project.tagline}</p>
                <ul className="space-y-1 mb-4 text-sm text-gray-700">
                  {project.description.slice(0, 2).map((desc, i) => (
                    <li key={i} className="flex">
                      <span className="mr-2 text-gray-400">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {project.period && (
                  <p className="text-xs text-gray-500 font-mono">{project.period}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-3">
            Contact
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:shivanshsoni@berkeley.edu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span>📧</span>
              <span>Email</span>
            </a>
            <a
              href="sms:+19516422354"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span>💬</span>
              <span>Message</span>
            </a>
            {linksData.x && (
              <a
                href={linksData.x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>𝕏</span>
                <span>X</span>
              </a>
            )}
            {linksData.linkedin && (
              <a
                href={linksData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>💼</span>
                <span>LinkedIn</span>
              </a>
            )}
            {linksData.github && (
              <a
                href={linksData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>🐙</span>
                <span>GitHub</span>
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>© {new Date().getFullYear()} Shivansh Soni. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
