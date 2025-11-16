'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TerminalComponent = dynamic(() => import('./components/Terminal'), {
  ssr: false,
});

interface CommandOutput {
  type: 'command' | 'output' | 'error';
  content: string | React.ReactNode;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string | string[];
}

interface Project {
  name: string;
  description: string;
  tech: string[];
}

interface Links {
  x: string;
  linkedin: string;
  github: string;
}

export default function Home() {
  const [aboutData, setAboutData] = useState<string>('');
  const [experienceData, setExperienceData] = useState<Experience[]>([]);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [linksData, setLinksData] = useState<Links>({ x: '', linkedin: '', github: '' });
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
"                                                                                      "
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
""
].join('\n');
  const asciiArtSmall = `
▄▖▌ ▘        ▌ 
▚ ▛▌▌▌▌▀▌▛▌▛▘▛▌
▄▌▌▌▌▚▘█▌▌▌▄▌▌▌
               
▄▖    ▘        
▚ ▛▌▛▌▌        
▄▌▙▌▌▌▌        
               `;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aboutRes, experienceRes, projectsRes, linksRes] = await Promise.all([
          fetch('/data/about.json'),
          fetch('/data/experience.json'),
          fetch('/data/projects.json'),
          fetch('/data/links.json')
        ]);

        const about = await aboutRes.json();
        const experience = await experienceRes.json();
        const projects = await projectsRes.json();
        const links = await linksRes.json();

        setAboutData(about);
        setExperienceData(experience);
        setProjectsData(projects);
        setLinksData(links);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const parseCommand = (input: string): string[] => {
    const match = input.match(/^([a-zA-Z0-9-]+)/);
    return match ? [match[1], input.substring(match[1].length).trim()] : [input.trim(), ''];
  };

  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
    brightGreen: '\x1b[92m',
  };

  const executeCommand = (input: string): CommandOutput[] => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return [];

    const [command, args] = parseCommand(trimmedInput);
    const outputs: CommandOutput[] = [];

    if (command === 'clear') {
      return [{ type: 'output', content: '__CLEAR__' }];
    }

    switch (command) {
      case 'shiv':
        if (args === 'help' || args === '--help' || args === '-h') {
          outputs.push({
            type: 'output',
            content: `${colors.white}Available commands:${colors.reset}\n` +
              `  ${colors.brightGreen}shiv${colors.reset}            ${colors.gray}-${colors.reset} Display ASCII art of my name\n` +
              `  ${colors.brightGreen}shiv help${colors.reset}       ${colors.gray}-${colors.reset} Show this help message\n` +
              `  ${colors.brightGreen}shiv about${colors.reset}      ${colors.gray}-${colors.reset} Display information about me\n` +
              `  ${colors.brightGreen}shiv experience${colors.reset} ${colors.gray}-${colors.reset} Show my work experience (use ${colors.brightGreen}--verbose${colors.reset} for all)\n` +
              `  ${colors.brightGreen}shiv projects${colors.reset}   ${colors.gray}-${colors.reset} List my projects (use ${colors.brightGreen}--verbose${colors.reset} for all)\n` +
              `  ${colors.brightGreen}shiv contact${colors.reset}    ${colors.gray}-${colors.reset} List contact options`
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
            type: 'output',
            content: `${displayContent}\n\nWelcome to Shiv's terminal. Type "shiv help" to get started.`
          });
        } else if (args === 'about') {
          if (!dataLoaded) {
            outputs.push({ type: 'output', content: 'Loading...' });
          } else {
            outputs.push({ type: 'output', content: aboutData });
          }
        } else if (args === 'experience' || args.startsWith('experience ')) {
          if (!dataLoaded) {
            outputs.push({ type: 'output', content: 'Loading...' });
          } else {
            const isVerbose = args.includes('--verbose') || args.includes('-v');
            const displayExperiences = isVerbose ? experienceData : experienceData.slice(0, 4);
            const hasMore = experienceData.length > 4 && !isVerbose;
            
            let content = '';
            displayExperiences.forEach((exp) => {
              content += `  ${colors.cyan}${exp.title} - ${exp.company}${colors.reset}\n`;
              content += `  ${colors.gray}${exp.period}${colors.reset}\n`;
              if (Array.isArray(exp.description)) {
                exp.description.forEach((desc) => {
                  content += `    • ${desc}\n`;
                });
              } else {
                content += `    • ${exp.description}\n`;
              }
              content += '\n';
            });
            
            if (hasMore) {
              content += `  ${colors.gray}Showing 4 of ${experienceData.length} experiences. Use ${colors.brightGreen}shiv experience --verbose${colors.reset}${colors.gray} to see all.${colors.reset}`;
            }
            
            outputs.push({ type: 'output', content: content.trim() });
          }
        } else if (args === 'projects' || args.startsWith('projects ')) {
          if (!dataLoaded) {
            outputs.push({ type: 'output', content: 'Loading...' });
          } else {
            const isVerbose = args.includes('--verbose') || args.includes('-v');
            const displayProjects = isVerbose ? projectsData : projectsData.slice(0, 4);
            const hasMore = projectsData.length > 4 && !isVerbose;
            
            let content = '';
            displayProjects.forEach((project) => {
              content += `  ${colors.magenta}${project.name}${colors.reset}\n`;
              content += `    • ${project.description}\n`;
              content += `    ${colors.gray}Tech: ${project.tech.join(', ')}${colors.reset}\n\n`;
            });
            
            if (hasMore) {
              content += `  ${colors.gray}Showing 4 of ${projectsData.length} projects. Use ${colors.brightGreen}shiv projects --verbose${colors.reset}${colors.gray} to see all.${colors.reset}`;
            }
            
            outputs.push({ type: 'output', content: content.trim() });
          }
        } else if (args === 'contact') {
          outputs.push({
            type: 'output',
            content: `${colors.gray}To contact me, type "shiv contact" followed by one of the options below.\n` +
              `For example: "shiv contact --email" or "shiv contact -e" (both work the same way).${colors.reset}\n\n` +
              `${colors.white}Contact options:${colors.reset}\n` +
              `  ${colors.brightGreen}--email${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-e${colors.reset}     ${colors.gray}-${colors.reset} Open email client\n` +
              `  ${colors.brightGreen}--message${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-m${colors.reset}  ${colors.gray}-${colors.reset} Open messages app\n` +
              `  ${colors.brightGreen}-x${colors.reset}                  ${colors.gray}-${colors.reset} Open X (Twitter) profile\n` +
              `  ${colors.brightGreen}--linkedin${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-l${colors.reset} ${colors.gray}-${colors.reset} Open LinkedIn profile\n` +
              `  ${colors.brightGreen}--github${colors.reset} ${colors.gray}or${colors.reset} ${colors.brightGreen}-g${colors.reset}    ${colors.gray}-${colors.reset} Open GitHub profile`
          });
        } else if (args.startsWith('contact ')) {
          const contactArg = args.substring(8).trim();
          if (contactArg === '--email' || contactArg === '-e') {
            window.location.href = 'mailto:shivanshsoni@berkeley.edu';
            outputs.push({ type: 'output', content: 'Opening email client...' });
          } else if (contactArg === '--message' || contactArg === '-m') {
            window.location.href = 'sms:+19516422354';
            outputs.push({ type: 'output', content: 'Opening messages app...' });
          } else if (contactArg === '-x') {
            if (linksData.x) {
              window.open(linksData.x, '_blank');
              outputs.push({ type: 'output', content: 'Opening X profile...' });
            } else {
              outputs.push({ type: 'output', content: 'X link not configured yet.' });
            }
          } else if (contactArg === '--linkedin' || contactArg === '-l') {
            if (linksData.linkedin) {
              window.open(linksData.linkedin, '_blank');
              outputs.push({ type: 'output', content: 'Opening LinkedIn profile...' });
            } else {
              outputs.push({ type: 'output', content: 'LinkedIn link not configured yet.' });
            }
          } else if (contactArg === '--github' || contactArg === '-g') {
            if (linksData.github) {
              window.open(linksData.github, '_blank');
              outputs.push({ type: 'output', content: 'Opening GitHub profile...' });
            } else {
              outputs.push({ type: 'output', content: 'GitHub link not configured yet.' });
            }
          } else {
            outputs.push({ 
              type: 'error', 
              content: `Invalid contact option: ${contactArg}. Use "shiv contact" to see available options.` 
            });
          }
        } else {
          const firstArg = args.split(/[\s\W]+/)[0] || args;
          outputs.push({ type: 'error', content: `zsh: command not found: ${firstArg}` });
        }
        break;
      default:
        const firstWord = trimmedInput.split(/[\s\W]+/)[0] || trimmedInput;
        outputs.push({ type: 'error', content: `zsh: command not found: ${firstWord}` });
    }

    return outputs;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[900px] h-full">
        <TerminalComponent
          onCommandExecute={executeCommand}
        />
      </div>
    </div>
  );
}
