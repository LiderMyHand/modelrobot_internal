import { planProgram } from '../program-plan.js';
import { restoreProgramContext } from './snapshot.js';

/** Pure Worker operation, also usable in focused tests without a browser Worker. */
export function planProgramFromSnapshot(compiled, snapshot) {
  const context = restoreProgramContext(snapshot);
  try { return planProgram(compiled, context); }
  finally { context.dispose(); }
}
