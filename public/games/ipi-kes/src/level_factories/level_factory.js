import {tiny } from './../../examples/common.js';
const { Mat4,  } = tiny;

import { Level1Factory } from "./level_1_factory.js";
import { Level2Factory } from "./level_2_factory.js";
import { Level3Factory } from "./level_3_factory.js";

export class LevelFactory {

    static makeLevel(world) {
        // Returns a configured level
        throw "LevelFactory is abstract";
  }
}

export class AnyLevelFactory {
  
  static levelFactories = [Level1Factory, Level2Factory, Level3Factory];
  
  static makeLevel(world, num){
    if(num > this.levelFactories.length){
      return new endScreen();
    }

    return this.levelFactories[num - 1].makeLevel(world);
  }
}

class endScreen {
  update(world){}

  render(world){
    world.shapes.plane.draw(world.caller, world.uniforms, Mat4.identity(), world.materials.winImage);
  }
}