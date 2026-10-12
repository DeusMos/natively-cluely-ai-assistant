/**
 * Instruction for the "Answer Multiple Choice on Screen" hotkey
 * (general:answer-screen-mcq). Rides the screenshot request as its
 * currentRequest, so the model answers every multiple-choice question it can
 * see in one short pass. Kept terse on purpose: output length is most of the
 * latency once the image is in.
 */
export const SCREEN_MCQ_INSTRUCTION = [
  'The attached screenshot contains one or more multiple-choice questions.',
  'Answer every multiple-choice question visible, in on-screen order (top to bottom, left to right).',
  'Output one line per question and nothing else, formatted exactly as:',
  '**<n>. <first few words of the question>…** → <option letter, if the options are lettered> <the correct option text, as written on screen>',
  'If a question accepts several correct options, list all of them on its line.',
  'No explanations, no restating options. If a question or its options are cut off or unreadable, still give your best answer and append " (unsure)".',
].join('\n');
