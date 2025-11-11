'use client';

import { useState, useRef, useEffect } from 'react';
import data from '../data.json';

interface CommandOutput {
  type: 'command' | 'output' | 'error';
  content: string | React.ReactNode;
}

export default function Home() {
  const [commandHistory, setCommandHistory] = useState<CommandOutput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const parseCommand = (input: string): string[] => {
    // Split by spaces and non-alphanumeric characters, get first element
    const match = input.match(/^([a-zA-Z0-9-]+)/);
    return match ? [match[1], input.substring(match[1].length).trim()] : [input.trim(), ''];
  };

  const executeCommand = (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [command, args] = parseCommand(trimmedInput);

    // Add command to history
    setCommandHistory(prev => [...prev, { type: 'command', content: trimmedInput }]);

    let output: string | React.ReactNode = '';

    switch (command) {
      case 'shiv':
        if (args === '--help' || args === '-h') {
          output = (
            <div className="space-y-1 text-gray-300">
              <div className="text-white font-semibold">Available commands:</div>
              <div className="ml-4 space-y-1">
                <div><span className="text-[#00ff00]">shiv --help</span>     <span className="text-gray-400">-</span> Show this help message</div>
                <div><span className="text-[#00ff00]">shiv about</span>      <span className="text-gray-400">-</span> Display information about me</div>
                <div><span className="text-[#00ff00]">shiv experience</span> <span className="text-gray-400">-</span> Show my work experience</div>
                <div><span className="text-[#00ff00]">shiv projects</span>   <span className="text-gray-400">-</span> List my projects</div>
                <div><span className="text-[#00ff00]">shiv email</span>      <span className="text-gray-400">-</span> Open email client</div>
                <div><span className="text-[#00ff00]">shiv message</span>    <span className="text-gray-400">-</span> Open messages app</div>
                <div><span className="text-[#00ff00]">shiv x</span>          <span className="text-gray-400">-</span> Open X (Twitter) profile</div>
                <div><span className="text-[#00ff00]">shiv linkedin</span>   <span className="text-gray-400">-</span> Open LinkedIn profile</div>
                <div><span className="text-[#00ff00]">shiv github</span>     <span className="text-gray-400">-</span> Open GitHub profile</div>
              </div>
            </div>
          );
        } else if (args === 'about') {
          output = <div className="text-gray-300">{data.about}</div>;
        } else if (args === 'experience') {
          output = (
            <div className="space-y-4 text-gray-300">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="ml-2">
                  <div className="font-semibold text-[#5dade2]">{exp.title} - {exp.company}</div>
                  <div className="text-gray-500 text-sm">{exp.period}</div>
                  <div className="ml-4 mt-1">• {exp.description}</div>
                </div>
              ))}
            </div>
          );
        } else if (args === 'projects') {
          output = (
            <div className="space-y-4 text-gray-300">
              {data.projects.map((project, idx) => (
                <div key={idx} className="ml-2">
                  <div className="font-semibold text-[#bb8fce]">{project.name}</div>
                  <div className="ml-4 mt-1">• {project.description}</div>
                  <div className="ml-4 text-sm text-gray-500">Tech: {project.tech.join(', ')}</div>
                </div>
              ))}
            </div>
          );
        } else if (args === 'email') {
          window.location.href = 'mailto:shivanshsoni@berkeley.edu';
          output = 'Opening email client...';
        } else if (args === 'message') {
          window.location.href = 'sms:+19516422354';
          output = 'Opening messages app...';
        } else if (args === 'x') {
          if (data.links.x) {
            window.open(data.links.x, '_blank');
            output = 'Opening X profile...';
          } else {
            output = 'X link not configured yet.';
          }
        } else if (args === 'linkedin') {
          if (data.links.linkedin) {
            window.open(data.links.linkedin, '_blank');
            output = 'Opening LinkedIn profile...';
          } else {
            output = 'LinkedIn link not configured yet.';
          }
        } else if (args === 'github') {
          if (data.links.github) {
            window.open(data.links.github, '_blank');
            output = 'Opening GitHub profile...';
          } else {
            output = 'GitHub link not configured yet.';
          }
        } else if (!args) {
          output = 'Type "shiv --help" to see available commands.';
        } else {
          const firstArg = args.split(/[\s\W]+/)[0] || args;
          output = `zsh: command not found: ${firstArg}`;
        }
        break;
      default:
        // Extract first word for error message (split by spaces and non-alphanumeric characters)
        const firstWord = trimmedInput.split(/[\s\W]+/)[0] || trimmedInput;
        output = `zsh: command not found: ${firstWord}`;
    }

    setCommandHistory(prev => [...prev, { 
      type: output.toString().includes('command not found') ? 'error' : 'output', 
      content: output 
    }]);
    setCurrentInput('');
    setCommandIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate command history (simplified - could be enhanced)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  const getPrompt = () => {
    return (
      <span>
        <span className="text-[#00ff00]">shivansh</span>
        <span className="text-gray-400">@</span>
        <span className="text-[#5dade2]">terminal</span>
        <span className="text-gray-400">:</span>
        <span className="text-[#f7dc6f]">~</span>
        <span className="text-[#00ff00]">$</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#00ff00] font-mono p-6 text-sm">
      <div 
        ref={terminalRef}
        className="max-w-4xl mx-auto h-screen overflow-y-auto pb-20"
      >
        <div className="space-y-2 mb-4">
          {commandHistory.length === 0 && (
            <div className="text-gray-400 mb-4">
              Welcome to Shiv's terminal. Type "shiv --help" to get started.
            </div>
          )}
          {commandHistory.map((item, idx) => (
            <div key={idx} className="break-words leading-relaxed">
              {item.type === 'command' ? (
                <div className="mb-1">
                  {getPrompt()} <span className="text-white">{item.content}</span>
                </div>
              ) : (
                <div className={`mb-2 ${item.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-start">
          <span className="mr-2 flex-shrink-0">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-[#00ff00] min-w-0"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
