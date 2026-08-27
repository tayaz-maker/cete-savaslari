import {tiny } from '../../examples/common.js';
const { color } = tiny;

import { Level } from "../level.js";
import { Candy } from "../candy.js";
import { Anchor, MovingAnchor, Spline } from "../anchor.js";
import { Goal } from "../goal.js";
import { Bubble } from "../bubble.js";
import { Fan } from "../fan.js";
import { Block } from "../block.js";

export class Level3Factory {

    static makeLevel(world) {

        let level3 = new Level(world);

        // Gravity
        level3.set_gravity(9.8);
        level3.set_x_bound(-20, 20);
        level3.set_y_bound(-20, 20);
        level3.set_z_bound(-20, 20);
        
        // Candy
        let candy1 = new Candy(world);
        candy1.set_position(-6, -6, 3);
        level3.set_candy(candy1);

        // Goal
        let goal1 = new Goal(world);
        goal1.set_position(6, 0.8, 0);
        level3.set_goal(goal1);

        // Red Static Anchor
        let anchor1a = new Anchor(world); // red, starts attached
        anchor1a.set_position(-6, -2, 3);
        anchor1a.set_anchor_color(color(1, 0, 0, 1));
        anchor1a.set_rope_color(color(1, 0.4, 0.4, 1));
        anchor1a.set_ks(20);
        anchor1a.set_kd(10);
        anchor1a.set_rest_length(1);
        anchor1a.attach_candy();
        level3.add_anchor(anchor1a);

        // Blue Static Anchor
        let anchor1b = new Anchor(world); // red, starts attached
        anchor1b.set_position(-2, 0, 0);
        anchor1b.set_anchor_color(color(0, 0, 1, 1));
        anchor1b.set_rope_color(color(0.4, 0.4, 1, 1));
        anchor1b.set_ks(50);
        anchor1b.set_kd(10);
        anchor1b.set_rest_length(3);
        level3.add_anchor(anchor1b);

        //Fans
        let fan1 = new Fan(world);
        fan1.set_position(-7.6, -5.6, 4);
        fan1.set_rotations(0, 6/5 * Math.PI, -Math.PI/4);
        level3.add_fan(fan1);

        let fan2 = new Fan(world);
        fan2.set_position(-2, -3, 5);
        fan2.set_rotations(0, -1/2 * Math.PI, 0);
        level3.add_fan(fan2);

        let fan3 = new Fan(world);
        fan3.set_position(-6, 2, 0);
        fan3.set_rotations(0, Math.PI, 0);
        level3.add_fan(fan3);


        // Bubble
        let bubble1 = new Bubble(world); 
        bubble1.set_position(-2, -2, -4);
        level3.add_prop(bubble1);

        let block1 = new Block(world);
        block1.set_position(3.5, 0.5, 0);
        block1.set_rotations(0, 0, -Math.PI/12);
        block1.set_size(3, 0.1, 1);
        level3.add_block(block1);

        //Walls
        level3.walls.set_level_num(3);

        return level3;
    }
}