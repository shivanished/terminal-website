"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useViewMode } from "./contexts/ViewModeContext";
import PlainMode from "./components/PlainMode";
import ModeToggle from "./components/ModeToggle";
import TerminalWindow from "./components/TerminalWindow";
import WallpaperBackground from "./components/WallpaperBackground";
import { VirtualFileSystem } from "./lib/filesystem";
import { executeCommand as execCmd } from "./lib/commands";
import type { Experience, Project, Links } from "./types";

const TerminalComponent = dynamic(() => import("./components/Terminal"), {
  ssr: false,
});

interface CommandOutput {
  type: "command" | "output" | "error";
  content: string | React.ReactNode;
}

export default function Home() {
  const { mode } = useViewMode();
  const [experienceData, setExperienceData] = useState<Experience[]>([]);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [linksData, setLinksData] = useState<Links>({
    x: "",
    linkedin: "",
    github: "",
    instagram: "",
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem());

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

        // Build VFS with loaded data (about.txt content built later with ASCII art)
        vfsRef.current.buildFromData(experience, projects, links, "");

        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Set html and body background color based on mode
  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const body = document.body;

      if (mode === "plain") {
        html.style.backgroundColor = "#ffffff";
        body.style.backgroundColor = "#ffffff";
      } else {
        html.style.backgroundColor = "#1a1a2e";
        body.style.backgroundColor = "#1a1a2e";
      }
    }
  }, [mode]);

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

  const getAboutContent = useCallback(() => {
    let asciiArt: string;
    if (windowWidth >= 885) {
      asciiArt = `${colors.brightGreen}${asciiArtLarge}${colors.reset}`;
    } else if (windowWidth >= 548) {
      asciiArt = `${colors.brightGreen}${asciiArtMed}${colors.reset}`;
    } else {
      asciiArt = `${colors.brightGreen}${asciiArtSmall}${colors.reset}`;
    }
    return (
      `${asciiArt}\n\nHey, I'm Shivansh, an engineer who's previously built systems at ` +
      `${colors.white}[Stealth Startup]${colors.reset}, ` +
      `\x1b]8;;https://magichour.ai/\x07${colors.magenta}[MagicHour AI]${colors.reset}\x1b]8;;\x07, and ` +
      `\x1b]8;;https://www.happyrobot.ai/\x07${colors.cyan}[Happyrobot]${colors.reset}\x1b]8;;\x07. ` +
      `\n\nCurrently I'm building in applied AI, fashion tech, and developer tools. I'm also ` +
      `studying EECS and Business at ${colors.yellow}UC Berkeley's M.E.T. program${colors.reset}. ` +
      `\n`
    );
  }, [windowWidth]);

  const executeCommand = useCallback(
    (input: string): CommandOutput[] => {
      if (!dataLoaded) return [{ type: "output", content: "Loading..." }];
      return execCmd(input, {
        fs: vfsRef.current,
        windowWidth,
        getAboutContent,
      });
    },
    [dataLoaded, windowWidth, getAboutContent]
  );

  const getPrompt = useCallback(() => {
    const cwd = vfsRef.current.getCwdDisplay();
    return `\x1b[32mshivansh\x1b[0m@\x1b[36mterminal\x1b[0m:\x1b[33m${cwd}\x1b[0m\x1b[32m$\x1b[0m `;
  }, []);

  const getPromptRaw = useCallback(() => {
    const cwd = vfsRef.current.getCwdDisplay();
    return `shivansh@terminal:${cwd}$ `;
  }, []);

  return (
    <>
      {/* Mode toggle */}
      <ModeToggle />

      {/* Conditional rendering based on mode */}
      {mode === "tui" ? (
        <div
          className="h-screen w-screen overflow-hidden relative"
          style={{
            background: "#1a1a2e",
          }}
        >
          <WallpaperBackground />
          <TerminalWindow>
            <TerminalComponent
              onCommandExecute={executeCommand}
              getPrompt={getPrompt}
              getPromptRaw={getPromptRaw}
              vfs={vfsRef.current}
            />
          </TerminalWindow>
        </div>
      ) : (
        <div className="min-h-screen w-full bg-white">
          <PlainMode
            experienceData={experienceData}
            projectsData={projectsData}
            linksData={linksData}
          />
        </div>
      )}
    </>
  );
}
