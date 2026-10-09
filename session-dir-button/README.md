# session-dir-button

A Claude Code mod that adds a band above the prompt showing the current
session's directory, with a **Copy** button that puts the path on the clipboard:

```
Session dir  C:\Users\you\.claude\projects\C--Users-you-repo\<session-id>  [Copy]
```

The path is the session's transcript path without `.jsonl`
(`~/.claude/projects/<project>/<session-id>`). It follows `/clear` and resumes.
Claude Code only creates that folder once the session writes something there,
such as subagent transcripts or large tool outputs, so it may not exist yet.

## Install

At the prompt of a terminal Claude Code session:

```
/plugin install session-dir-button --marketplace dcr-lol/claude-session-mod
```

Answer `y` to add the marketplace, then pick a scope.

## Develop

```
claude plugin validate session-dir-button
claude plugin test session-dir-button
claude --plugin-dir session-dir-button
```
