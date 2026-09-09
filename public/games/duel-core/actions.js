import { rejection, responseCards } from './rules.js';
import { definition } from './model.js';
import { targetOptions } from './targeting.js';
import { specialPlans, ritualPlans } from './summoning.js';

function combinations(values, count) {
  if (!count) return [[]];
  return values.flatMap((value, i) => combinations(values.slice(i + 1), count - 1).map(rest => [value, ...rest]));
}
export function legalActions(state, player) {
  if (state.result) return [];
  const command = action => ({ ...action, player, revision: state.revision });
  if (state.choice) return state.choice.player !== player ? [] : state.choice.kind==='option' ? state.choice.options.map(o=>command({type:'choose',option:o.id})) : combinations(state.choice.ids, state.choice.count).map(targets => command({type:'choose',targets}));
  if (state.pending) return state.pending.responding !== player ? [] :
    [command({type:'pass'}), ...responseCards(state).map(card => command({type:'respond',card}))];
  if (player !== state.active) return [];
  const p = state.players[player], candidates = [command({type:'phase'})];
  if(['main1','main2'].includes(state.phase))for(const plan of [...specialPlans(state,player),...ritualPlans(state,player)])candidates.push(command({type:'special',...plan}));
  for (const card of p.hand) {
    const def = definition(state, card);
    candidates.push(command({type:'discard',card}), command({type:'activate',card}));
    if (def.kind === 'unit') {
      const n = def.level >= 7 ? 2 : def.level >= 5 ? 1 : 0;
      const alternate=def.traits?.tributeAlternative;
      const costs=[...combinations(p.units.filter(Boolean),n),...(alternate?combinations(p[alternate.zone].filter(uid=>definition(state,uid).kind===alternate.kind),alternate.count):[])];
      for (const tributes of costs) for (let slot = 0; slot < 5; slot++) {
        candidates.push(command({type:'summon',card,slot,tributes}), command({type:'set-unit',card,slot,tributes}));
      }
    } else for (let slot = 0; slot < 5; slot++) candidates.push(command({type:'set-support',card,slot}));
  }
  for (const card of [...p.units, ...p.support].filter(Boolean)) {
    candidates.push(command({type:'activate',card}), command({type:'position',card}));
    for (const target of [null, ...state.players[1-player].units.filter(Boolean)]) candidates.push(command({type:'attack',card,target}));
  }
  const expanded = candidates.flatMap(action => {
    if (action.type !== 'activate') return [action];
    let variants = [{ ...action, targets: [] }];
    for (const group of targetOptions(state, player, action.card)) {
      variants = variants.flatMap(a => combinations(group.ids, group.count || 1).map(ids => ({...a,targets:[...a.targets,...ids]})));
    }
    return variants;
  });
  return expanded.filter(action => !rejection(state, action));
}
