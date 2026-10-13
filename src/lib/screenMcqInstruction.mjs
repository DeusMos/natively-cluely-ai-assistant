/**
 * Instruction for the "Answer Multiple Choice on Screen" hotkey
 * (general:answer-screen-mcq). Rides the screenshot request as its
 * currentRequest, so the model answers every multiple-choice question it can
 * see in one pass. Test questions often have a tempting "obvious" option and a
 * subtly more correct one, so the model must name both and say why the best
 * one wins, with a confidence and a source. Kept terse otherwise: output
 * length is most of the latency once the image is in.
 */
export const SCREEN_MCQ_INSTRUCTION = [
  'The attached screenshot contains one or more multiple-choice questions.',
  'Answer every multiple-choice question visible, in on-screen order (top to bottom, left to right).',
  'These are exam-style questions: often one option looks obviously right but another is more precisely or more completely correct. Read the exact wording (qualifiers like "best", "most", "first", "always", "except", "not") and pick the MOST correct option.',
  '',
  'For each question output exactly this, and nothing else:',
  '**<n>. <first few words of the question>…**',
  'Best: <option letter, if lettered> <option text as written> — <confidence 0-100>%',
  'Trap: <option letter> <option text> — <why it is less correct, max 15 words>',
  'Source: <where this is established>',
  '',
  'Rules:',
  '- Omit the Trap line when no other option is plausibly correct.',
  '- If several options are required (select-all questions), list them all on the Best line.',
  '- Confidence is your honest probability that Best is the answer the test expects; do not round everything up.',
  '- Source: name a specific, real reference you are confident exists (a standard, statute, textbook, official documentation, or encyclopedia article title), or "your notes" when the answer comes from the provided user context, or "on screen" when the screenshot itself shows it. Never invent a URL, page number, or citation; if you cannot name one, write "general knowledge".',
  '- If a question or its options are cut off or unreadable, still answer and add " (partly unreadable)" to the Best line.',
].join('\n');
