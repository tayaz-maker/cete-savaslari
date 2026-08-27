import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Bubble extends Entity{
	constructor(world) {
		super(world);
        this.radius = 1.0;
        this.pos = vec3(0, 0, 0); // position

        this.is_active = true;
	}

    get_radius() { return this.radius; }
    get_position() { return this.pos; }

    set_radius(r) { this.radius = r; }
    set_position(px, py, pz) { this.pos = vec3(px, py, pz); }

	update(world, candy) {
        if (this.is_active) {
            const candy_pos = candy.get_position();
            const candy_rad = candy.get_radius();
            const bubble_pos = this.pos;
            const bubble_rad = this.radius;

            const dist = candy_pos.minus(bubble_pos).norm();
            const rad_sum = candy_rad + bubble_rad;

            if (dist < rad_sum) {
                let v = candy.get_velocity().times(0.1); // Greatly slow down the candy
                candy.set_velocity(v[0], v[1], v[2]);
                candy.set_is_bubbled(true);
                this.is_active = false;
            }
        }
	}

	render(world) {
        if (this.is_active) {
            let transform = Mat4.scale(this.radius, this.radius, this.radius);
            transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

            world.shapes.ball.draw(world.caller, world.uniforms, transform, world.materials.bubble);
        }
	}
}