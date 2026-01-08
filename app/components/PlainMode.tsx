"use client";

import type { Experience, Project, Links } from "../types";

interface PlainModeProps {
  experienceData: Experience[];
  projectsData: Project[];
  linksData: Links;
}

export default function PlainMode({
  experienceData,
  projectsData,
  linksData,
}: PlainModeProps) {
  // Normalize description to always be an array
  const normalizeDescription = (description?: string | string[]): string[] => {
    if (!description) return [];
    return Array.isArray(description) ? description : [description];
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <header className="py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
            Shivansh Soni
          </h1>
          <p className="text-xl md:text-2xl text-black mb-6">
            shivanshsoni [at] berkeley [dot] edu
          </p>
          <div className="text-black leading-relaxed max-w-3xl space-y-3">
            <p>
              Hey, I'm Shivansh, an engineer who's previously built systems at{" "}
              <span className="font-semibold">[Stealth Startup]</span>,{" "}
              <a
                href="https://magichour.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-black font-semibold underline decoration-black"
              >
                MagicHour AI
              </a>
              , and{" "}
              <a
                href="https://www.happyrobot.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-black font-semibold underline decoration-black"
              >
                Happyrobot
              </a>
              .
            </p>
            <p>
              Currently I'm building applied AI, fashion tech, and developer
              tools. I'm also studying EECS and Business at{" "}
              <span className="text-black font-semibold">
                UC Berkeley's M.E.T. program
              </span>
              .
            </p>
          </div>
        </header>

        {/* Experience Section */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl font-bold text-black mb-8 border-b-2 border-black pb-3">
            Experience
          </h2>
          <div className="space-y-8">
            {experienceData.map((exp, index) => (
              <div key={index} className="relative pl-6 group">
                <div className="absolute left-0 top-0 w-0.5 bg-black h-20 group-hover:h-full transition-all duration-500"></div>
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-white z-10"></div>
                <div className="cursor-pointer">
                  <h3 className="text-xl font-bold text-black">{exp.title}</h3>
                  <p className="text-lg text-black font-semibold">
                    {exp.company}
                  </p>
                  <p className="text-sm text-black font-mono mb-3">
                    {exp.period}
                  </p>
                </div>
                {normalizeDescription(exp.description).length > 0 && (
                  <div className="max-h-0 overflow-hidden group-hover:max-h-96 transition-all duration-500">
                    <ul className="space-y-2">
                      {normalizeDescription(exp.description).map((desc, i) => (
                        <li key={i} className="text-black flex">
                          <span className="mr-2 text-black">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-16 md:mb-20">
          <h2 className="text-3xl font-bold text-black mb-8 border-b-2 border-black pb-3">
            Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsData.map((project, index) => (
              <div
                key={index}
                className="p-6 bg-white border border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="text-xl font-bold text-black group-hover:text-black mb-2 flex items-center gap-2">
                      {project.name}
                      <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    </h3>
                  </a>
                ) : (
                  <h3 className="text-xl font-bold text-black mb-2">
                    {project.name}
                  </h3>
                )}
                <p className="text-black font-medium mb-3">{project.tagline}</p>
                <ul className="space-y-1 mb-4 text-sm text-black">
                  {project.description.slice(0, 2).map((desc, i) => (
                    <li key={i} className="flex">
                      <span className="mr-2 text-black">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white border border-black text-black text-xs rounded font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {project.period && (
                  <p className="text-xs text-black font-mono">
                    {project.period}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-8 border-b-2 border-black pb-3">
            Contact
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:shivanshsoni@berkeley.edu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
            >
              <span>📧</span>
              <span>Email</span>
            </a>
            <a
              href="sms:+19516422354"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
            >
              <span>💬</span>
              <span>Message</span>
            </a>
            {linksData.x && (
              <a
                href={linksData.x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors"
              >
                <span>🐙</span>
                <span>GitHub</span>
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-black text-sm py-8">
          <p>
            © {new Date().getFullYear()} Shivansh Soni. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
