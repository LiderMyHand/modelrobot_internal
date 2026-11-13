// Text front end for the concurrent signal, device, and robot-request scheduler. No expressions or eval.
const namePattern = /^[A-Za-z_][A-Za-z0-9_.:-]*$/;
const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const timeoutPattern = /^[1-9]\d*$/;
const operators = new Set(['==', '!=', '<', '<=', '>', '>=']);

function diagnostic(line, code, message) {
  return { line, column: 1, code, message };
}

function numeric(token) {
  if (!numberPattern.test(token || '')) return null;
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

function timeout(tokens, offset) {
  if (tokens.length === offset) return { value: undefined };
  if (tokens.length !== offset + 2 || tokens[offset] !== 'TIMEOUT' ||
      !timeoutPattern.test(tokens[offset + 1]) ||
      !Number.isSafeInteger(Number(tokens[offset + 1]))) {
    return { error: 'Expected TIMEOUT followed by a positive, safe integer count of logical ticks.' };
  }
  return { value: Number(tokens[offset + 1]) };
}

function command(tokens, line) {
  const [keyword, signal] = tokens;
  if (keyword === 'RUN_ROBOT') {
    if (tokens.length !== 1)
      return { error: diagnostic(line, 'RUN_ROBOT_SYNTAX', 'RUN_ROBOT takes no arguments.') };
    return { value: { kind: 'RUN_ROBOT', line } };
  }
  if (keyword === 'SET') {
    const value = numeric(tokens[2]);
    if (tokens.length !== 3 || !namePattern.test(signal || '') || value === null)
      return { error: diagnostic(line, 'SET_SYNTAX', 'Expected SET signal finite-number.') };
    return { value: { kind: 'SET_SIGNAL', signal, value, line } };
  }
  if (keyword === 'WAIT_SET' || keyword === 'WAIT_UNSET') {
    const wait = timeout(tokens, 2);
    if (!namePattern.test(signal || '') || wait.error)
      return { error: diagnostic(line, 'WAIT_SYNTAX', `Expected ${keyword} signal [TIMEOUT positive-ticks].`) };
    return { value: { kind: keyword === 'WAIT_SET' ? 'WAIT_SIGNAL_SET' : 'WAIT_SIGNAL_UNSET',
      signal, ...(wait.value === undefined ? {} : { timeoutTicks: wait.value }), line } };
  }
  if (keyword === 'WAIT_VALUE') {
    const value = numeric(tokens[3]), wait = timeout(tokens, 4);
    if (!namePattern.test(signal || '') || !operators.has(tokens[2]) || value === null || wait.error)
      return { error: diagnostic(line, 'WAIT_VALUE_SYNTAX',
        'Expected WAIT_VALUE signal (==|!=|<|<=|>|>=) finite-number [TIMEOUT positive-ticks].') };
    return { value: { kind: 'WAIT_SIGNAL_VALUE', signal, operator: tokens[2], value,
      ...(wait.value === undefined ? {} : { timeoutTicks: wait.value }), line } };
  }
  if (keyword === 'MOVE_MODEL') {
    const coordinate = numeric(tokens[3]);
    const ticks = tokens[4] === 'TICKS' && timeoutPattern.test(tokens[5] || '') ? Number(tokens[5]) : NaN;
    if (tokens.length !== 6 || !namePattern.test(signal || '') ||
        !['X', 'Y', 'Z'].includes(tokens[2]) || coordinate === null ||
        !Number.isSafeInteger(ticks) || ticks < 1)
      return { error: diagnostic(line, 'MOVE_MODEL_SYNTAX',
        'Expected MOVE_MODEL model X|Y|Z absolute-world-coordinate TICKS positive-ticks.') };
    return { value: { kind: 'MOVE_MODEL', model: signal, axis: tokens[2],
      position: coordinate, durationTicks: ticks, line } };
  }
  return { error: diagnostic(line, 'UNKNOWN_COMMAND', `Unknown signal command ${keyword}.`) };
}

/** Compile PROGRAM/END blocks to createMultiProgramState's typed command input. */
export function compileMultiProgram(source) {
  if (typeof source !== 'string') return { programs: [], diagnostics: [diagnostic(1, 'SOURCE_TYPE', 'Source must be text.')], ok: false };
  const programs = [], diagnostics = [], names = new Set();
  let current = null;
  const lines = source.split(/\r\n|\n|\r/);
  for (let index = 0; index < lines.length; index++) {
    const line = index + 1;
    const content = lines[index].split('#', 1)[0].trim();
    if (!content) continue;
    const tokens = content.split(/\s+/), keyword = tokens[0];
    if (keyword === 'PROGRAM') {
      if (current) { diagnostics.push(diagnostic(line, 'PROGRAM_NESTED', 'A PROGRAM block must end before another begins.')); continue; }
      if (tokens.length !== 2 || !namePattern.test(tokens[1])) {
        diagnostics.push(diagnostic(line, 'PROGRAM_SYNTAX', 'Expected PROGRAM name.')); continue;
      }
      if (names.has(tokens[1])) {
        diagnostics.push(diagnostic(line, 'PROGRAM_DUPLICATE', `Duplicate program ${tokens[1]}.`));
        current = { name: tokens[1], commands: [], valid: false, line };
        continue;
      }
      names.add(tokens[1]);
      current = { name: tokens[1], commands: [], valid: true, line };
      continue;
    }
    if (keyword === 'END') {
      if (tokens.length !== 1) { diagnostics.push(diagnostic(line, 'END_SYNTAX', 'END takes no arguments.')); continue; }
      if (!current) { diagnostics.push(diagnostic(line, 'END_WITHOUT_PROGRAM', 'END needs an open PROGRAM block.')); continue; }
      if (current.valid) programs.push({ name: current.name, commands: current.commands });
      current = null;
      continue;
    }
    if (!current) { diagnostics.push(diagnostic(line, 'COMMAND_OUTSIDE_PROGRAM', 'Signal commands need a PROGRAM block.')); continue; }
    const parsed = command(tokens, line);
    if (parsed.error) diagnostics.push(parsed.error);
    else current.commands.push(parsed.value);
  }
  if (current) diagnostics.push(diagnostic(current.line, 'PROGRAM_UNCLOSED', `PROGRAM ${current.name} has no END.`));
  return { programs, diagnostics, ok: diagnostics.length === 0 };
}
