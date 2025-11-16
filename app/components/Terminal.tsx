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

      // Initialize terminal
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
        scrollback: 1000, // Allow scrollback
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.open(container);
      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);

      // Extend terminal with custom methods
      extendTerminal(term);

      terminalInstanceRef.current = term;
      fitAddonRef.current = fitAddon;

      // Fit terminal after ensuring it's fully initialized
      const fitTerminal = () => {
        try {
          if (!fitAddon || !container) return;
          if (container.offsetWidth === 0 || container.offsetHeight === 0) return;
          
          // Check if terminal has internal dimensions set
          const core = (term as any)._core;
          if (!core || !core._renderService) return;
          
          // Fit the terminal to its container
          fitAddon.fit();
          
          // Ensure viewport doesn't extend beyond container
          const viewport = container.querySelector('.xterm-viewport') as HTMLElement;
          if (viewport) {
            const containerHeight = container.offsetHeight;
            if (viewport.scrollHeight > containerHeight) {
              viewport.style.maxHeight = `${containerHeight}px`;
            }
          }
        } catch (error) {
          // Silently ignore - terminal might not be ready yet
          console.debug('Terminal not ready for fit:', error);
        }
      };

      // Use multiple strategies to ensure terminal is ready
      // Wait a bit longer to ensure terminal is fully initialized
      requestAnimationFrame(() => {
        setTimeout(() => {
          fitTerminal();
          // Retry after another small delay if needed
          setTimeout(fitTerminal, 100);
          // One more retry to ensure it's properly fitted
          setTimeout(fitTerminal, 300);
        }, 100);
      });

      // Set up input handling
      setupInputHandling(term, onCommandExecute);

      // Typewriter effect: type "shiv" and press Enter
      const typewriterText = 'shiv';
      let charIndex = 0;
      
      const typeNextChar = () => {
        if (charIndex < typewriterText.length) {
          // Simulate typing the character by triggering the data handler
          const char = typewriterText[charIndex];
          (term as any).triggerData?.(char);
          charIndex++;
          setTimeout(typeNextChar, 100); // 100ms delay between characters
        } else {
          // After typing is complete, wait a bit then press Enter
          setTimeout(() => {
            // Simulate Enter key press
            (term as any).triggerData?.('\r');
            // Re-enable input after Enter is pressed
            setTimeout(() => {
              (term as any).isTypewriterActive = false;
              setIsTypewriterActive(false); // Update React state to re-enable interaction
              // Scroll to bottom and focus the terminal so cursor appears and user can type immediately
              scrollToBottom(term);
              term.focus();
            }, 100); // Small delay to ensure Enter is processed
          }, 500); // 500ms delay before pressing Enter
        }
      };
      
      // Start typewriter effect after a short delay
      setTimeout(() => {
        // Disable input during typewriter effect
        (term as any).isTypewriterActive = true;
        typeNextChar();
      }, 1000); // 1 second delay after prompt appears

      setIsReady(true);

      // Handle resize
      resizeHandler = () => {
        try {
          if (fitAddonRef.current && container && container.offsetWidth > 0 && container.offsetHeight > 0) {
            fitAddonRef.current.fit();
            // Ensure viewport is constrained after resize
            const viewport = container.querySelector('.xterm-viewport') as HTMLElement;
            if (viewport) {
              const containerHeight = container.offsetHeight;
              viewport.style.maxHeight = `${containerHeight}px`;
              // Scroll to bottom after resize
              scrollToBottom(term);
            }
          }
        } catch (error) {
          console.warn('Failed to fit terminal on resize:', error);
        }
      };
      window.addEventListener('resize', resizeHandler);
      
      // Use ResizeObserver to watch for container size changes
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          fitTerminal();
        });
        resizeObserver.observe(container);
      }
    };

    // Ensure container has dimensions before initializing
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Wait for container to have dimensions
      checkDimensionsInterval = setInterval(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          if (checkDimensionsInterval) {
            clearInterval(checkDimensionsInterval);
            checkDimensionsInterval = null;
          }
          initializeTerminal();
        }
      }, 50);
      
      // Timeout after 2 seconds
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

    // Cleanup function
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

  // Auto-focus terminal when clicking outside of it (prevents accidental click-off)
  useEffect(() => {
    if (!isReady || !terminalInstanceRef.current) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const terminalElement = terminalRef.current;
      
      // If clicking outside the terminal, focus it
      if (terminalElement && !terminalElement.contains(target)) {
        // Small delay to ensure the click event has processed
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

// Word wrap function - wraps text at word boundaries with hanging indent for bullet points
function wordWrap(text: string, maxWidth: number): string[] {
  // If text fits, return as is
  const textWithoutAnsi = stripAnsiCodes(text);
  if (textWithoutAnsi.length <= maxWidth) {
    return [text];
  }
  
  // Check if this is a bullet point line (starts with spaces + bullet + space)
  const bulletMatch = textWithoutAnsi.match(/^(\s*)([•·▪▫-]|\*)\s+(.+)$/);
  let prefix = '';
  let contentStart = 0;
  let hangingIndent = '';
  
  if (bulletMatch) {
    // For bullet points, we want hanging indent to align with the text (after bullet + space)
    // Example: "    • text" -> continuation should be "      text" (aligned with "text")
    const spacesBeforeBullet = bulletMatch[1];
    const bulletChar = bulletMatch[2];
    const bulletCharLength = 1; // bullet character
    const spaceAfterBullet = 1; // space after bullet
    
    // Find the prefix in the original text (with ANSI codes)
    // We need to find where the content actually starts (after bullet + space)
    const prefixVisualLength = spacesBeforeBullet.length + bulletCharLength + spaceAfterBullet;
    
    // Find actual content start position accounting for ANSI codes
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
    // Hanging indent: spaces equal to the visual length of prefix (to align text)
    hangingIndent = ' '.repeat(prefixVisualLength);
  } else {
    // Check for lines that start with spaces (indented lines)
    const indentMatch = textWithoutAnsi.match(/^(\s+)(.+)$/);
    if (indentMatch) {
      const indentLength = indentMatch[1].length;
      // Find actual prefix end accounting for ANSI codes
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
  
  // Extract the content part (after prefix)
  const content = text.substring(contentStart);
  const contentWithoutAnsi = stripAnsiCodes(content);
  
  // If content fits on one line, return as is
  if (contentWithoutAnsi.length <= maxWidth - stripAnsiCodes(prefix).length) {
    return [text];
  }
  
  const lines: string[] = [];
  // Split content by words
  const words = content.split(/\s+/);
  const spaces = content.match(/\s+/g) || [];
  
  let currentLine = prefix; // Start with prefix for first line
  let isFirstLine = true;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const spaceBefore = i > 0 ? (spaces[i - 1] || ' ') : '';
    
    // Calculate visual width without ANSI codes
    const currentVisualWidth = stripAnsiCodes(currentLine).length;
    const wordVisualWidth = stripAnsiCodes(word).length;
    const spaceVisualWidth = stripAnsiCodes(spaceBefore).length;
    
    // Check if adding this word (with space) would exceed width
    const wouldExceed = currentVisualWidth + spaceVisualWidth + wordVisualWidth > maxWidth;
    
    if (wouldExceed && currentLine.length > prefix.length) {
      // Current line is full, start a new line with hanging indent
      lines.push(currentLine.trimEnd());
      currentLine = hangingIndent + word;
      isFirstLine = false;
    } else {
      // Add space and word to current line
      if (i > 0) {
        currentLine += spaceBefore;
      }
      currentLine += word;
    }
  }
  
  // Add the last line
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trimEnd());
  }
  
  return lines.length > 0 ? lines : [''];
}

// Strip ANSI escape codes to get actual text length
function stripAnsiCodes(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// Helper function to scroll terminal to bottom
function scrollToBottom(term: Terminal) {
  // Use multiple strategies and timing to ensure we scroll to bottom
  // Strategy 1: Immediate scroll via API
  try {
    term.scrollToBottom();
  } catch (e) {
    // Ignore errors
  }
  
  // Strategy 2: Direct viewport manipulation (synchronous)
  try {
    const element = (term as any).element;
    if (element) {
      const viewport = element.querySelector('.xterm-viewport') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Strategy 3: Delayed scroll to catch any async rendering
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
    } catch (e) {
      // Ignore errors
    }
  }, 0);
  
  // Strategy 4: After animation frame (for DOM updates)
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
    } catch (e) {
      // Ignore errors
    }
  });
}

// Extend terminal with custom methods
function extendTerminal(term: Terminal) {
  // Store current input line
  (term as any).currentLine = '';
  
  // Store cursor position relative to input start (not buffer position)
  (term as any).cursorPosition = 0;
  
  // Store command history
  (term as any).history = [];
  (term as any).historyCursor = -1;
  
  // Flag to disable input during typewriter effect
  (term as any).isTypewriterActive = false;
  // Flag to indicate programmatic data trigger (allows bypassing typewriter lock)
  (term as any).isProgrammaticInput = false;

  // Get prompt text (with ANSI colors)
  (term as any).getPrompt = () => {
    return '\x1b[32mshivansh\x1b[0m@\x1b[36mterminal\x1b[0m:\x1b[33m~\x1b[0m\x1b[32m$\x1b[0m ';
  };

  // Get prompt text without ANSI codes (for length calculation)
  (term as any).getPromptRaw = () => {
    return 'shivansh@terminal:~$ ';
  };

  // Strip ANSI escape codes from a string
  (term as any).stripAnsi = (str: string) => {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  };

  // Get cursor position relative to start of input
  // We track this ourselves to avoid buffer synchronization issues
  (term as any).pos = () => {
    return (term as any).cursorPosition || 0;
  };
  
  // Set cursor position
  (term as any).setPos = (pos: number) => {
    (term as any).cursorPosition = Math.max(0, Math.min(pos, (term as any).currentLine.length));
  };

  // Clear current line
  (term as any).clearCurrentLine = (goToEndOfHistory = false) => {
    term.write('\x1b[2K\r'); // Clear line and move to start
    term.write((term as any).getPrompt());
    (term as any).currentLine = '';
    (term as any).cursorPosition = 0;
    if (goToEndOfHistory) {
      (term as any).historyCursor = -1;
    }
  };

  // Set current line with optional cursor position
  // If cursorPos is provided, cursor will be positioned at that position
  // If cursorPos is -1, cursor will be at the end of the line
  (term as any).setCurrentLine = (newLine: string, cursorPos: number | null = null) => {
    // Hide cursor during update to prevent flicker
    term.write('\x1b[?25l');
    
    (term as any).clearCurrentLine();
    (term as any).currentLine = newLine;
    term.write(newLine);
    
    // Update our tracked cursor position
    if (cursorPos !== null) {
      const targetPos = cursorPos === -1 ? newLine.length : Math.min(cursorPos, newLine.length);
      (term as any).setPos(targetPos);
      
      // Move cursor to the correct position visually
      const moveLeft = newLine.length - targetPos;
      if (moveLeft > 0) {
        term.write('\x1b[D'.repeat(moveLeft));
      }
    } else {
      // Default to end of line
      (term as any).setPos(newLine.length);
    }
    
    // Show cursor again at the correct position
    term.write('\x1b[?25h');
  };

  // Print prompt
  (term as any).prompt = () => {
    term.write((term as any).getPrompt());
    (term as any).cursorPosition = 0; // Reset cursor position after showing prompt
    // Ensure we're scrolled to bottom after showing prompt
    scrollToBottom(term);
  };
}

// Set up input handling
function setupInputHandling(term: Terminal, onCommandExecute: (command: string) => CommandOutput[]) {
  // Show initial prompt
  (term as any).prompt();

  // Store the data handler so it can be triggered programmatically
  const dataHandler = (data: string) => {
    // Ignore user input during typewriter effect (but allow programmatic triggers)
    if ((term as any).isTypewriterActive && !(term as any).isProgrammaticInput) {
      // Block user input during typewriter effect
      return;
    }
    
    const currentLine = (term as any).currentLine;
    const pos = (term as any).pos();

    // Handle Enter key
    if (data === '\r') {
      const trimmedInput = currentLine.trim();
      
      // Check if this is a clear command before writing newline
      if (trimmedInput === 'clear') {
        // Clear the screen and move to absolute top-left
        // Use ANSI sequences to ensure proper clearing and positioning
        term.write('\x1b[2J\x1b[H'); // Clear entire screen buffer and move cursor to top-left
        // Reset and show new prompt at top
        (term as any).currentLine = '';
        (term as any).cursorPosition = 0;
        (term as any).history.push(currentLine);
        (term as any).historyCursor = -1;
        (term as any).prompt();
        return;
      }
      
      term.write('\r\n');
      
      if (trimmedInput) {
        // Add to history
        (term as any).history.push(currentLine);
        (term as any).historyCursor = -1;
        
        // Execute command and display output
        const outputs = onCommandExecute(currentLine);
        
        // Check for clear command (shouldn't happen if we handled it above, but just in case)
        const hasClear = outputs.some(output => output.content === '__CLEAR__');
        
        if (hasClear) {
          // Clear the screen and move to absolute top-left
          // Use ANSI sequences to ensure proper clearing and positioning
          term.write('\x1b[2J\x1b[H'); // Clear entire screen buffer and move cursor to top-left
          // Reset and show new prompt at top
          (term as any).currentLine = '';
          (term as any).cursorPosition = 0;
          (term as any).prompt();
          return;
        }
        
        // Add a newline before the output for legibility
        if (outputs.length > 0) {
          term.write('\r\n');
        }
        
        outputs.forEach((output, outputIndex) => {
          
          if (output.type === 'error') {
            const errorContent = typeof output.content === 'string' 
              ? output.content 
              : String(output.content);
            // Split by newlines and write each line
            const errorLines = errorContent.split('\n');
            errorLines.forEach((line, index) => {
              // Skip trailing empty lines
              if (line === '' && index === errorLines.length - 1 && errorLines.length > 1) {
                return;
              }
              // Write each line with proper line break - use \r\n for proper terminal line breaks
              term.write(`\x1b[31m${line}\x1b[0m\r\n`);
            });
          } else {
            // Convert content to string
            const content = typeof output.content === 'string' 
              ? output.content 
              : String(output.content);
            // Split by newlines first
            const inputLines = content.split('\n');
            
            // Get terminal column width for word wrapping
            const cols = term.cols || 80;
            
            inputLines.forEach((line, index) => {
              // Skip trailing empty lines
              if (line === '' && index === inputLines.length - 1 && inputLines.length > 1) {
                return;
              }
              
              // If line is empty, just write a newline
              if (line.trim() === '') {
                term.write('\r\n');
                return;
              }
              
              // Word wrap the line if it's too long
              const wrappedLines = wordWrap(line, cols);
              wrappedLines.forEach((wrappedLine) => {
                term.write(`${wrappedLine}\r\n`);
              });
            });
          }
        });
        
        // Add a newline after the output for legibility
        if (outputs.length > 0) {
          term.write('\r\n');
        }
        
        // Scroll to bottom after writing all output (only once per command)
        scrollToBottom(term);
      }
      
      // Reset and show new prompt
      (term as any).currentLine = '';
      (term as any).cursorPosition = 0;
      (term as any).prompt();
      return;
    }

    // Handle Backspace
    if (data === '\x7f' || data === '\b') {
      if (pos > 0) {
        const newLine = currentLine.slice(0, pos - 1) + currentLine.slice(pos);
        // After backspace, cursor should be at pos - 1
        (term as any).setCurrentLine(newLine, pos - 1);
      }
      return;
    }

    // Handle Ctrl+C
    if (data === '\x03') {
      term.write('^C\r\n');
      (term as any).currentLine = '';
      (term as any).cursorPosition = 0;
      (term as any).prompt();
      return;
    }

    // Handle Ctrl+L (clear screen)
    if (data === '\x0c') {
      // Clear entire screen buffer and move cursor to top-left
      term.write('\x1b[2J\x1b[H');
      (term as any).prompt();
      return;
    }

    // Handle Arrow keys
    if (data === '\x1b[A') { // Up arrow
      const history = (term as any).history;
      if (history.length > 0) {
        if ((term as any).historyCursor === -1) {
          (term as any).historyCursor = history.length - 1;
        } else if ((term as any).historyCursor > 0) {
          (term as any).historyCursor--;
        }
        const historyLine = history[(term as any).historyCursor];
        (term as any).setCurrentLine(historyLine || '', -1); // Cursor at end
      }
      return;
    }

    if (data === '\x1b[B') { // Down arrow
      const history = (term as any).history;
      if ((term as any).historyCursor !== -1) {
        if ((term as any).historyCursor < history.length - 1) {
          (term as any).historyCursor++;
          const historyLine = history[(term as any).historyCursor];
          (term as any).setCurrentLine(historyLine || '', -1); // Cursor at end
        } else {
          (term as any).historyCursor = -1;
          (term as any).setCurrentLine('', 0);
        }
      }
      return;
    }

    if (data === '\x1b[C') { // Right arrow
      if (pos < currentLine.length) {
        (term as any).setPos(pos + 1);
        term.write('\x1b[C');
      }
      return;
    }

    if (data === '\x1b[D') { // Left arrow
      if (pos > 0) {
        (term as any).setPos(pos - 1);
        term.write('\x1b[D');
      }
      return;
    }

    // Handle Ctrl+A (move to beginning)
    if (data === '\x01') {
      const moveLeft = pos;
      if (moveLeft > 0) {
        (term as any).setPos(0);
        term.write('\x1b[D'.repeat(moveLeft));
      }
      return;
    }

    // Handle Ctrl+E (move to end)
    if (data === '\x05') {
      const moveRight = currentLine.length - pos;
      if (moveRight > 0) {
        (term as any).setPos(currentLine.length);
        term.write('\x1b[C'.repeat(moveRight));
      }
      return;
    }

    // Handle Ctrl+U (clear line)
    if (data === '\x15') {
      (term as any).setCurrentLine('', 0);
      return;
    }

    // Handle Ctrl+K (clear from cursor to end)
    if (data === '\x0b') {
      const newLine = currentLine.slice(0, pos);
      (term as any).setCurrentLine(newLine, pos); // Keep cursor at same position
      return;
    }

    // Handle Tab (could implement autocomplete here)
    if (data === '\t') {
      // For now, just ignore tab
      return;
    }

    // Handle regular printable characters
    // Check for printable ASCII characters (including extended)
    if (data.length === 1 && (data >= ' ' || data.charCodeAt(0) >= 32)) {
      const newLine = currentLine.slice(0, pos) + data + currentLine.slice(pos);
      // After inserting, cursor should be at pos + 1
      (term as any).setCurrentLine(newLine, pos + 1);
    }
  };
  
  // Register the handler
  term.onData(dataHandler);
  
  // Store reference for programmatic triggering
  (term as any).triggerData = (data: string) => {
    // Set flag to indicate this is programmatic input (bypasses typewriter lock)
    (term as any).isProgrammaticInput = true;
    try {
      dataHandler(data);
    } finally {
      // Always clear the flag, even if handler throws
      (term as any).isProgrammaticInput = false;
    }
  };
}
