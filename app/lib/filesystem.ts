import type { Experience, Project, Links } from "../types";

export interface FSNode {
  type: "file" | "directory";
  name: string;
  content?: string;
  meta?: { url?: string; isContact?: boolean };
  children?: Map<string, FSNode>;
}

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  brightGreen: "\x1b[92m",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeFile(
  name: string,
  content: string,
  meta?: { url?: string; isContact?: boolean }
): FSNode {
  return { type: "file", name, content, meta };
}

function makeDir(name: string, children: FSNode[]): FSNode {
  const map = new Map<string, FSNode>();
  children.forEach((c) => map.set(c.name, c));
  return { type: "directory", name, children: map };
}

export class VirtualFileSystem {
  private root: FSNode;
  private cwd: string = "/";

  constructor() {
    this.root = makeDir("/", []);
  }

  buildFromData(
    experiences: Experience[],
    projects: Project[],
    links: Links,
    aboutContent: string
  ) {
    // Experience files
    const expFiles = experiences.map((exp) => {
      const slug = slugify(exp.company.split(",")[0]);
      let content = "";
      if (exp.url) {
        content += `${colors.cyan}${exp.title}${colors.reset}\n`;
        content += `\x1b]8;;${exp.url}\x07${colors.magenta}${exp.company}${colors.reset}\x1b]8;;\x07\n`;
      } else {
        content += `${colors.cyan}${exp.title}${colors.reset}\n`;
        content += `${colors.white}${exp.company}${colors.reset}\n`;
      }
      content += `${colors.gray}${exp.period}${colors.reset}\n\n`;
      if (exp.description) {
        const descs = Array.isArray(exp.description)
          ? exp.description
          : [exp.description];
        descs.forEach((d) => {
          content += `  * ${d}\n`;
        });
      }
      const yearMatch = exp.period.match(/(\d{4})\s*$/);
      const yearPrefix = yearMatch ? yearMatch[1].slice(-2) + '-' : '';
      return makeFile(`${yearPrefix}${slug}.txt`, content, { url: exp.url });
    });

    // Project files
    const projFiles = projects.map((proj) => {
      const slug = slugify(proj.name);
      let content = "";
      if (proj.link && proj.link.trim()) {
        content += `\x1b]8;;${proj.link}\x07${colors.magenta}${proj.name}${colors.reset}\x1b]8;;\x07\n`;
      } else {
        content += `${colors.magenta}${proj.name}${colors.reset}\n`;
      }
      content += `${colors.cyan}${proj.tagline}${colors.reset}\n\n`;
      proj.description.forEach((d) => {
        content += `  * ${d}\n`;
      });
      content += `\n${colors.gray}Tech: ${proj.tech.join(", ")}${colors.reset}\n`;
      if (proj.period) {
        content += `${colors.gray}${proj.period}${colors.reset}\n`;
      }
      return makeFile(`${slug}.txt`, content, {
        url: proj.link || undefined,
      });
    });

    // Contact files
    const contactFiles: FSNode[] = [
      makeFile("email.txt", "shivanshsoni@berkeley.edu", {
        url: "mailto:shivanshsoni@berkeley.edu",
        isContact: true,
      }),
    ];
    if (links.x) {
      contactFiles.push(
        makeFile(
          "x.txt",
          `\x1b]8;;${links.x}\x07${colors.cyan}${links.x}${colors.reset}\x1b]8;;\x07`,
          { url: links.x, isContact: true }
        )
      );
    }
    if (links.linkedin) {
      contactFiles.push(
        makeFile(
          "linkedin.txt",
          `\x1b]8;;${links.linkedin}\x07${colors.cyan}${links.linkedin}${colors.reset}\x1b]8;;\x07`,
          { url: links.linkedin, isContact: true }
        )
      );
    }
    if (links.github) {
      contactFiles.push(
        makeFile(
          "github.txt",
          `\x1b]8;;${links.github}\x07${colors.cyan}${links.github}${colors.reset}\x1b]8;;\x07`,
          { url: links.github, isContact: true }
        )
      );
    }

    this.root = makeDir("/", [
      makeFile("about.txt", aboutContent),
      makeDir("contact", contactFiles),
      makeDir("experience", expFiles),
      makeDir("projects", projFiles),
    ]);
  }

  resolvePath(input: string): string {
    let path = input.trim();
    if (!path || path === "~") return "/";
    if (path.startsWith("~/")) path = "/" + path.slice(2);
    if (!path.startsWith("/")) {
      path = this.cwd === "/" ? "/" + path : this.cwd + "/" + path;
    }

    const parts = path.split("/").filter(Boolean);
    const resolved: string[] = [];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    return "/" + resolved.join("/");
  }

  getNode(absolutePath: string): FSNode | null {
    if (absolutePath === "/") return this.root;
    const parts = absolutePath.split("/").filter(Boolean);
    let node = this.root;
    for (const part of parts) {
      if (node.type !== "directory" || !node.children) return null;
      const child = node.children.get(part);
      if (!child) return null;
      node = child;
    }
    return node;
  }

  ls(path?: string): string {
    const absPath = path ? this.resolvePath(path) : this.cwd;
    const node = this.getNode(absPath);
    if (!node) return `ls: ${path || absPath}: No such file or directory`;
    if (node.type === "file") return node.name;
    if (!node.children || node.children.size === 0) return "";

    const entries: string[] = [];
    const sorted = Array.from(node.children.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const child of sorted) {
      if (child.type === "directory") {
        entries.push(`${colors.cyan}${child.name}/${colors.reset}`);
      } else {
        entries.push(`${colors.brightGreen}${child.name}${colors.reset}`);
      }
    }
    return entries.join("  ");
  }

  cd(path?: string): string | null {
    if (!path || path === "~") {
      this.cwd = "/";
      return null;
    }
    const absPath = this.resolvePath(path);
    const node = this.getNode(absPath);
    if (!node) return `cd: no such file or directory: ${path}`;
    if (node.type !== "directory") return `cd: not a directory: ${path}`;
    this.cwd = absPath;
    return null;
  }

  cat(path: string): { content: string; meta?: FSNode["meta"] } {
    const absPath = this.resolvePath(path);
    const node = this.getNode(absPath);
    if (!node)
      return { content: `cat: ${path}: No such file or directory` };
    if (node.type === "directory")
      return { content: `cat: ${path}: Is a directory` };
    return { content: node.content || "", meta: node.meta };
  }

  pwd(): string {
    return this.getCwdDisplay();
  }

  getCwd(): string {
    return this.cwd;
  }

  getCwdDisplay(): string {
    if (this.cwd === "/") return "~";
    return "~" + this.cwd;
  }

  getCompletions(
    partial: string,
    isFirstWord: boolean
  ): { completions: string[]; replaceFrom: number } {
    const commandNames = [
      "ls",
      "cd",
      "cat",
      "pwd",

      "clear",
      "rm",
      "whoami",
    ];

    if (isFirstWord) {
      const matches = commandNames.filter((c) => c.startsWith(partial));
      return { completions: matches, replaceFrom: 0 };
    }

    // Path completion
    const lastSlash = partial.lastIndexOf("/");
    let dirPath: string;
    let prefix: string;

    if (lastSlash === -1) {
      dirPath = this.cwd;
      prefix = partial;
    } else {
      dirPath = this.resolvePath(partial.slice(0, lastSlash + 1));
      prefix = partial.slice(lastSlash + 1);
    }

    const node = this.getNode(dirPath);
    if (!node || node.type !== "directory" || !node.children) {
      return { completions: [], replaceFrom: 0 };
    }

    const matches: string[] = [];
    for (const [name, child] of node.children) {
      if (name.startsWith(prefix)) {
        const suffix = child.type === "directory" ? "/" : "";
        if (lastSlash === -1) {
          matches.push(name + suffix);
        } else {
          matches.push(partial.slice(0, lastSlash + 1) + name + suffix);
        }
      }
    }

    return {
      completions: matches,
      replaceFrom: 0,
    };
  }
}
