/** Owns Worker lifetime. A terminated generation can never commit a result. */
export class Opponent {
  constructor(makeWorker) { this.makeWorker = makeWorker; this.token = 0; this.worker = null; }
  cancel() { this.token++; this.worker?.terminate(); this.worker = null; }
  start(game, difficulty, seed, accept, fail) {
    this.cancel();
    const token = this.token;
    try {
      const worker = this.makeWorker();
      this.worker = worker;
      worker.onmessage = ({ data }) => {
        if (this.token !== token || data.token !== token) return;
        this.cancel();
        accept(data);
      };
      worker.onerror = () => { if (this.token === token) { this.cancel(); fail(); } };
      worker.postMessage({ token, game: structuredClone(game), difficulty, seed });
    } catch { this.cancel(); fail(); }
  }
}
