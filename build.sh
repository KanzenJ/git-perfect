#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status,
# treat unset variables as an error, and catch pipeline failures.
set -euo pipefail

# ANSI color codes for terminal logging
BOLD_BLUE="\033[1;34m"
BOLD_GREEN="\033[1;32m"
BOLD_RED="\033[1;31m"
RESET="\033[0m"

log_info() {
    echo -e "${BOLD_BLUE}[INFO]${RESET} $1"
}

log_success() {
    echo -e "${BOLD_GREEN}[SUCCESS]${RESET} $1"
}

log_error() {
    echo -e "${BOLD_RED}[ERROR]${RESET} $1"
}

# Ensure we are in the script's root directory
cd "$(dirname "$0")"

echo -e "${BOLD_BLUE}=========================================${RESET}"
echo -e "${BOLD_BLUE}   Building Zed Git Perfect Dev Extension   ${RESET}"
echo -e "${BOLD_BLUE}=========================================${RESET}"

# 1. Compile the Node.js LSP TypeScript layer
log_info "Bundling TypeScript LSP server using esbuild..."
if npm run build; then
    log_success "Generated dist/server.js successfully."
else
    log_error "TypeScript/esbuild bundling failed."
    exit 1
fi

echo -e ""

# 2. Compile the Rust WebAssembly wrapper layer
log_info "Compiling Rust extension wrapper to wasm32-wasip1..."
if cargo build --target wasm32-wasip1 --release; then
    log_success "Generated WebAssembly extension module successfully."
else
    log_error "Rust compilation failed."
    exit 1
fi

echo -e ""
echo -e "${BOLD_GREEN}=========================================${RESET}"
log_success "Build complete! Ready for local testing inside Zed."
echo -e "${BOLD_GREEN}=========================================${RESET}"
