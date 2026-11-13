import { snapshotProgramContext } from './snapshot.js';
import { planProgramFromSnapshot } from './worker-core.js';

const errorResult = (code, message) => ({ status: 'error', diagnostics: [{ line: 1, column: 1, code, message }] });

function planOnMainThread(compiled, snapshot, signal) {
  return new Promise(resolve => {
    // file:// pages have opaque origins in ordinary Chromium: a sibling file
    // cannot be loaded as a Worker script. Yield once so UI status can paint.
    setTimeout(() => {
      if (signal?.aborted) { resolve(errorResult('CANCELLED', 'Planning was cancelled.')); return; }
      try { resolve(planProgramFromSnapshot(compiled, snapshot)); }
      catch (error) { resolve(errorResult('LOCAL_PREFLIGHT', error?.message ?? String(error))); }
    }, 0);
  });
}

/** One-shot Worker planning. Terminating the Worker also cancels a long RRT search. */
export async function planProgramInWorker(compiled, context, { signal, workerUrl = 'scripts/planning-worker.bundle.js' } = {}) {
  if (!compiled?.ok) return errorResult('PROGRAM', 'Compile the program before planning.');
  if (signal?.aborted) return errorResult('CANCELLED', 'Planning was cancelled.');
  let snapshot;
  try { snapshot = snapshotProgramContext(context); }
  catch (error) { return errorResult('SNAPSHOT', error.message); }
  if (document.location.protocol === 'file:' || typeof Worker === 'undefined')
    return planOnMainThread(compiled, snapshot, signal);
  return new Promise(resolve => {
    let worker;
    try { worker = new Worker(new URL(workerUrl, document.baseURI)); }
    catch (error) { resolve(errorResult('WORKER_START', error.message)); return; }
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      worker.terminate();
      resolve(result);
    };
    const abort = () => finish(errorResult('CANCELLED', 'Planning was cancelled.'));
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    worker.onmessage = event => finish(event.data?.result ?? errorResult('WORKER_RESPONSE', 'Planning Worker returned no result.'));
    worker.onerror = event => finish(errorResult('WORKER_FAILURE', event.message || 'Planning Worker failed.'));
    try { worker.postMessage({ id: 1, compiled, snapshot }); }
    catch (error) { finish(errorResult('WORKER_REQUEST', error.message)); }
  });
}
