import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Goal extends Entity{
	constructor(world) {
		super(world);
        this.radius = 0.8;
        this.pos = vec3(0, 0, 0); // position
	}

    get_radius() { return this.radius; }
    get_position() { return this.pos; }

    set_radius(r) { this.radius = r; }
    set_position(px, py, pz) { this.pos = vec3(px, py, pz); }

	update(world, candy) {
        const candy_pos = candy.get_position();
        const candy_rad = candy.get_radius();
        const goal_pos = this.pos;
        const goal_rad = this.radius;

        const dist = candy_pos.minus(goal_pos).norm();
        const rad_sum = candy_rad + goal_rad;

        if (dist < rad_sum) {
                        this.radius = 1.0;
            world.status = "LEVEL_COMPLETE";
        }
	}

	render(world) {
        let transform = Mat4.scale(this.radius, this.radius, this.radius);
        transform.pre_multiply(Mat4.scale(0.7, 0.7, 0.7)); // Scale to match the radius ball closer
        transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));
        world.shapes.eater.draw(world.caller, world.uniforms, transform, world.materials.goal);
        
        //Uncomment for debugging, can see the hit box ball
        // let hit_box_ball_transform = Mat4.scale(this.radius, this.radius, this.radius);
        // hit_box_ball_transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));
        // world.shapes.ball.draw(world.caller, world.uniforms, hit_box_ball_transform, world.materials.default)
	}
}