# Git Perfect Extension

A high-performance, asynchronous Git blame insight tool built specifically for the Zed editor. 

Bring deep Git repository context directly into your workspace layout without sacrificing the raw, native speed of your editor.

## Features
- **Instant Blame Hovers:** Pause your cursor over any line to instantly view the commit hash, author, and commit summary.
- **Asynchronous & Non-blocking:** Leverages Node.js background worker processes so your editor UI never hitches or freezes.
- **Intelligent Caching:** Implements an $O(1)$ memory cache to minimize system shell calls and preserve CPU cycles.
- **Dynamic Git Tracking:** Automatically adapts if you initialize a Git repository late (`git init`) without needing an editor restart.

---

## 🛠️ Interactive Sidebar Workflow

To get the most out of your development workspace, use **`Ctrl + Shift + G`** (`Cmd + Shift + G` on macOS) to instantly jump to and toggle Zed's native **Project Panel / Version Control View**. 

Pairing `Git Perfect`'s inline hovering engine with this sidebar keymap gives you full control over tracking active file status modifications, staging file paths, and monitoring branch diffs fluidly from the keyboard.

---

## Installation
Available via the native Zed Extension Gallery. Search for `Git Perfect` and click **Install**.

---

## 🚀 Recommended Configuration

To get the complete, full-sidebar experience with explicit file status badges (like standard Git tracking tools), add these settings to your global `settings.json` (`cmd+,` on macOS, `ctrl+,` on Linux/Windows):

```json
{
  "project_panel": {
    "git_status_indicator": true
  }
}
