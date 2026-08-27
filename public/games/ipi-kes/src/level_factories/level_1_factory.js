import {tiny } from './../../examples/common.js';
const { color } = tiny;

import { Level } from "../level.js";
import { Candy } from "../candy.js";
import { Anchor, MovingAnchor, Spline } from "../anchor.js";
import { Goal } from "../goal.js";
import { Bubble } from "../bubble.js";
import { Fan } from "../fan.js";
import { Block } from "../block.js";

export class Level1Factory {

    static makeLevel(world) {

        let level1 = new Level(world);
        
        // Candy
        let candy1 = new Candy(world);
        candy1.set_position(0, 3, 2);
        level1.set_candy(candy1);
        
        // Anchors
        //--------

        // Red Static Anchor
        let anchor1a = new Anchor(world); // red, starts attached
        anchor1a.set_position(3, 3, 3);
        anchor1a.set_anchor_color(color(1, 0, 0, 1));
        anchor1a.set_rope_color(color(1, 0.4, 0.4, 1));
        anchor1a.set_ks(50);
        anchor1a.set_kd(10);
        anchor1a.set_rest_length(3);
        anchor1a.attach_candy();
        level1.add_anchor(anchor1a);

        // Blue Static Anchor
        let anchor1b = new Anchor(world); // blue, starts attached
        anchor1b.set_position(-3, 2, 1);
        anchor1b.set_anchor_color(color(0, 0, 1, 1));
        anchor1b.set_rope_color(color(0.4, 0.4, 1, 1));
        anchor1b.set_ks(50);
        anchor1b.set_kd(10);
        anchor1b.set_rest_length(4);
        anchor1b.attach_candy();
        level1.add_anchor(anchor1b);
       
        // Green Moving Anchor
		let anchor1c = new MovingAnchor(this); // green, starts unattached
		// Green Spline Settings
        let spline1c = new Spline();
        spline1c.add_point(0, -3, 2, -1, 0, 0); // SPLINE is implemented using Hermite atm
        spline1c.add_point(-4, -3, 2, -0., -0.7, 0.2); // Maybe update it to Catmull ROM so we dont have to specify tangents
        spline1c.add_point(-5, -5, 3, 1, 0, 0);
		anchor1c.set_spline(spline1c);
		anchor1c.set_period(10);
        anchor1c.set_anchor_color(color(0, 1, 0, 1));
        anchor1c.set_rope_color(color(0.4, 1, 0.4, 1));
        anchor1c.set_ks(50);
        anchor1c.set_kd(10);
        anchor1c.set_rest_length(2);
        level1.add_anchor(anchor1c);
        
        // Goal
        let goal1 = new Goal(world);
        goal1.set_position(3, -4, 4);
        level1.set_goal(goal1);
        
        // Other Props
        let bubble1 = new Bubble(world); // bubble, starts below red anchor
        bubble1.set_position(3, 0, 3);
        level1.add_prop(bubble1);
        
        //Fans
        let fan1 = new Fan(world);
        fan1.set_position(1, 2, -2);
        fan1.set_rotations(0, Math.PI / 2, Math.PI / 4);
        level1.add_fan(fan1);
        
        // Gravity
        level1.set_gravity(9.8);
        level1.set_x_bound(-20, 20);
        level1.set_y_bound(-20, 20);
        level1.set_z_bound(-20, 20);

        // Walls
        level1.walls.set_level_num(1);

        return level1;
    }
}
