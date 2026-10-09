import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { SessionDir } from '../types'

const BACKSLASH = String.fromCharCode(92)

const dir = atom({ plugin: 'session-dir-button', key: 'dir' } as const, null as SessionDir)

// The session's own folder sits beside its transcript, named by its id:
// ~/.claude/projects/<project>/<session-id>.jsonl -> .../<project>/<session-id>
function sessionDirOf(transcriptPath: string): string {
  return transcriptPath.endsWith('.jsonl') ? transcriptPath.slice(0, -'.jsonl'.length) : transcriptPath
}

// Mirrors how Claude Code names a project folder (every non-alphanumeric
// character of the cwd becomes '-') and adds the session id. Used until a
// classic event brings the real transcript path.
async function guessDir($: EngineInterface, cwd: string): Promise<string> {
  const isWindows = cwd.charAt(1) === ":"
  const sep = isWindows ? BACKSLASH : '/'
  const home = (isWindows ? await $.env.get('USERPROFILE') : await $.env.get('HOME')) ?? ''
  const configDir = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${home}${sep}.claude`

  const project = cwd.replace(/[^a-zA-Z0-9]/g, '-')

  return `${configDir}${sep}projects${sep}${project}${sep}${await $.session.id()}`
}

async function fromTranscript($: EngineInterface, transcriptPath: string): Promise<void> {
  if (transcriptPath) {
    await update($, dir, () => sessionDirOf(transcriptPath))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const guess = await guessDir($, e.cwd)
    await update($, dir, () => guess)

    return next(e)
  })

  on('classic.SessionStart', async ($, e, next) => {
    await fromTranscript($, e.transcript_path).catch(() => undefined)

    return next(e)
  })

  on('classic.UserPromptSubmit', async ($, e, next) => {
    await fromTranscript($, e.transcript_path).catch(() => undefined)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const path = await read($, dir)

    if (e.props.hasSurvey || path === null) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    async function copy(surface: typeof e.surface): Promise<void> {
      const copied = await $.ui.copy({ text: path as string, surface })
      $.ui.toast(copied.isCopied ? 'Session directory copied' : `Could not copy: ${copied.reason}`)
    }

    return (
      <Box flexDirection="row" gap={1}>
        <Text dimColor>Session dir</Text>
        <Text key="path">{path}</Text>
        <Button key="copy" label="Copy" onPress={press => copy(press.surface)} />
      </Box>
    )
  })
}
