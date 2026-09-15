(function (root) {
  "use strict";

  function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min == null ? 0 : min, Math.min(max == null ? 100 : max, finite(value, 0)));
  }

  function remember(actor, memory, limit) {
    if (!actor || !memory || !memory.id) return false;
    actor.memories = Array.isArray(actor.memories) ? actor.memories : [];
    if (actor.memories.some(function (item) { return item.id === memory.id; })) return false;
    actor.memories.push(Object.assign({ turn: 0, weight: 1, tags: [] }, memory));
    actor.memories = actor.memories.slice(-(limit || 12));
    return true;
  }

  function schedule(state, effect) {
    state.delayedEffects = Array.isArray(state.delayedEffects) ? state.delayedEffects : [];
    if (!effect || !effect.id || state.delayedEffects.some(function (item) { return item.id === effect.id; })) return false;
    state.delayedEffects.push(Object.assign({ status: "pending", dueTurn: 1 }, effect));
    return true;
  }

  function settleDue(state, turn, resolver) {
    var settled = [];
    state.delayedEffects = Array.isArray(state.delayedEffects) ? state.delayedEffects : [];
    state.delayedEffects.forEach(function (effect) {
      if (effect.status !== "pending" || finite(effect.dueTurn, Infinity) > turn) return;
      effect.status = "resolving";
      resolver(effect);
      effect.status = "resolved";
      effect.resolvedTurn = turn;
      settled.push(effect.id);
    });
    state.delayedEffects = state.delayedEffects.filter(function (effect) {
      return effect.status === "pending" || turn - finite(effect.resolvedTurn, turn) < 20;
    });
    // Pending effects carry live story state and are never discarded. Resolved
    // effects are only an audit tail; compact that tail during play as well as
    // during migration so a long uninterrupted run cannot inflate its save.
    var pending = state.delayedEffects.filter(function (effect) { return effect.status === "pending"; });
    var resolved = state.delayedEffects.filter(function (effect) { return effect.status !== "pending"; });
    state.delayedEffects = pending.concat(resolved.slice(-Math.max(0, 40 - pending.length)));
    return settled;
  }

  function noteEvent(state, eventId, turn, cooldown) {
    state.eventDirector = state.eventDirector || { history: [], cooldowns: {} };
    state.eventDirector.history = Array.isArray(state.eventDirector.history) ? state.eventDirector.history : [];
    state.eventDirector.cooldowns = state.eventDirector.cooldowns || {};
    state.eventDirector.history.push({ id: eventId, turn: turn });
    state.eventDirector.history = state.eventDirector.history.slice(-40);
    state.eventDirector.cooldowns[eventId] = turn + (cooldown || 3);
  }

  function canShowEvent(state, eventId, turn) {
    var director = state.eventDirector || {};
    return finite((director.cooldowns || {})[eventId], 0) <= turn;
  }

  function riskBand(value) {
    value = clamp(value, 0, 100);
    return value >= 70 ? "Yüksek" : value >= 35 ? "Orta" : "Düşük";
  }

  function dominantIdentity(scores) {
    var entries = Object.keys(scores || {}).map(function (key) { return [key, finite(scores[key], 0)]; });
    entries.sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
    return entries.length && entries[0][1] > 0 ? entries[0][0] : "kontrollü";
  }

  root.TarikLabDepth = {
    clamp: clamp,
    remember: remember,
    schedule: schedule,
    settleDue: settleDue,
    noteEvent: noteEvent,
    canShowEvent: canShowEvent,
    riskBand: riskBand,
    dominantIdentity: dominantIdentity,
  };
})(typeof window !== "undefined" ? window : globalThis);
