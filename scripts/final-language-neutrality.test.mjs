import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const runtime = readFileSync(new URL('../public/i18n/tlab-i18n.js', import.meta.url), 'utf8');

test('cross-document language changes notify once without touching gameplay storage', () => {
  const values = new Map([['tariklab.language', 'tr'], ['game.slot1', '{"week":7}']]);
  const handlers = {};
  const writes = [];
  const context = {
    localStorage: { getItem: k => values.get(k) ?? null, setItem: (k, v) => { writes.push(k); values.set(k, v); } },
    addEventListener: (event, fn) => { handlers[event] = fn; },
  };
  vm.runInNewContext(runtime, context);
  const I = context.tlabI18n;
  let calls = 0;
  let off;
  off = I.onLang(() => { calls++; off(); I.onLang(() => { calls++; }); });
  values.set(I.KEY, 'en');
  handlers.storage({ key: I.KEY });
  assert.equal(I.getLang(), 'en');
  assert.equal(calls, 1, 'listeners added during a notification wait for the next change');
  handlers.storage({ key: 'game.slot1' });
  assert.equal(calls, 1);
  assert.equal(values.get('game.slot1'), '{"week":7}');
  assert.ok(writes.every(k => k === I.KEY));
  values.delete(I.KEY);
  handlers.storage({ key: null });
  assert.equal(I.getLang(), 'tr');
  assert.equal(calls, 2);
});

test('Next Wave language rerender preserves unsaved game and screen, without writing a save', async () => {
  const values = new Map();
  const listeners = new Set();
  let ready;
  let lang = 'tr';
  let nodes = {};
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  const screens = [{ dataset: { screen: 'Toplantı' } }];
  let rendered = "";
  const body = { dataset: { game: 'apartman' }, set innerHTML(html) { rendered = html; nodes = {}; } };
  const doc = { body, querySelector: selector => nodes[selector] ??= {}, querySelectorAll: selector => selector === '[data-screen]' ? screens : [] };
  const I = { HELP_EN: { apartman: 'Meeting help' }, getLang: () => lang, phrase: x => x, applyHtmlLang() {}, mountLangToggle() {}, onLang(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  globalThis.localStorage = storage;
  globalThis.document = doc;
  globalThis.window = { tlabI18n: I, addEventListener: (_, fn) => { ready = fn; } };
  try {
    await import('../public/games/next-wave.js?final-language-neutrality');
    ready();
    assert.match(rendered, /Slot 1 · boş/);
    assert.doesNotMatch(rendered, /Slot 1 · dolu/);
    nodes['#new'].onclick();
    screens[0].onclick();
    const before = nodes['#panel'].innerHTML;
    assert.match(before, /Henüz toplanılmadı/);
    for (const next of ['en', 'tr', 'en']) {
      lang = next;
      [...listeners].forEach(fn => fn(next));
      assert.equal(nodes['#panel'].innerHTML, before);
      assert.equal(values.size, 0, 'language switching must not persist or overwrite a draft');
      assert.equal(listeners.size, 1, 'rerenders must not accumulate game listeners');
    }
    nodes['#save'].onclick();
    const saved = JSON.parse(values.get('tariklab.nextwave.apartman.slot1'));
    assert.equal(saved.week, 1);
    assert.equal(saved.ui.screen, 'Toplantı');
    assert.equal(saved.finance.cash, 12000);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  }
});
