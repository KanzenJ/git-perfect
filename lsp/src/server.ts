import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  Hover,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { exec } from "child_process";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Keep our cache memory usage strictly locked at a fixed upper ceiling
const MAX_CACHE_SIZE = 1000;
const blameCache = new Map<string, Hover>();

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      hoverProvider: true,
    },
  };
});

connection.onHover(
  async (params: TextDocumentPositionParams): Promise<Hover | null> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    // 1. Guard against virtual/internal filesystem buffers (e.g. settings panels, previews)
    if (!document.uri.startsWith("file://")) {
      return null;
    }

    let filePath: string;
    try {
      filePath = new URL(document.uri).pathname;
    } catch {
      return null;
    }

    const targetLine = params.position.line + 1;
    const cacheKey = `${filePath}:${targetLine}`;

    // 2. High-speed O(1) Cache lookup
    if (blameCache.has(cacheKey)) {
      return blameCache.get(cacheKey)!;
    }

    const projectDir = path.dirname(filePath);

    try {
      // 3. Lightweight workspace integrity check
      await execAsync("git rev-parse --is-inside-work-tree", {
        cwd: projectDir,
      });

      // 4. Retrieve exact, machine-readable repository history metrics
      const command = `git blame -L ${targetLine},${targetLine} --porcelain "${path.basename(filePath)}"`;
      const { stdout } = await execAsync(command, { cwd: projectDir });

      if (!stdout) return null;

      const lines = stdout.split("\n");
      const commitHash = lines[0].split(" ")[0];
      const shortHash = commitHash.substring(0, 8);
      const author =
        lines.find((l) => l.startsWith("author "))?.substring(7) ||
        "Unknown Author";
      const summary =
        lines.find((l) => l.startsWith("summary "))?.substring(8) ||
        "No commit message";

      // Check for unstaged/uncommitted files
      if (commitHash.startsWith("00000000")) {
        return {
          contents: {
            kind: "markdown",
            value: `**Git Blame Context**\n\n• *Uncommitted changes*`,
          },
        };
      }

      // 5. The Magic: Inject a native action query string parameter link into the Markdown.
      // This converts the hash into an actionable deep-link that lets devs query the commit directly inside Zed.
      const terminalArgs = encodeURIComponent(
        JSON.stringify({
          command: `git show ${commitHash}`,
        }),
      );
      const jumpToCommitLink = `[${shortHash}](command:workspace.SendToTerminal?${terminalArgs} "View full git commit diff")`;

      const response: Hover = {
        contents: {
          kind: "markdown",
          value:
            `**Git Blame Context**\n\n` +
            `• **Commit:** ${jumpToCommitLink}\n` +
            `• **Author:** ${author}\n` +
            `• **Message:** *${summary}*`,
        },
      };

      // Cache cleanup strategy: enforce a strict sizing maximum roll
      if (blameCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = blameCache.keys().next().value;
        if (oldestKey) blameCache.delete(oldestKey);
      }

      blameCache.set(cacheKey, response);
      return response;
    } catch (error) {
      return null;
    }
  },
);

// Purge cache scopes for files experiencing edits
documents.onDidChangeContent((change) => {
  if (!change.document.uri.startsWith("file://")) return;
  try {
    const filePath = new URL(change.document.uri).pathname;
    for (const key of blameCache.keys()) {
      if (key.startsWith(filePath)) {
        blameCache.delete(key);
      }
    }
  } catch {
    // Fall through silently if URI format is abnormal
  }
});

documents.listen(connection);
connection.listen();
