// gemini-chat-stream must inject SessionTracker STT even when renderer passes partial context.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ipcSource = fs.readFileSync(
  path.resolve(__dirname, '../../ipcHandlers.ts'),
  'utf8',
);
const overlaySource = fs.readFileSync(
  path.resolve(__dirname, '../../../src/components/NativelyInterface.tsx'),
  'utf8',
);

test('gemini-chat-stream always snapshots interview context before user turn', () => {
  const handlerStart = ipcSource.indexOf("'gemini-chat-stream'");
  assert.ok(handlerStart >= 0);
  const handlerSlice = ipcSource.slice(handlerStart, handlerStart + 4500);
  assert.match(
    handlerSlice,
    /getInterviewContextForChat\(\)/,
    'should snapshot SessionTracker context',
  );
  assert.doesNotMatch(
    handlerSlice.slice(0, handlerSlice.indexOf('addTranscript')),
    /if\s*\(\s*!context\s*\)\s*\{[\s\S]{0,200}getInterviewContextForChat/,
    'snapshot must not be gated on !context',
  );
});

test('gemini-chat-stream merges STT when caller context lacks <transcript>', () => {
  assert.match(ipcSource, /callerHasLiveTranscript/);
  assert.match(ipcSource, /isMeetingRecallContext/);
  assert.match(ipcSource, /autoContextSnapshot\s*&&\s*!isMeetingRecallContext/);
});

test('overlay manual chat does not pass UI-only conversationContext', () => {
  const submitStart = overlaySource.indexOf('const handleManualSubmit = async');
  assert.ok(submitStart >= 0);
  const submitSlice = overlaySource.slice(submitStart, submitStart + 8000);
  const streamCall = submitSlice.match(
    /streamGeminiChat\([\s\S]{0,400}?\);/,
  );
  assert.ok(streamCall, 'handleManualSubmit should call streamGeminiChat');
  assert.doesNotMatch(
    streamCall[0],
    /conversationContext/,
    'UI messages must not replace SessionTracker STT context',
  );
});
