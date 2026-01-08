export interface Experience {
  title: string;
  company: string;
  period: string;
  description?: string | string[];
}

export interface Project {
  name: string;
  tagline: string;
  description: string[];
  tech: string[];
  link?: string;
  period?: string;
}

export interface Links {
  x: string;
  linkedin: string;
  github: string;
  instagram?: string;
}
