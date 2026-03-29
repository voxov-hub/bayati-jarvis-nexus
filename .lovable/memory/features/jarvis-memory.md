---
name: Jarvis memory system
description: Persistent project memory stored on Hetzner server via Flask API
type: feature
---
Base URL: https://pipeline.voxovdesign.com/jarvis/memory/
Endpoints: GET / (index), GET /{project}, PUT /{project}, DELETE /{project}
Memory files: JSON with project, current_status, key_context, recent_decisions, next_actions, wins, notes
Special file: fredrik-profile.json always loaded regardless of active project
Commands: "save session"/"update memory" triggers structured save; "start/new project: [name]" creates new project
Default active project: bayatico-strategy
Edge function fetches all memory before every Claude call and injects into system prompt
