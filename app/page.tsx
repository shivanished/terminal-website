"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TerminalComponent = dynamic(() => import("./components/Terminal"), {
  ssr: false,
});

interface CommandOutput {
  type: "command" | "output" | "error";
  content: string | React.ReactNode;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description?: string | string[];
}

interface Project {
  name: string;
  tagline: string;
  description: string[];
  tech: string[];
  link?: string;
  period?: string;
}

interface Links {
  x: string;
  linkedin: string;
  github: string;
}

export default function Home() {
  const [experienceData, setExperienceData] = useState<Experience[]>([]);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [linksData, setLinksData] = useState<Links>({
    x: "",
    linkedin: "",
    github: "",
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  const asciiArtLarge = [
    "                                                                                      ",
    "                                                                                      ",
    "  .--.--.     ,---,                                                         ,---,     ",
    " /  /    '. ,--.' |      ,--,                                             ,--.' |     ",
    "|  :  /`. / |  |  :    ,--.'|                             ,---,           |  |  :     ",
    ";  |  |--`  :  :  :    |  |,      .---.               ,-+-. /  | .--.--.  :  :  :     ",
    "|  :  ;_    :  |  |,--.`--'_    /.  ./|   ,--.--.    ,--.'|'   |/  /    ' :  |  |,--. ",
    " \\  \\    `. |  :  '   |,' ,'| .-' . ' |  /       \\  |   |  ,\"' |  :  /`./ |  :  '   | ",
    "  `----.   \\|  |   /' :'  | |/___/ \\: | .--.  .-. | |   | /  | |  :  ;_   |  |   /' : ",
    "  __ \\  \\  |'  :  | | ||  | :.   \\  ' .  \\__\\/: . . |   | |  | |\\  \\    `.'  :  | | | ",
    " /  /`--'  /|  |  ' | :'  : |_\\   \\   '  ,\" .--.; | |   | |  |/  `----.   \\  |  ' | : ",
    "'--'.     / |  :  :_:,'|  | '.'\\   \\    /  /  ,.  | |   | |--'  /  /`--'  /  :  :_:,' ",
    "  `--'---'  |  | ,'    ;  :    ;\\   \\ |;  :   .'   \\|   |/     '--'.     /|  | ,'     ",
    "  .--.--.   `--''      |  ,   /  '---\" |  ,     .-./'---'        `--'---' `--''       ",
    " /  /    '.             ---`-'      ,--,`--`---'                                      ",
    "|  :  /`. /    ,---.        ,---, ,--.'|                                               ",
    ";  |  |--`    '   ,'\\   ,-+-. /  ||  |,                                                ",
    "|  :  ;_     /   /   | ,--.'|'   |`--'_                                                ",
    " \\  \\    `. .   ; ,. :|   |  ,\"' |,' ,'|                                               ",
    "  `----.   \\'   | |: :|   | /  | |'  | |                                               ",
    "  __ \\  \\  |'   | .; :|   | |  | ||  | :                                               ",
    " /  /`--'  /|   :    ||   | |  |/ '  : |__                                             ",
    "'--'.     /  \\   \\  / |   | |--'  |  | '.'|                                            ",
    "  `--'---'    `----'  |   |/      ;  :    ;                                            ",
    "                      '---'       |  ,   /                                             ",
    "                                   ---`-'                                              ",
    "                                                                                      ",
  ].join("\n");

  const asciiArtMed = [
    " .----..-. .-..-..-. .-.  .--.  .-. .-. .----..-. .-.",
    "{ {__  | {_} || || | | | / {} \\ |  `| |{ {__  | {_} |",
    ".-._} }| { } || |\\ \\_/ //  /\\  \\| |\\  |.-._} }| { } |",
    "`----' `-' `-'`-' `---' `-'  `-'`-' `-'`----' `-' `-'",
    " .----. .----. .-. .-..-.",
    "{ {__  /  {}  \\|  `| || |",
    ".-._} }\\      /| |\\  || |",
    "`----'  `----' `-' `-'`-'",
    "",
  ].join("\n");
  const asciiArtSmall = `
▄▖▌ ▘        ▌ 
▚ ▛▌▌▌▌▀▌▛▌▛▘▛▌
▄▌▌▌▌▚▘█▌▌▌▄▌▌▌
               
▄▖    ▘        
▚ ▛▌▛▌▌        
▄▌▙▌▌▌▌        
               `;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [experienceRes, projectsRes, linksRes] = await Promise.all([
          fetch("/data/experience.json"),
          fetch("/data/projects.json"),
          fetch("/data/links.json"),
        ]);

        const experience = await experienceRes.json();
        const projects = await projectsRes.json();
        const links = await linksRes.json();

        setExperienceData(experience);
        setProjectsData(projects);
        setLinksData(links);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const parseCommand = (input: string): string[] => {
    const match = input.match(/^([a-zA-Z0-9-]+)/);
    return match
      ? [match[1], input.substring(match[1].length).trim()]
      : [input.trim(), ""];
  };

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

  const executeCommand = (input: string): CommandOutput[] => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return [];

    const [command, args] = parseCommand(trimmedInput);
    const outputs: CommandOutput[] = [];

    if (command === "clear") {
      return [{ type: "output", content: "__CLEAR__" }];
    }

    switch (command) {
      case "shiv":
        if (args === "help" || args === "--help" || args === "-h") {
          outputs.push({
            type: "output",
            content:
              `${colors.white}Available commands:${colors.reset}\n` +
              `  ${colors.brightGreen}shiv${colors.reset}            ${colors.gray}-${colors.reset} Display ASCII art of my name\n` +
              `  ${colors.brightGreen}shiv help${colors.reset}       ${colors.gray}-${colors.reset} Show this help message\n` +
              `  ${colors.brightGreen}shiv experience${colors.reset} ${colors.gray}-${colors.reset} Show my work experience (use ${colors.brightGreen}--all${colors.reset} for all)\n` +
              `  ${colors.brightGreen}shiv projects${colors.reset}   ${colors.gray}-${colors.reset} List my projects (use ${colors.brightGreen}--all${colors.reset} for all, ${colors.brightGreen}--verbose${colors.reset} for descriptions)\n` +
              `  ${colors.brightGreen}shiv contact${colors.reset}    ${colors.gray}-${colors.reset} List contact options`,
          });
        } else if (!args) {
          let displayContent: string;
          if (windowWidth >= 885) {
            displayContent = `${colors.brightGreen}${asciiArtLarge}${colors.reset}`;
          } else if (windowWidth >= 548) {
            displayContent = `${colors.brightGreen}${asciiArtMed}${colors.reset}`;
          } else {
            displayContent = `${colors.brightGreen}${asciiArtSmall}${colors.reset}`;
          }
          outputs.push({
            type: "output",
            content:
              `${displayContent}\n\nHey, I'm Shivansh, an engineer who's previously built systems at ` +
              `${colors.white}[Stealth Startup]${colors.reset}, ` +
              `\x1b]8;;https://magichour.ai/\x1b\\${colors.magenta}[MagicHour AI]${colors.reset}\x1b]8;;\x1b\\, and ` +
              `\x1b]8;;https://www.happyrobot.ai/\x1b\\${colors.cyan}[Happyrobot]${colors.reset}\x1b]8;;\x1b\\. ` +
              `\n\nCurrently I'm building applied AI, fashion tech, and developer tools. I'm also ` +
              `studying EECS and Business at ${colors.yellow}UC Berkeley's M.E.T. program${colors.reset}. ` +
              `\n\nType "shiv help" to get started.`,
          });
        } else if (args === "experience" || args.startsWith("experience ")) {
          if (!dataLoaded) {
            outputs.push({ type: "output", content: "Loading..." });
          } else {
            const showAll = args.includes("--all") || args.includes("-a");
            const displayExperiences = showAll
              ? experienceData
              : experienceData.slice(0, 4);
            const hasMore = experienceData.length > 4 && !showAll;

            let content = "";
            displayExperiences.forEach((exp) => {
              content += `  ${colors.cyan}${exp.title} - ${exp.company}${colors.reset}\n`;
              content += `  ${colors.gray}${exp.period}${colors.reset}\n`;
              if (exp.description) {
                if (Array.isArray(exp.description)) {
                  exp.description.forEach((desc) => {
                    content += `    • ${desc}\n`;
                  });
                } else {
                  content += `    • ${exp.description}\n`;
                }
              }
              content += "\n";
            });

            if (hasMore) {
              content += `  ${colors.gray}Showing 4 of ${experienceData.length} experiences. Use ${colors.brightGreen}shiv experience --all${colors.reset}${colors.gray} to see all.${colors.reset}`;
            }

            outputs.push({ type: "output", content: content.trim() });
          }
        } else if (args === "projects" || args.startsWith("projects ")) {
          if (!dataLoaded) {
            outputs.push({ type: "output", content: "Loading..." });
          } else {
            const showAll = args.includes("--all") || args.includes("-a");
            const showDescriptions =
              args.includes("--verbose") || args.includes("-v");
            const displayProjects = showAll
              ? projectsData
              : projectsData.slice(0, 4);
            const hasMore = projectsData.length > 4 && !showAll;

            let content = "";
            displayProjects.forEach((project, index) => {
              let titleLine: string;
              if (project.link && project.link.trim()) {
                const leadingSpaces = project.name.match(/^\s*/)?.[0] || "";
                const trailingSpaces = project.name.match(/\s*$/)?.[0] || "";
                const trimmedName = project.name.trim();

                titleLine = `${leadingSpaces}\x1b]8;;${project.link}\x1b\\${colors.magenta}${trimmedName}${colors.reset}\x1b]8;;\x1b\\${trailingSpaces}`;
              } else {
                titleLine = `${colors.magenta}${project.name}${colors.reset}`;
              }
              content += `  ${titleLine}\n`;
              content += `    ${colors.cyan}${project.tagline}${colors.reset}\n`;
              if (showDescriptions) {
                project.description.forEach((desc) => {
                  content += `    • ${desc}\n`;
                });
                content += `    ${colors.gray}Tech: ${project.tech.join(", ")}${
                  colors.reset
                }\n`;
                if (project.period) {
                  content += `    ${colors.gray}Period: ${project.period}${colors.reset}\n`;
                }
              }
              content += "\n";
            });

            if (hasMore) {
              content += `  ${colors.gray}Showing 4 of ${projectsData.length} projects. Add the --all flag (${colors.brightGreen}shiv projects --all${colors.reset}${colors.gray}) to see all projects. Add the ${colors.brightGreen}--verbose${colors.reset}${colors.gray} flag for descriptions. Add both for both.${colors.reset}`;
            }

            outputs.push({ type: "output", content: content.trimEnd() });
          }
        } else if (args === "contact") {
          outputs.push({
            type: "output",
            content:
              `${colors.cyan}To contact me, type "shiv contact" followed by one of the options below.\n` +
              `For example: "shiv contact --email" or "shiv contact -e" (both work the same way).${colors.reset}\n\n` +
              `${colors.white}Contact options:${colors.reset}\n` +
              `  ${colors.brightGreen}--email${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-e${colors.reset}     ${colors.gray}-${colors.reset} Open email client\n` +
              `  ${colors.brightGreen}--message${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-m${colors.reset}   ${colors.gray}-${colors.reset} Open messages app\n` +
              `  ${colors.brightGreen}-x${colors.reset}                ${colors.gray}-${colors.reset} Open X (Twitter) profile\n` +
              `  ${colors.brightGreen}--linkedin${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-l${colors.reset}  ${colors.gray}-${colors.reset} Open LinkedIn profile\n` +
              `  ${colors.brightGreen}--github${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-g${colors.reset}    ${colors.gray}-${colors.reset} Open GitHub profile`,
          });
        } else if (args.startsWith("contact ")) {
          const contactArg = args.substring(8).trim();
          if (contactArg === "--email" || contactArg === "-e") {
            window.location.href = "mailto:shivanshsoni@berkeley.edu";
            outputs.push({
              type: "output",
              content: "Opening email client...",
            });
          } else if (contactArg === "--message" || contactArg === "-m") {
            window.location.href = "sms:+19516422354";
            outputs.push({
              type: "output",
              content: "Opening messages app...",
            });
          } else if (contactArg === "-x") {
            if (linksData.x) {
              window.open(linksData.x, "_blank");
              outputs.push({ type: "output", content: "Opening X profile..." });
            } else {
              outputs.push({
                type: "output",
                content: "X link not configured yet.",
              });
            }
          } else if (contactArg === "--linkedin" || contactArg === "-l") {
            if (linksData.linkedin) {
              window.open(linksData.linkedin, "_blank");
              outputs.push({
                type: "output",
                content: "Opening LinkedIn profile...",
              });
            } else {
              outputs.push({
                type: "output",
                content: "LinkedIn link not configured yet.",
              });
            }
          } else if (contactArg === "--github" || contactArg === "-g") {
            if (linksData.github) {
              window.open(linksData.github, "_blank");
              outputs.push({
                type: "output",
                content: "Opening GitHub profile...",
              });
            } else {
              outputs.push({
                type: "output",
                content: "GitHub link not configured yet.",
              });
            }
          } else {
            outputs.push({
              type: "error",
              content: `Invalid contact option: ${contactArg}. Use "shiv contact" to see available options.`,
            });
          }
        } else {
          const firstArg = args.split(/[\s\W]+/)[0] || args;
          outputs.push({
            type: "error",
            content: `zsh: command not found: ${firstArg}`,
          });
        }
        break;

      case "rm":
        outputs.push({
          type: "output",
          content: "Yo chill don't delete anything haha...",
        });
        break;
      default:
        const firstWord = trimmedInput.split(/[\s\W]+/)[0] || trimmedInput;
        outputs.push({
          type: "error",
          content: `zsh: command not found: ${firstWord}`,
        });
    }

    return outputs;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[900px] h-full">
        <TerminalComponent onCommandExecute={executeCommand} />
      </div>
    </div>
  );
}
