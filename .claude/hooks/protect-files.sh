#!/usr/bin/env bash
# PreToolUse hook: block edits to protected files.
# Exit 2 = BLOCK, Exit 0 = ALLOW.

FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")

# Block .env files (allow .env.example)
if [[ "$BASENAME" == .env* && "$BASENAME" != ".env.example" ]]; then
  echo "BLOCKED: Use Doppler for secrets"
  exit 2
fi

# Block package-lock.json
if [[ "$BASENAME" == "package-lock.json" ]]; then
  echo "BLOCKED: Auto-generated file"
  exit 2
fi

# Block edits to existing migration files
if [[ "$FILE_PATH" == *supabase/migrations/* && -f "$FILE_PATH" ]]; then
  echo "BLOCKED: Create a new migration instead"
  exit 2
fi

exit 0
