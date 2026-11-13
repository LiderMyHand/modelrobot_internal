# Browser-safe classroom example text

Date: 2026-11-13. `frontend/example-text.js` statically imports the text fixtures under `testowe/` and exposes `readExampleText(path)`. The Workcell and Workspace pages currently advertise relative paths there, including the Pi robot URL with a query string, six-axis and weld lessons, concurrent device lessons, and the four-bar project inputs. All available text fixtures total about 63 KB before bundling. The resolver accepts only a known relative `testowe/` path and rejects traversal or unknown names before I/O.

When `location.protocol === 'file:'`, the resolver returns the embedded text without calling `fetch`. Under HTTP/HTTPS it fetches the supplied relative path, so a served fixture edit appears without rebuilding the bundle. Optional protocol/fetcher arguments support focused tests; ordinary UI code calls `await readExampleText(path)`. The two four-bar JSON files use esbuild's standard JSON import and are reserialized to JSON text, so a global `.json=text` loader is unnecessary.

`tests/example-text.test.cjs` bundles the resolver with esbuild, verifies every advertised UI path against the fixture contents (semantic JSON equality), proves file mode makes zero fetch calls, confirms HTTP returns served text, and rejects unknown/traversing paths. It passes 2/2.

Integration requires `import { readExampleText } from './example-text.js'` in `frontend/workcell-ui.js` and `frontend/workspace.js`, replacing their example-specific `fetch(...).text()` blocks. The runtime esbuild invocation needs `--loader:.xml=text --loader:.urdf=text --loader:.sdf=text --loader:.robot=text --loader:.mprg=text --loader:.txt=text`; `.xml=text` already existed when this file was written. The resolver file is standalone and does not edit the shared UI or package script.

This addresses example text only. A directly opened `file://` app may still need separate handling for bundled Worker startup and any image/STL asset loading; those are outside this resolver.
