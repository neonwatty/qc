#!/usr/bin/env bash
# PostToolUse hook: auto-format files after edits.
# Always exits 0 — formatting failures should never block.

FILE_PATH=$(echo "$TOOL_OUTPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.css)
    npx eslint --fix "$FILE_PATH" 2>/dev/null
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
