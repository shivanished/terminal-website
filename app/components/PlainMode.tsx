"use client";

import { useState } from "react";
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
  const [visibleProjects, setVisibleProjects] = useState(4);

  // Normalize description to always be an array
  const normalizeDescription = (description?: string | string[]): string[] => {
    if (!description) return [];
    return Array.isArray(description) ? description : [description];
  };

  const handleSeeMore = () => {
    setVisibleProjects((prev) => Math.min(prev + 4, projectsData.length));
  };

  const displayedProjects = projectsData.slice(0, visibleProjects);
  const hasMore = visibleProjects < projectsData.length;

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-tinos), serif" }}
    >
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <header className="pt-6 md:pt-8 pb-6 md:pb-8">
          <h1 className="text-xl md:text-2xl font-bold text-black mb-3">
            Shivansh Soni
          </h1>
          <p className="text-base md:text-lg text-black mb-1">
            shivanshsoni [at] berkeley [dot] edu
          </p>
          <div className="text-black mb-6">
            {linksData.github && (
              <a
                href={linksData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline decoration-black"
              >
                Github
              </a>
            )}
            {linksData.x && (
              <>
                {" "}
                <a
                  href={linksData.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline decoration-black"
                >
                  X
                </a>
              </>
            )}
            {linksData.linkedin && (
              <>
                {" "}
                <a
                  href={linksData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline decoration-black"
                >
                  Linkedin
                </a>
              </>
            )}
            {linksData.instagram && (
              <>
                {" "}
                <a
                  href={linksData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline decoration-black"
                >
                  Instagram
                </a>
              </>
            )}
          </div>
          <div className="text-black leading-relaxed max-w-3xl space-y-3">
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
        <section className="mb-8 md:mb-10">
          <h2 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-2">
            Experience
          </h2>
          <div className="space-y-6">
            {experienceData.map((exp, index) => (
              <div
                key={index}
                className="relative pl-6 border-l-2 border-black group"
              >
                <div className="cursor-pointer">
                  <h3 className="text-base font-bold text-black">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-black font-semibold">
                    {exp.company}
                  </p>
                  <p className="text-xs text-black mb-2">{exp.period}</p>
                </div>
                {normalizeDescription(exp.description).length > 0 && (
                  <div className="max-h-0 overflow-hidden group-hover:max-h-96 transition-all duration-500">
                    <ul className="space-y-1 pb-2">
                      {normalizeDescription(exp.description).map((desc, i) => (
                        <li key={i} className="text-black flex text-sm">
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
        <section className="mb-8 md:mb-10">
          <h2 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-2">
            Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProjects.map((project, index) =>
              project.link ? (
                <a
                  key={index}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white border border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col h-full"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                      {project.name}
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    </h3>
                    <p className="text-sm text-black font-medium mb-2">
                      {project.tagline}
                    </p>
                    <ul className="space-y-1 mb-3 text-xs text-black">
                      {project.description.slice(0, 2).map((desc, i) => (
                        <li key={i} className="flex">
                          <span className="mr-2 text-black">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-white border border-black text-black text-[10px] rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  {project.period && (
                    <p className="text-[10px] text-black mt-auto">
                      {project.period}
                    </p>
                  )}
                </a>
              ) : (
                <div
                  key={index}
                  className="p-4 bg-white border border-black rounded-lg flex flex-col h-full"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-black mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-black font-medium mb-2">
                      {project.tagline}
                    </p>
                    <ul className="space-y-1 mb-3 text-xs text-black">
                      {project.description.slice(0, 2).map((desc, i) => (
                        <li key={i} className="flex">
                          <span className="mr-2 text-black">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-white border border-black text-black text-[10px] rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  {project.period && (
                    <p className="text-[10px] text-black mt-auto">
                      {project.period}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
          {hasMore && (
            <div className="text-black mt-6">
              <button
                onClick={handleSeeMore}
                className="text-black underline decoration-black cursor-pointer hover:no-underline"
              >
                See More
              </button>
            </div>
          )}
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
