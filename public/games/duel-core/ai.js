// Accept only the public projection and engine-approved commands. No imported
// engine, PRNG, raw state, deck order, or enemy hand access exists here.
export function chooseAction(view, actions) {
  let best = null,
    score = -Infinity;
  const opponent = view.players[1 - view.viewer];
  for (const action of actions) {
    const card = view.cards[action.card],
      target = view.cards[action.target];
    let value = -1000;
    if (action.type === "phase") value = 0;
    if (action.type === "end-main") value = -1;
    if (action.type === "pass") value = 1;
    if (action.type === "choose") value = 100;
    if (action.type === "respond") value = 250;
    if (action.type === "discard") value = 50 - ((card?.attack || 0) + (card?.defense || 0)) / 100;
    if (action.type === "summon")
      value =
        100 +
        card.attack / 100 -
        (action.tributes || []).reduce((sum, uid) => sum + (view.cards[uid]?.attack || 0) / 100, 0);
    if (action.type === "special")
      value =
        105 +
        (card?.attack || 0) / 100 -
        (action.materials || []).reduce(
          (sum, uid) => sum + (view.cards[uid]?.attack || 0) / 100,
          0,
        );
    if (action.type === "set-unit")
      value = 95 + card.defense / 100 - (action.tributes || []).length * 20;
    if (action.type === "set-support")
      value = card.kind === "trap" || card.subtype === "quick" ? 60 : -20;
    if (action.type === "activate") value = 80;
    if (action.type === "position")
      value =
        card.face === "down" || (card.position === "defense" && card.attack > card.defense)
          ? 25
          : -20;
    if (action.type === "attack") {
      if (!action.target) value = card.attack >= opponent.points ? 10000 : 200 + card.attack / 100;
      else {
        const enemy =
          target?.face === "down"
            ? 1200
            : target?.position === "defense"
              ? target.defense
              : target.attack;
        value = card.attack >= enemy ? 150 + (card.attack - enemy) / 100 : -50;
        if (target?.position === "attack" && card.attack - enemy >= opponent.points) value = 10000;
      }
    }
    if (value > score) {
      score = value;
      best = action;
    }
  }
  return best;
}
