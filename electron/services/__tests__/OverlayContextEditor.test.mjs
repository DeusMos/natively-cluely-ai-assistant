import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildOverlayUserContextBlock,
  OVERLAY_CONTEXT_MAX_CHARS,
} from '../context/overlayUserContext.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('buildOverlayUserContextBlock wraps trimmed text in user_context tags', () => {
  assert.equal(
    buildOverlayUserContextBlock('  Role: PM at Acme  '),
    '<user_context>\nRole: PM at Acme\n</user_context>',
  );
  assert.equal(buildOverlayUserContextBlock(''), '');
  assert.equal(buildOverlayUserContextBlock('   '), '');
});

test('overlay context is injected into streamChat and PromptAssembler paths', () => {
  const llmSource = fs.readFileSync(path.resolve(__dirname, '../../LLMHelper.ts'), 'utf8');
  const assemblerSource = fs.readFileSync(
    path.resolve(__dirname, '../context/PromptAssembler.ts'),
    'utf8',
  );
  const ipcSource = fs.readFileSync(path.resolve(__dirname, '../../ipcHandlers.ts'), 'utf8');

  assert.match(llmSource, /buildOverlayUserContextBlock\(this\.overlayContext\)/);
  assert.match(assemblerSource, /overlayContext\?: string/);
  assert.match(assemblerSource, /overlay_user_context/);
  assert.match(ipcSource, /overlay:save-context/);
  assert.match(ipcSource, /OVERLAY_CONTEXT_MAX_CHARS/);
  assert.equal(OVERLAY_CONTEXT_MAX_CHARS, 8000);
});
