import { candidates } from './selection.js';
import { definition, locate } from './model.js';

// Target contracts are declarative and shared by validation, highlighting and
// AI enumeration. The command includes exact instance IDs, not mutable indices.
export function targetOptions(state, player, source) {
  const def = definition(state, source);
  return (def.targets || []).map(selector => ({ ...selector, ids: candidates(state, player, selector) }));
}
export function validateTargets(state, action) {
  const groups = targetOptions(state, action.player, action.card), supplied = action.targets || [];
  let offset = 0;
  for (const group of groups) {
    const count = group.count || 1, ids = supplied.slice(offset, offset + count);
    if (ids.length !== count || new Set(ids).size !== count || ids.some(uid => !group.ids.includes(uid))) return 'legal-target-required';
    offset += count;
  }
  if (offset !== supplied.length) return 'unexpected-target';
  return null;
}
export function targetStillExists(state, uid, allowed) {
  const at = locate(state, uid);
  return at && (!allowed || allowed.includes(at.zone));
}
