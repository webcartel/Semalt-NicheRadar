import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { detectInitialLocale, formatInt, formatMonth } from '../utils/locale.ts'

describe('detectInitialLocale', () => {
  it("stored 'uk' wins over everything", () => {
    assert.equal(detectInitialLocale('uk', 'en-US'), 'uk')
  })
  it("stored 'en' wins over navigator uk", () => {
    assert.equal(detectInitialLocale('en', 'uk-UA'), 'en')
  })
  it('corrupt stored value falls back to navigator', () => {
    assert.equal(detectInitialLocale('de', 'uk-UA'), 'uk')
    assert.equal(detectInitialLocale('', 'en-US'), 'en')
    assert.equal(detectInitialLocale(null, 'uk-ua'), 'uk')
  })
  it('missing navigator falls back to en', () => {
    assert.equal(detectInitialLocale(null, null), 'en')
  })
})

describe('formatInt', () => {
  it('groups per locale without changing value', () => {
    assert.equal(formatInt(10510, 'en-US'), '10,510')
    assert.equal(formatInt(10510, 'uk-UA').replace(/[\s\u00a0\u202f]/g, ' '), '10 510')
  })
})

describe('formatMonth', () => {
  it('formats Mon YYYY per locale, passes through garbage', () => {
    assert.equal(formatMonth('2026-10-03', 'en-US'), 'Oct 2026')
    assert.match(formatMonth('2026-10-03', 'uk-UA'), /2026/)
    assert.equal(formatMonth('not-a-date', 'en-US'), 'not-a-date')
  })
})
