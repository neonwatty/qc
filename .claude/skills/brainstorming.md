---
name: brainstorming
description: Use before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

**Do NOT write any code or take any implementation action until you have presented a design and the user has approved it.**

## Process

### 1. Explore Project Context

Check files, docs, recent commits to understand the current state.

### 2. Ask Clarifying Questions

- One question at a time
- Prefer multiple choice questions when possible
- Focus on understanding: purpose, constraints, success criteria

### 3. Propose 2-3 Approaches

- Present options conversationally with trade-offs
- Lead with your recommended option and explain why

### 4. Present Design

- Scale each section to its complexity
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

### 5. Write Design Doc

Save to `.claude/plans/<date>-<topic>-design.md` and commit.

### 6. Transition to Implementation

Create a detailed implementation plan from the approved design.

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on
- **Be flexible** - Go back and clarify when something doesn't make sense
