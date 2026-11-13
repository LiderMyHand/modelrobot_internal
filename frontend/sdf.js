// A deliberately bounded SDFormat world reader. All distances are metres,
// angles are radians, and poses use x y z roll pitch yaw (Z-Y-X rotation).
// Unsupported elements are reported rather than interpreted as physics.

const child = (node, tag) => [...node.children].find(item => item.localName === tag);
const children = (node, tag) => [...node.children].filter(item => item.localName === tag);
const value = (node, tag) => child(node, tag)?.textContent.trim();
const finite = (text, length, label) => {
  const parts = text?.trim().split(/\s+/).map(Number);
  if (!parts || parts.length !== length || parts.some(number => !Number.isFinite(number))) throw new Error(`${label} needs ${length} finite numbers.`);
  return parts;
};
const positive = (numbers, label) => {
  if (numbers.some(number => number <= 0)) throw new Error(`${label} must be positive.`);
  return numbers;
};
const diag = (diagnostics, path, code, message, severity = 'error') => diagnostics.push({ path, code, message, severity });
const xmlEscape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const format = values => values.map(number => Number(number).toString()).join(' ');
const finitePose = values => Array.isArray(values) && values.length === 6 && values.every(Number.isFinite);
const localUri = uri => {
  if (!uri || /[?#\\]/.test(uri) || uri.startsWith('/') || uri.split('/').includes('..')) return false;
  const scheme = uri.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!scheme) return true;
  return /^(model|file|package):\/\//i.test(uri);
};

function pose(node, parentFrame, diagnostics, path) {
  const element = child(node, 'pose');
  if (!element) return [0, 0, 0, 0, 0, 0];
  const relative = element.getAttribute('relative_to');
  const allowed = Array.isArray(parentFrame) ? parentFrame : [parentFrame];
  if (relative && !allowed.includes(relative)) diag(diagnostics, path, 'UNSUPPORTED_FRAME', `Pose relative_to="${relative}" is outside the supported parent frame ${allowed.join(' or ')}.`);
  try { return finite(element.textContent, 6, 'Pose'); }
  catch (error) { diag(diagnostics, path, 'INVALID_POSE', error.message); return [0, 0, 0, 0, 0, 0]; }
}

function geometry(node, diagnostics, path) {
  const container = child(node, 'geometry');
  const shapes = container ? [...container.children] : [];
  if (shapes.length !== 1) { diag(diagnostics, path, 'INVALID_GEOMETRY', 'One supported geometry shape is required.'); return null; }
  const shape = shapes[0];
  try {
    switch (shape.localName) {
      case 'box': return { type: 'box', size: positive(finite(value(shape, 'size'), 3, 'Box size'), 'Box size') };
      case 'sphere': return { type: 'sphere', radius: positive(finite(value(shape, 'radius'), 1, 'Sphere radius'), 'Sphere radius')[0] };
      case 'cylinder': return { type: 'cylinder', radius: positive(finite(value(shape, 'radius'), 1, 'Cylinder radius'), 'Cylinder radius')[0], length: positive(finite(value(shape, 'length'), 1, 'Cylinder length'), 'Cylinder length')[0] };
      case 'plane': return { type: 'plane', normal: finite(value(shape, 'normal') || '0 0 1', 3, 'Plane normal'), size: positive(finite(value(shape, 'size'), 2, 'Plane size'), 'Plane size') };
      case 'mesh': {
        const uri = value(shape, 'uri');
        if (!uri || !localUri(uri)) throw new Error('Mesh needs a local URI; remote assets are not loaded.');
        const scale = value(shape, 'scale') ? finite(value(shape, 'scale'), 3, 'Mesh scale') : [1, 1, 1];
        if (scale.some(number => number === 0)) throw new Error('Mesh scale cannot contain zero.');
        return { type: 'mesh', uri, scale };
      }
      default: diag(diagnostics, path, 'UNSUPPORTED_GEOMETRY', `Geometry <${shape.localName}> is unsupported.`); return null;
    }
  } catch (error) { diag(diagnostics, path, 'INVALID_GEOMETRY', error.message); return null; }
}

function shape(element, parentFrame, diagnostics, path) {
  const result = { name: element.getAttribute('name') || '', pose: pose(element, parentFrame, diagnostics, path), geometry: geometry(element, diagnostics, path) };
  const diffuse = value(child(element, 'material') || element, 'diffuse');
  if (diffuse && element.localName === 'visual') {
    try { result.color = finite(diffuse, 4, 'Diffuse RGBA'); }
    catch (error) { diag(diagnostics, path, 'INVALID_MATERIAL', error.message); }
  }
  return result;
}

function model(element, diagnostics, path, nameOverride, poseOverride) {
  const name = nameOverride || element.getAttribute('name');
  if (!name) { diag(diagnostics, path, 'MODEL_NAME', 'Model needs a name.'); return null; }
  const ownPath = `${path}/model[${name}]`;
  const state = { name, pose: poseOverride || pose(element, 'world', diagnostics, ownPath), static: value(element, 'static') === 'true', links: [] };
  if (!state.static) diag(diagnostics, ownPath, 'PHYSICS_IGNORED', 'Dynamic physics is unsupported; model is kinematically placed.', 'warning');
  for (const item of element.children) {
    if (item.localName === 'joint' || item.localName === 'frame' || item.localName === 'model') diag(diagnostics, ownPath, 'UNSUPPORTED_MODEL_ELEMENT', `<${item.localName}> is unsupported in an environment model.`);
    else if (!['name', 'pose', 'static', 'link', 'canonical_link'].includes(item.localName)) diag(diagnostics, ownPath, 'IGNORED_MODEL_ELEMENT', `<${item.localName}> is ignored.`, 'warning');
  }
  const linkNames = new Set();
  for (const link of children(element, 'link')) {
    const linkName = link.getAttribute('name'), linkPath = `${ownPath}/link[${linkName || '?'}]`;
    if (!linkName) { diag(diagnostics, linkPath, 'LINK_NAME', 'Link needs a name.'); continue; }
    if (linkNames.has(linkName)) { diag(diagnostics, linkPath, 'DUPLICATE_LINK', `Duplicate link name ${linkName}.`); continue; }
    linkNames.add(linkName);
    const record = { name: linkName, pose: pose(link, ['__model__', name], diagnostics, linkPath), visuals: [], collisions: [] };
    for (const visual of children(link, 'visual')) record.visuals.push(shape(visual, ['__link__', linkName], diagnostics, `${linkPath}/visual`));
    for (const collision of children(link, 'collision')) record.collisions.push(shape(collision, ['__link__', linkName], diagnostics, `${linkPath}/collision`));
    for (const item of link.children) if (!['pose', 'visual', 'collision'].includes(item.localName)) diag(diagnostics, linkPath, 'IGNORED_LINK_ELEMENT', `<${item.localName}> is ignored.`, 'warning');
    state.links.push(record);
  }
  if (!state.links.length) diag(diagnostics, ownPath, 'EMPTY_MODEL', 'Model has no supported links.');
  return state;
}

/** readInclude(uri) must resolve bundled files only and throw on ambiguity. */
export function parseSDF(xml, { readInclude } = {}) {
  if (typeof DOMParser === 'undefined') throw new Error('SDF parsing requires a browser DOMParser.');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  if (document.querySelector('parsererror') || document.documentElement.localName !== 'sdf') throw new Error('Expected valid XML with an <sdf> root.');
  const root = document.documentElement, version = root.getAttribute('version') || '';
  if (!/^1\.(?:8|9|10|11|12)$/.test(version)) throw new Error(`SDF version ${version || '(missing)'} is unsupported; use 1.8–1.12.`);
  const worlds = children(root, 'world');
  if (worlds.length !== 1) throw new Error('One <world> is required.');
  const source = worlds[0], diagnostics = [], world = { name: source.getAttribute('name') || '', models: [] };
  if (!world.name) diag(diagnostics, '/world', 'WORLD_NAME', 'World needs a name.');
  const seen = new Set();
  const push = record => {
    if (!record) return;
    if (seen.has(record.name)) diag(diagnostics, `/world/model[${record.name}]`, 'DUPLICATE_MODEL', `Duplicate model name ${record.name}.`);
    else { seen.add(record.name); world.models.push(record); }
  };
  for (const item of source.children) {
    if (item.localName === 'model') push(model(item, diagnostics, '/world'));
    else if (item.localName === 'include') {
      const uri = value(item, 'uri'), path = `/world/include[${uri || '?'}]`;
      if (!uri || !localUri(uri)) { diag(diagnostics, path, 'INVALID_INCLUDE', 'Include needs a local URI.'); continue; }
      if (!readInclude) { diag(diagnostics, path, 'MISSING_INCLUDE', `No bundled resolver for ${uri}.`); continue; }
      try {
        const included = readInclude(uri);
        if (!included) throw new Error(`Bundled include ${uri} is missing.`);
        const includedDoc = new DOMParser().parseFromString(included, 'application/xml');
        if (includedDoc.querySelector('parsererror') || includedDoc.documentElement.localName !== 'sdf') throw new Error(`Include ${uri} is not valid SDF.`);
        const element = child(includedDoc.documentElement, 'model');
        if (!element) throw new Error(`Include ${uri} needs a top-level <model>.`);
        const name = value(item, 'name') || element.getAttribute('name');
        const override = child(item, 'pose') ? pose(item, 'world', diagnostics, path) : null;
        push(model(element, diagnostics, path, name, override));
      } catch (error) { diag(diagnostics, path, 'INCLUDE_FAILED', error.message); }
    } else if (item.localName === 'frame') diag(diagnostics, '/world', 'UNSUPPORTED_FRAME', 'World <frame> definitions are unsupported.');
    else diag(diagnostics, '/world', 'IGNORED_WORLD_ELEMENT', `<${item.localName}> is ignored.`, 'warning');
  }
  return { world, diagnostics };
}

function poseXml(p, indent) { return `${indent}<pose>${format(p)}</pose>`; }
function geometryXml(g, indent) {
  let contents;
  switch (g.type) {
    case 'box': contents = `<box><size>${format(g.size)}</size></box>`; break;
    case 'sphere': contents = `<sphere><radius>${g.radius}</radius></sphere>`; break;
    case 'cylinder': contents = `<cylinder><radius>${g.radius}</radius><length>${g.length}</length></cylinder>`; break;
    case 'plane': contents = `<plane><normal>${format(g.normal)}</normal><size>${format(g.size)}</size></plane>`; break;
    case 'mesh': contents = `<mesh><uri>${xmlEscape(g.uri)}</uri><scale>${format(g.scale)}</scale></mesh>`; break;
    default: throw new Error(`Cannot export geometry ${g.type}.`);
  }
  return `${indent}<geometry>${contents}</geometry>`;
}

/** Export only the supported subset; imported includes are expanded inline. */
export function serializeSDF(world) {
  if (!world?.name || !Array.isArray(world.models)) throw new Error('World name and models are required.');
  const lines = ['<?xml version="1.0"?>', '<sdf version="1.10">', `  <world name="${xmlEscape(world.name)}">`];
  for (const model of world.models) {
    if (!model.name || !finitePose(model.pose) || !Array.isArray(model.links)) throw new Error('Each model needs a name, six-value pose, and links.');
    lines.push(`    <model name="${xmlEscape(model.name)}">`, poseXml(model.pose, '      '), `      <static>${model.static ? 'true' : 'false'}</static>`);
    for (const link of model.links) {
      if (!link.name || !finitePose(link.pose)) throw new Error(`Link in ${model.name} needs a name and six-value pose.`);
      lines.push(`      <link name="${xmlEscape(link.name)}">`, poseXml(link.pose, '        '));
      for (const [kind, shapes] of [['visual', link.visuals], ['collision', link.collisions]]) for (const entry of shapes) {
        if (!entry.geometry || !finitePose(entry.pose)) throw new Error(`Cannot export invalid ${kind} in ${model.name}/${link.name}.`);
        lines.push(`        <${kind} name="${xmlEscape(entry.name || kind)}">`, poseXml(entry.pose, '          '), geometryXml(entry.geometry, '          '));
        if (kind === 'visual' && entry.color) lines.push(`          <material><diffuse>${format(entry.color)}</diffuse></material>`);
        lines.push(`        </${kind}>`);
      }
      lines.push('      </link>');
    }
    lines.push('    </model>');
  }
  lines.push('  </world>', '</sdf>');
  return lines.join('\n') + '\n';
}
