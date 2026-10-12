// Cross-meeting isolation: in-flight WTA must not bleed into the next session.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');

const mainSource = fs.readFileSync(path.join(root, 'electron/main.ts'), 'utf8');
const intMgrSource = fs.readFileSync(path.join(root, 'electron/IntelligenceManager.ts'), 'utf8');
const engineSource = fs.readFileSync(path.join(root, 'electron/IntelligenceEngine.ts'), 'utf8');
const sessionSource = fs.readFileSync(path.join(root, 'electron/SessionTracker.ts'), 'utf8');
const overlaySource = fs.readFileSync(
  path.join(root, 'src/components/NativelyInterface.tsx'),
  'utf8',
);

test('endMeeting aborts in-flight intelligence streams synchronously', () => {
  const endStart = mainSource.indexOf('public async endMeeting');
  assert.ok(endStart >= 0);
  const endSlice = mainSource.slice(endStart, endStart + 2500);
  const resetIdx = endSlice.indexOf('this.intelligenceManager.resetEngine()');
  const teardownIdx = endSlice.indexOf('this._pendingTeardown');
  assert.ok(resetIdx >= 0, 'endMeeting should call resetEngine()');
  assert.ok(
    teardownIdx < 0 || resetIdx < teardownIdx,
    'resetEngine() should run before background teardown is scheduled',
  );
});

test('stopMeeting cancels engine before persistence clears session', () => {
  const stopStart = intMgrSource.indexOf('async stopMeeting()');
  assert.ok(stopStart >= 0);
  const stopSlice = intMgrSource.slice(stopStart, stopStart + 400);
  assert.match(stopSlice, /this\.resetEngine\(\)/);
  assert.ok(
    stopSlice.indexOf('resetEngine') < stopSlice.indexOf('persistence.stopMeeting'),
    'resetEngine must run before persistence.stopMeeting',
  );
});

test('SessionTracker exposes monotonic session epoch incremented on reset', () => {
  assert.match(sessionSource, /private sessionEpoch/);
  assert.match(sessionSource, /getSessionEpoch\(\)/);
  assert.match(sessionSource, /this\.sessionEpoch \+= 1/);
});

test('runWhatShouldISay discards results when session epoch changes', () => {
  const fnStart = engineSource.indexOf('async runWhatShouldISay');
  assert.ok(fnStart >= 0);
  const fnSlice = engineSource.slice(fnStart, fnStart + 14000);
  assert.match(fnSlice, /sessionEpochAtStart = this\.session\.getSessionEpoch\(\)/);
  assert.match(fnSlice, /getSessionEpoch\(\) !== sessionEpochAtStart/);
  assert.match(fnSlice, /WTA result discarded — session reset during generation/);
});

test('manual WTA waits for interviewer speech before generating', () => {
  const fnStart = engineSource.indexOf('async runWhatShouldISay');
  const fnSlice = engineSource.slice(fnStart, fnStart + 14000);
  assert.match(fnSlice, /waitForRecentInterviewerSpeech/);
  assert.match(fnSlice, /WTA waiting for interviewer speech/);
  assert.match(sessionSource, /hasRecentInterviewerSpeech/);
  assert.match(sessionSource, /waitForRecentInterviewerSpeech/);
});

test('session-reset invalidates overlay intelligence generation acceptance', () => {
  const resetStart = overlaySource.indexOf('onSessionReset');
  assert.ok(resetStart >= 0);
  const resetSlice = overlaySource.slice(resetStart, resetStart + 1200);
  assert.match(resetSlice, /overlayGenerationIdRef\.current \+= 1/);
  assert.match(resetSlice, /flushToken\(\)/);
});
