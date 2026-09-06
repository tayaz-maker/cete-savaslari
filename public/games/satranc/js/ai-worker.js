import { chooseMove } from './ai.js?v=2';
self.onmessage = ({ data }) => {
  const result = chooseMove(data.game, data.difficulty, data.seed);
  self.postMessage({ token: data.token, ...result });
};
