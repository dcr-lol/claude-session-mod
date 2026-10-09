import { expect, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const DIR = String.raw`C:\Users\me\.claude\projects\C--Users-me-repo\abc`
const TRANSCRIPT = `${DIR}.jsonl`

test('the band shows the transcript directory and copies it on press', async ($, on) => {
  const copied: string[] = []
  on('ui.copy', async (_$, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })
  on('ui.toast', async () => ({ value: undefined }))
  on('classic.SessionStart', async () => ({}))

  await $.classic.SessionStart({ source: 'startup', transcript_path: TRANSCRIPT })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'session-dir-button', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: DIR })).toBeDefined()
    expect((await ui.find({ key: 'copy' }))?.props.label).toBe('Copy')
    await ui.press({ key: 'copy' })
    await ui.unmount()
  }

  expect(copied).toEqual([DIR, DIR])
})

test('the band stays out of a survey', async ($, on) => {
  on('classic.SessionStart', async () => ({}))
  on('ui.render', async ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })

  await $.classic.SessionStart({ source: 'startup', transcript_path: TRANSCRIPT })
  const ui = await $.ui.mount({
    plugin: 'session-dir-button',
    surface: 'terminal',
    ...BAND,
    props: { ...BAND.props, hasSurvey: true },
  })
  expect(await ui.find({ key: 'copy' })).toBeUndefined()
  await ui.unmount()
})
