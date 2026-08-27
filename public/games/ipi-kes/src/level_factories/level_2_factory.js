import {tiny } from './../../examples/common.js';
const { color } = tiny;

import { Level } from "../level.js";
import { Candy } from "../candy.js";
import { Anchor, MovingAnchor, Spline } from "../anchor.js";
import { Goal } from "../goal.js";
import { Bubble } from "../bubble.js";
import { Fan } from "../fan.js";
import { Block } from "../block.js";

export class Level2Factory {

    static makeLevel(world) {

        let level2 = new Level(world);

        // Gravity
        level2.set_gravity(9.8);
        level2.set_x_bound(-20, 20);
        level2.set_y_bound(-20, 20);
        level2.set_z_bound(-20, 20);
        
        // Candy
        let candy1 = new Candy(world);
        candy1.set_position(0, 5, 0);
        level2.set_candy(candy1);

        // Goal
        let goal1 = new Goal(world);
        goal1.set_position(-8, -4, 0);
        level2.set_goal(goal1);

        // Red Static Anchor
        let anchor1a = new Anchor(world); // red, starts attached
        anchor1a.set_position(0, 6, 0);
        anchor1a.set_anchor_color(color(1, 0, 0, 1));
        anchor1a.set_rope_color(color(1, 0.4, 0.4, 1));
        anchor1a.set_ks(50);
        anchor1a.set_kd(10);
        anchor1a.set_rest_length(1);
        anchor1a.attach_candy();
        level2.add_anchor(anchor1a);

        // Blue Static Anchor
        let anchor1b = new Anchor(world);
        anchor1b.set_position(-4, 0, 0);
        anchor1b.set_anchor_color(color(0, 0, 1, 1));
        anchor1b.set_rope_color(color(0.4, 0.4, 1, 1));
        anchor1b.set_ks(50);
        anchor1b.set_kd(10);
        anchor1b.set_rest_length(3);
        level2.add_anchor(anchor1b);

        let block1 = new Block(world);
        block1.set_position(-2, 4, 0);
        block1.set_rotations(0, 0, -Math.PI/12);
        block1.set_size(3, 0.1, 1);
        level2.add_block(block1);

        let block2 = new Block(world);
        block2.set_position(4, 1, 0);
        block2.set_rotations(0, 0, Math.PI/12);
        block2.set_size(3, 0.1, 1);
        level2.add_block(block2);

        //Walls
        level2.walls.set_level_num(2);

        return level2;
    }
}