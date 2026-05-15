import { VirtualFileSystem } from "./filesystem";

interface CommandOutput {
  type: "command" | "output" | "error";
  content: string;
}

interface CommandContext {
  fs: VirtualFileSystem;
  windowWidth: number;
  getAboutContent: () => string;
}

type CommandHandler = (
  args: string[],
  ctx: CommandContext
) => CommandOutput[];

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

function handleLs(args: string[], ctx: CommandContext): CommandOutput[] {
  const path = args.filter((a) => !a.startsWith("-"))[0];
  const result = ctx.fs.ls(path);
  return [{ type: "output", content: result }];
}

function handleCd(args: string[], ctx: CommandContext): CommandOutput[] {
  const error = ctx.fs.cd(args[0]);
  if (error) return [{ type: "error", content: error }];
  return [];
}

function handleCat(args: string[], ctx: CommandContext): CommandOutput[] {
  if (args.length === 0) {
    return [
      { type: "error", content: "usage: cat <file>" },
    ];
  }

  const results: CommandOutput[] = [];
  for (const arg of args) {
    // Special case: about.txt content is dynamic (responsive ASCII art)
    const absPath = ctx.fs.resolvePath(arg);
    if (absPath === "/about.txt") {
      results.push({ type: "output", content: ctx.getAboutContent() });
      continue;
    }

    const { content, meta } = ctx.fs.cat(arg);

    // If it's a contact file, auto-open the URL
    if (meta?.isContact && meta.url) {
      if (meta.url.startsWith("mailto:")) {
        window.location.href = meta.url;
        results.push({ type: "output", content: content });
        results.push({
          type: "output",
          content: `${colors.gray}Opening email client...${colors.reset}`,
        });
      } else {
        window.open(meta.url, "_blank");
        results.push({ type: "output", content: content });
        results.push({
          type: "output",
          content: `${colors.gray}Opening in browser...${colors.reset}`,
        });
      }
    } else if (!meta) {
      // No meta = error message (file not found or is directory)
      results.push({ type: "error", content });
    } else {
      results.push({ type: "output", content });
    }
  }
  return results;
}

function handlePwd(_args: string[], ctx: CommandContext): CommandOutput[] {
  return [{ type: "output", content: ctx.fs.pwd() }];
}

function handleRm(): CommandOutput[] {
  return [
    { type: "output", content: "Yo chill don't delete anything haha..." },
  ];
}

function handleWhoami(): CommandOutput[] {
  return [{ type: "output", content: "shivansh" }];
}

const commandRegistry: Record<string, CommandHandler> = {
  ls: handleLs,
  cd: handleCd,
  cat: handleCat,
  pwd: handlePwd,

  less: handleCat,
  more: handleCat,
  head: handleCat,
  tail: handleCat,
  vim: handleCat,
  vi: handleCat,
  rm: handleRm,
  whoami: handleWhoami,
};

export function executeCommand(
  input: string,
  ctx: CommandContext
): CommandOutput[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  if (trimmed === "clear") {
    return [{ type: "output", content: "__CLEAR__" }];
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  const handler = commandRegistry[cmd];
  if (!handler) {
    return [
      { type: "error", content: `zsh: command not found: ${cmd}` },
    ];
  }

  return handler(args, ctx);
}
