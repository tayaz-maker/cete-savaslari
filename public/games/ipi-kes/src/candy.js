import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Candy extends Entity{
	constructor(world) {
		super(world);
		this.mass = 2.0;
        this.radius = 0.5;

        this.click_radius = this.radius; //For raycasting

        this.pos = vec3(0, 0, 0); // position
        this.vel = vec3(0, 0, 0); // velocity
        this.acc = vec3(0, 0, 0); // acceleration
        this.ext_force = vec3(0, 0, 0); // total external force

        this.is_bubbled = false;
	}

    get_mass() { return this.mass; }
    get_radius() { return this.radius; }
    get_position() { return this.pos; }
    get_velocity() { return this.vel; }
    get_acceleration() { return this.acc; }
    get_ext_force() { return this.ext_force; }
    get_is_bubbled() { return this.is_bubbled; }

    set_mass(m) { this.mass = m; }
    set_radius(r) { this.radius = r; }
    set_position(px, py, pz) { this.pos = vec3(px, py, pz); }
    set_velocity(vx, vy, vz) { this.vel = vec3(vx, vy, vz); }
    set_acceleration(ax, ay, az) { this.acc = vec3(ax, ay, az); }
    set_ext_force(fx, fy, fz) { this.ext_force = vec3(fx, fy, fz); }
    set_is_bubbled(is_bubbled) { this.is_bubbled = is_bubbled; }

    add_ext_force(fx, fy, fz) { this.ext_force = this.ext_force.plus(vec3(fx, fy, fz)); }

	update(world) {
        if (this.is_bubbled) {
            this.add_ext_force(0, 1, 0);
        }

        for (const b of world.level.blocks){
            let normal = b.collide_sphere(this.pos, this.radius);
            if(!normal.equals(vec3(0,0,0))){
                let repulsion = normal.times(this.vel.norm()*100);
                this.add_ext_force(repulsion[0],repulsion[1],repulsion[2]);
                this.set_ext_force(this.ext_force[0]*0.3,this.ext_force[1]*0.3,this.ext_force[2]*0.3); //absorb velocity
            }
        }

        //Simulate small amount of air resistance
        this.vel.scale_by(0.999);

        // Symplectic Euler Integration
		let new_p_vel = this.vel.plus(this.ext_force.times(world.timestep/this.mass));
        let new_p_pos = this.pos.plus(new_p_vel.times(world.timestep));

        this.pos = new_p_pos;
        this.vel = new_p_vel;
	}

    clicked_on(world){
        this.set_is_bubbled(false);
    }

	render(world) {
        let transform = Mat4.scale(this.radius, this.radius, this.radius);
        transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

        world.shapes.candy.draw(world.caller, world.uniforms, transform, world.materials.candy);

        if (this.is_bubbled) {
            transform = Mat4.scale(1, 1, 1);
            transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

            world.shapes.ball.draw(world.caller, world.uniforms, transform, world.materials.bubble );
        }
	}
}