import {defs} from './examples/common.js';
import {Game_Base, Game} from './src/game.js';
Object.assign(defs, {Game_Base, Game});
const main_scene = Game;
const additional_scenes = [];
export {main_scene, additional_scenes, defs};
