# Git Perfect Extension

A high-performance, asynchronous Git blame insight tool built specifically for the Zed editor. 

## Features
- **Instant Blame Hovers:** Pause your cursor over any line to instantly view the commit hash, author, and commit summary.
- **Asynchronous & Non-blocking:** Leverages Node.js background worker processes so your editor UI never hitches or freezes.
- **Intelligent Caching:** Implements an $O(1)$ memory cache to minimize system shell calls and preserve CPU cycles.
- **Dynamic Git Tracking:** Automatically adapts if you initialize a Git repository late (`git init`) without needing an editor restart.

## Installation
Available via the native Zed Extension Gallery. Search for `Git Perfect`.

## 🚀 Recommended Configuration

To get the complete, full-sidebar experience with file badges (like standard Git tracking tools), add these settings to your global `settings.json` (`cmd+,` on macOS, `ctrl+,` on Linux/Windows):

```json
{
  "project_panel": {
    "git_status_indicator": true
  }
}
