import { planProgramFromSnapshot } from './worker-core.js';

self.onmessage = event => {
  const { id, compiled, snapshot } = event.data;
  try { self.postMessage({ id, result: planProgramFromSnapshot(compiled, snapshot) }); }
  catch (error) { self.postMessage({ id, result: { status: 'error', diagnostics: [{ line: 1, column: 1,
    code: 'WORKER_PREFLIGHT', message: error?.message ?? String(error) }] } }); }
};
