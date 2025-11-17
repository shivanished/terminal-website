'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface CommandOutput {
  type: 'command' | 'output' | 'error';
  content: string | React.ReactNode;
}

interface TerminalComponentProps {
  onCommandExecute: (command: string) => CommandOutput[];
}

export default function TerminalComponent({ onCommandExecute }: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTypewriterActive, setIsTypewriterActive] = useState(true);

  useEffect(() => {
    if (!terminalRef.current || terminalInstanceRef.current) return;

    const container = terminalRef.current;
    let checkDimensionsInterval: NodeJS.Timeout | null = null;
    let resizeHandler: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const initializeTerminal = () => {
      if (terminalInstanceRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        theme: {
          background: '#000000',
          foreground: '#00ff00',
          cursor: '#00ff00',
          cursorAccent: '#000000',
        },
        fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        scrollback: 1000,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.open(container);
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);

      extendTerminal(term);

      terminalInstanceRef.current = term;
      fitAddonRef.current = fitAddon;

      const fitTerminal = () => {
        try {
          if (!fitAddon || !container) return;
          if (container.offsetWidth === 0 || container.offsetHeight === 0) return;
          
          const core = (term as any)._core;
          if (!core || !core._renderService) return;
          
          fitAddon.fit();
          
          const viewport = container.querySelector('.xterm-viewport') as HTMLElement;
          if (viewport) {
            const containerHeight = container.offsetHeight;
            if (viewport.scrollHeight > containerHeight) {
              viewport.style.maxHeight = `${containerHeight}px`;
            }
          }
        } catch (error) {
          console.debug('Terminal not ready for fit:', error);
        }
      };

      requestAnimationFrame(() => {
        setTimeout(() => {
          fitTerminal();
          setTimeout(fitTerminal, 100);
          setTimeout(fitTerminal, 300);
        }, 100);
      });

      setupInputHandling(term, onCommandExecute);

      const typewriterText = 'shiv';
      let charIndex = 0;
      
      const typeNextChar = () => {
        if (charIndex < typewriterText.length) {
          const char = typewriterText[charIndex];
          (term as any).triggerData?.(char);
          charIndex++;
          setTimeout(typeNextChar, 100);
        } else {
          setTimeout(() => {
            (term as any).triggerData?.('\r');
            setTimeout(() => {
              (term as any).isTypewriterActive = false;
              setIsTypewriterActive(false);
              scrollToBottom(term);
              term.focus();
            }, 100);
          }, 500);
        }
      };
      
      setTimeout(() => {
        (term as any).isTypewriterActive = true;
        typeNextChar();
      }, 1000);

      setIsReady(true);

      resizeHandler = () => {
        try {
          if (fitAddonRef.current && container && container.offsetWidth > 0 && container.offsetHeight > 0) {
            fitAddonRef.current.fit();
            const viewport = container.querySelector('.xterm-viewport') as HTMLElement;
            if (viewport) {
              const containerHeight = container.offsetHeight;
              viewport.style.maxHeight = `${containerHeight}px`;
              scrollToBottom(term);
            }
          }
        } catch (error) {
          console.warn('Failed to fit terminal on resize:', error);
        }
      };
      window.addEventListener('resize', resizeHandler);
      
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          fitTerminal();
        });
        resizeObserver.observe(container);
      }
    };

    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      checkDimensionsInterval = setInterval(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          if (checkDimensionsInterval) {
            clearInterval(checkDimensionsInterval);
            checkDimensionsInterval = null;
          }
          initializeTerminal();
        }
      }, 50);
      
      setTimeout(() => {
        if (checkDimensionsInterval) {
          clearInterval(checkDimensionsInterval);
          checkDimensionsInterval = null;
        }
        initializeTerminal();
      }, 2000);
    } else {
      initializeTerminal();
    }
    return () => {
      if (checkDimensionsInterval) {
        clearInterval(checkDimensionsInterval);
      }
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
      fitAddonRef.current = null;
    };
  }, [onCommandExecute]);

  // Block all user interaction during typewriter effect
  useEffect(() => {
    if (!isTypewriterActive || !terminalRef.current) return;

    const terminalElement = terminalRef.current;

    const blockMouseInteraction = (e: Event) => {
      const target = e.target as Node;
      // Block mouse events that target the terminal or its children
      if (terminalElement.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const blockKeyboardInteraction = (e: KeyboardEvent) => {
      // Block all keyboard events during typewriter (they might target terminal even if not direct target)
      // Check if terminal or any of its children has focus, or if event would affect terminal
      const activeElement = document.activeElement;
      if (terminalElement.contains(activeElement) || terminalElement === activeElement) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const blockFocus = (e: FocusEvent) => {
      const target = e.target as Node;
      // Block focus events on terminal
      if (terminalElement.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Block mouse events on terminal
    const mouseEvents = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'];
    mouseEvents.forEach(eventType => {
      document.addEventListener(eventType, blockMouseInteraction, { capture: true, passive: false });
    });

    // Block keyboard events globally (but only if terminal would receive them)
    const keyboardEvents = ['keydown', 'keypress', 'keyup'];
    keyboardEvents.forEach(eventType => {
      document.addEventListener(eventType, blockKeyboardInteraction as EventListener, { capture: true, passive: false });
    });

    // Block focus events on terminal
    const focusEvents = ['focus', 'focusin'];
    focusEvents.forEach(eventType => {
      document.addEventListener(eventType, blockFocus as EventListener, { capture: true, passive: false });
    });

    return () => {
      // Cleanup: remove all event listeners when typewriter completes
      mouseEvents.forEach(eventType => {
        document.removeEventListener(eventType, blockMouseInteraction, { capture: true });
      });
      keyboardEvents.forEach(eventType => {
        document.removeEventListener(eventType, blockKeyboardInteraction as EventListener, { capture: true });
      });
      focusEvents.forEach(eventType => {
        document.removeEventListener(eventType, blockFocus as EventListener, { capture: true });
      });
    };
  }, [isTypewriterActive]);

  useEffect(() => {
    if (!isReady || !terminalInstanceRef.current) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const terminalElement = terminalRef.current;
      
      if (terminalElement && !terminalElement.contains(target)) {
        setTimeout(() => {
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.focus();
          }
        }, 0);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isReady]);

  return (
    <div 
      id="terminal"
      ref={terminalRef} 
      className="h-full w-full"
      style={{ 
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: isTypewriterActive ? 'none' : 'auto',
        userSelect: isTypewriterActive ? 'none' : 'auto',
      }}
      onMouseDown={(e) => {
        if (isTypewriterActive) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onFocus={(e) => {
        if (isTypewriterActive) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onKeyDown={(e) => {
        if (isTypewriterActive) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onKeyPress={(e) => {
        if (isTypewriterActive) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      tabIndex={isTypewriterActive ? -1 : 0}
    />
  );
}

function wordWrap(text: string, maxWidth: number): string[] {
  const textWithoutAnsi = stripAnsiCodes(text);
  if (textWithoutAnsi.length <= maxWidth) {
    return [text];
  }
  
  const bulletMatch = textWithoutAnsi.match(/^(\s*)([•·▪▫-]|\*)\s+(.+)$/);
  let prefix = '';
  let contentStart = 0;
  let hangingIndent = '';
  
  if (bulletMatch) {
    const spacesBeforeBullet = bulletMatch[1];
    const bulletChar = bulletMatch[2];
    const bulletCharLength = 1;
    const spaceAfterBullet = 1;
    
    const prefixVisualLength = spacesBeforeBullet.length + bulletCharLength + spaceAfterBullet;
    
    let visualPos = 0;
    contentStart = 0;
    for (let i = 0; i < text.length && visualPos < prefixVisualLength; i++) {
      if (text[i] === '\x1b') {
        const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/);
        if (ansiMatch) {
          i += ansiMatch[0].length - 1;
          continue;
        }
      }
      visualPos++;
      if (visualPos === prefixVisualLength) {
        contentStart = i + 1;
        break;
      }
    }
    
    prefix = text.substring(0, contentStart);
    hangingIndent = ' '.repeat(prefixVisualLength);
  } else {
    const indentMatch = textWithoutAnsi.match(/^(\s+)(.+)$/);
    if (indentMatch) {
      const indentLength = indentMatch[1].length;
      let visualPos = 0;
      contentStart = 0;
      for (let i = 0; i < text.length && visualPos < indentLength; i++) {
        if (text[i] === '\x1b') {
          const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/);
          if (ansiMatch) {
            i += ansiMatch[0].length - 1;
            continue;
          }
        }
        visualPos++;
        if (visualPos === indentLength) {
          contentStart = i + 1;
          break;
        }
      }
      prefix = text.substring(0, contentStart);
      hangingIndent = ' '.repeat(indentLength);
    }
  }
  
  const content = text.substring(contentStart);
  const contentWithoutAnsi = stripAnsiCodes(content);
  
  if (contentWithoutAnsi.length <= maxWidth - stripAnsiCodes(prefix).length) {
    return [text];
  }
  
  const lines: string[] = [];
  const words = content.split(/\s+/);
  const spaces = content.match(/\s+/g) || [];
  
  let currentLine = prefix;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const spaceBefore = i > 0 ? (spaces[i - 1] || ' ') : '';
    
    const currentVisualWidth = stripAnsiCodes(currentLine).length;
    const wordVisualWidth = stripAnsiCodes(word).length;
    const spaceVisualWidth = stripAnsiCodes(spaceBefore).length;
    
    const wouldExceed = currentVisualWidth + spaceVisualWidth + wordVisualWidth > maxWidth;
    
    if (wouldExceed && currentLine.length > prefix.length) {
      lines.push(currentLine.trimEnd());
      currentLine = hangingIndent + word;
    } else {
      if (i > 0) {
        currentLine += spaceBefore;
      }
      currentLine += word;
    }
  }
  
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trimEnd());
  }
  
  return lines.length > 0 ? lines : [''];
}

function stripAnsiCodes(str: string): string {
  // Strip ANSI color codes (\x1b[...m)
  let result = str.replace(/\x1b\[[0-9;]*m/g, '');
  // Strip OSC 8 hyperlink escape sequences
  // Start sequence: \x1b]8;;URL\x1b\\ (where URL can contain any characters except \x1b)
  result = result.replace(/\x1b\]8;;[^\x1b]*\x1b\\/g, '');
  // End sequence: \x1b]8;;\x1b\\
  result = result.replace(/\x1b\]8;;\x1b\\/g, '');
  return result;
}

function scrollToBottom(term: Terminal) {
  try {
    term.scrollToBottom();
  } catch (e) {}
  
  try {
    const element = (term as any).element;
    if (element) {
      const viewport = element.querySelector('.xterm-viewport') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  } catch (e) {}
  
  setTimeout(() => {
    try {
      term.scrollToBottom();
      const element = (term as any).element;
      if (element) {
        const viewport = element.querySelector('.xterm-viewport') as HTMLElement;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    } catch (e) {}
  }, 0);
  
  requestAnimationFrame(() => {
    try {
      term.scrollToBottom();
      const element = (term as any).element;
      if (element) {
        const viewport = element.querySelector('.xterm-viewport') as HTMLElement;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    } catch (e) {}
  });
}

function extendTerminal(term: Terminal) {
  (term as any).currentLine = '';
  (term as any).cursorPosition = 0;
  (term as any).history = [];
  (term as any).historyCursor = -1;
  (term as any).isTypewriterActive = false;
  (term as any).isProgrammaticInput = false;
  (term as any).isHandlingModifierBackspace = false;

  (term as any).getPrompt = () => {
    return '\x1b[32mshivansh\x1b[0m@\x1b[36mterminal\x1b[0m:\x1b[33m~\x1b[0m\x1b[32m$\x1b[0m ';
  };

  (term as any).getPromptRaw = () => {
    return 'shivansh@terminal:~$ ';
  };

  (term as any).stripAnsi = (str: string) => {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  };

  (term as any).pos = () => {
    return (term as any).cursorPosition || 0;
  };
  
  (term as any).setPos = (pos: number) => {
    (term as any).cursorPosition = Math.max(0, Math.min(pos, (term as any).currentLine.length));
  };

  (term as any).clearCurrentLine = (goToEndOfHistory = false) => {
    term.write('\x1b[2K\r');
    term.write((term as any).getPrompt());
    (term as any).currentLine = '';
    (term as any).cursorPosition = 0;
    if (goToEndOfHistory) {
      (term as any).historyCursor = -1;
    }
  };

  (term as any).setCurrentLine = (newLine: string, cursorPos: number | null = null) => {
    term.write('\x1b[?25l');
    
    (term as any).clearCurrentLine();
    (term as any).currentLine = newLine;
    term.write(newLine);
    
    if (cursorPos !== null) {
      const targetPos = cursorPos === -1 ? newLine.length : Math.min(cursorPos, newLine.length);
      (term as any).setPos(targetPos);
      
      const moveLeft = newLine.length - targetPos;
      if (moveLeft > 0) {
        term.write('\x1b[D'.repeat(moveLeft));
      }
    } else {
      (term as any).setPos(newLine.length);
    }
    
    term.write('\x1b[?25h');
  };

  (term as any).prompt = () => {
    term.write((term as any).getPrompt());
    (term as any).cursorPosition = 0;
    scrollToBottom(term);
  };
}

function setupInputHandling(term: Terminal, onCommandExecute: (command: string) => CommandOutput[]) {
  (term as any).prompt();

  const dataHandler = (data: string) => {
    if ((term as any).isTypewriterActive && !(term as any).isProgrammaticInput) {
      return;
    }
    
    const currentLine = (term as any).currentLine;
    const pos = (term as any).pos();

    if (data === '\r') {
      const trimmedInput = currentLine.trim();
      
      if (trimmedInput === 'clear') {
        term.write('\x1b[2J\x1b[H');
        (term as any).currentLine = '';
        (term as any).cursorPosition = 0;
        (term as any).history.push(currentLine);
        (term as any).historyCursor = -1;
        (term as any).prompt();
        return;
      }
      
      term.write('\r\n');
      
      if (trimmedInput) {
        (term as any).history.push(currentLine);
        (term as any).historyCursor = -1;
        
        const outputs = onCommandExecute(currentLine);
        
        const hasClear = outputs.some(output => output.content === '__CLEAR__');
        
        if (hasClear) {
          term.write('\x1b[2J\x1b[H');
          (term as any).currentLine = '';
          (term as any).cursorPosition = 0;
          (term as any).prompt();
          return;
        }
        
        if (outputs.length > 0) {
          term.write('\r\n');
        }
        
        outputs.forEach((output) => {
          if (output.type === 'error') {
            const errorContent = typeof output.content === 'string' 
              ? output.content 
              : String(output.content);
            const errorLines = errorContent.split('\n');
            errorLines.forEach((line, index) => {
              if (line === '' && index === errorLines.length - 1 && errorLines.length > 1) {
                return;
              }
              term.write(`\x1b[31m${line}\x1b[0m\r\n`);
            });
          } else {
            const content = typeof output.content === 'string' 
              ? output.content 
              : String(output.content);
            const inputLines = content.split('\n');
            const cols = term.cols || 80;
            
            inputLines.forEach((line, index) => {
              if (line === '' && index === inputLines.length - 1 && inputLines.length > 1) {
                return;
              }
              
              if (line.trim() === '') {
                term.write('\r\n');
                return;
              }
              
              const wrappedLines = wordWrap(line, cols);
              wrappedLines.forEach((wrappedLine) => {
                term.write(`${wrappedLine}\r\n`);
              });
            });
          }
        });
        
        if (outputs.length > 0) {
          term.write('\r\n');
        }
        
        scrollToBottom(term);
      }
      
      (term as any).currentLine = '';
      (term as any).cursorPosition = 0;
      (term as any).prompt();
      return;
    }

    if (data === '\x7f' || data === '\b') {
      if ((term as any).isHandlingModifierBackspace) {
        return;
      }
      if (pos > 0) {
        const newLine = currentLine.slice(0, pos - 1) + currentLine.slice(pos);
        (term as any).setCurrentLine(newLine, pos - 1);
      }
      return;
    }

    if (data === '\x03') {
      term.write('^C\r\n');
      (term as any).currentLine = '';
      (term as any).cursorPosition = 0;
      (term as any).prompt();
      return;
    }

    if (data === '\x0c') {
      term.write('\x1b[2J\x1b[H');
      (term as any).prompt();
      return;
    }

    if (data === '\x1b[A') {
      const history = (term as any).history;
      if (history.length > 0) {
        if ((term as any).historyCursor === -1) {
          (term as any).historyCursor = history.length - 1;
        } else if ((term as any).historyCursor > 0) {
          (term as any).historyCursor--;
        }
        const historyLine = history[(term as any).historyCursor];
        (term as any).setCurrentLine(historyLine || '', -1);
      }
      return;
    }

    if (data === '\x1b[B') {
      const history = (term as any).history;
      if ((term as any).historyCursor !== -1) {
        if ((term as any).historyCursor < history.length - 1) {
          (term as any).historyCursor++;
          const historyLine = history[(term as any).historyCursor];
          (term as any).setCurrentLine(historyLine || '', -1);
        } else {
          (term as any).historyCursor = -1;
          (term as any).setCurrentLine('', 0);
        }
      }
      return;
    }

    if (data === '\x1b[C') {
      if (pos < currentLine.length) {
        (term as any).setPos(pos + 1);
        term.write('\x1b[C');
      }
      return;
    }

    if (data === '\x1b[D') {
      if (pos > 0) {
        (term as any).setPos(pos - 1);
        term.write('\x1b[D');
      }
      return;
    }

    if (data === '\x01') {
      const moveLeft = pos;
      if (moveLeft > 0) {
        (term as any).setPos(0);
        term.write('\x1b[D'.repeat(moveLeft));
      }
      return;
    }

    if (data === '\x05') {
      const moveRight = currentLine.length - pos;
      if (moveRight > 0) {
        (term as any).setPos(currentLine.length);
        term.write('\x1b[C'.repeat(moveRight));
      }
      return;
    }

    if (data === '\x15') {
      (term as any).setCurrentLine('', 0);
      return;
    }

    if (data === '\x0b') {
      const newLine = currentLine.slice(0, pos);
      (term as any).setCurrentLine(newLine, pos);
      return;
    }

    if (data === '\t') {
      return;
    }

    if (data.length === 1 && (data >= ' ' || data.charCodeAt(0) >= 32)) {
      const newLine = currentLine.slice(0, pos) + data + currentLine.slice(pos);
      (term as any).setCurrentLine(newLine, pos + 1);
    }
  };

  const clearEntireLine = () => {
    if ((term as any).isTypewriterActive && !(term as any).isProgrammaticInput) {
      return;
    }
    
    (term as any).setCurrentLine('', 0);
  };
  
  term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
    if ((term as any).isTypewriterActive && !(term as any).isProgrammaticInput) {
      return true;
    }

    if (event.key !== 'Backspace') {
      return true;
    }

    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      (term as any).isHandlingModifierBackspace = true;
      clearEntireLine();
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        (term as any).isHandlingModifierBackspace = false;
      }, 10);
      return false;
    }

    return true;
  });
  
  term.onData(dataHandler);
  
  (term as any).triggerData = (data: string) => {
    (term as any).isProgrammaticInput = true;
    try {
      dataHandler(data);
    } finally {
      (term as any).isProgrammaticInput = false;
    }
  };
}
