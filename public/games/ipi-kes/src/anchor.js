import {Entity, tiny, defs} from './entity.js';
import {Spline, Curve_Shape} from './spline.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Anchor extends Entity{
	constructor(world) {
		super(world);

        this.anchor_color = color( 0,0,1,1 ); // default blue
        this.rope_color = color( 1,0,0,1 );   // default red

        this.pos = vec3(0, 0, 0); // position
        this.ks = 0;  // spring constant
        this.kd = 0;  // damper constant
        this.rest_length = 0;

        this.is_attached = false; // True if the candy is attached to the anchor point with a rope
        this.can_attach = true; // True if a candy can attach if it comes within the rest_length of the anchor point

        this.scale = 0.2;
        this.click_radius = this.scale * 1.5;

        // Should the rope stuff be its own class?
	}

    get_position() { return this.pos; }
    get_ks() { return this.ks; }
    get_kd() { return this.kd; }
    get_rest_length() { return this.rest_len; }
    get_is_attached() { return this.is_attached; }
    get_can_attach() { return this.can_attach; }

    set_anchor_color(color) { this.anchor_color = color; }
    set_rope_color(color) { this.rope_color = color; }
    set_position(px, py, pz) { this.pos = vec3(px, py, pz); }
    set_ks(ks) { this.ks = ks; }
    set_kd(kd) { this.kd = kd; }
    set_rest_length(l) { this.rest_length = l; }

    attach_candy() { this.is_attached = true; this.can_attach = false; }
    remove_candy() { this.is_attached = false; }

	update(world, candy) {
        // Apply rope (spring) forces on candy
        if (this.is_attached) {
            const anchor_pos = this.pos;
            const candy_pos = candy.pos;
            const candy_vel = candy.vel;

            let d = anchor_pos.minus(candy_pos);
            let d_len = d.norm();
            let d_unit = d.times(1/d_len);
            let v = vec3(0, 0, 0).minus(candy_vel);

            const f_s = d_unit.times(this.ks * (d_len - this.rest_length));
            const f_d = d_unit.times(-this.kd * v.dot(d_unit));
            const f_e = f_s.minus(f_d);
            candy.add_ext_force(f_e[0], f_e[1], f_e[2]);
        }
        
        // Attach a rope if candy comes within radius
        else if (this.can_attach) {
            const candy_pos = candy.get_position();
            const candy_rad = candy.get_radius();
            const anchor_pos = this.pos;
            const anchor_rad = this.rest_length;

            const dist = candy_pos.minus(anchor_pos).norm();
            const rad_sum = candy_rad + anchor_rad;

            if (dist < rad_sum) {
                this.is_attached = true;
                this.can_attach = false;
            }
        }
	}

	render(world, candy) {
        // Draw anchor point
        let anchor_transform = Mat4.scale(this.scale, this.scale, this.scale);
        anchor_transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));
        // Set color to grey if anchor is not attached or can be attached
        let anchor_color = ((this.is_attached || this.can_attach) ? this.anchor_color : color( .3,.3,.3,1 ));

        world.shapes.ball.draw(world.caller, world.uniforms, anchor_transform, {...world.materials.anchor, color: anchor_color} );

        // Draw attach radius indicator
        if (this.can_attach) {
            let anchor_rad = this.rest_length;
            let att_transform = Mat4.scale(anchor_rad, anchor_rad, anchor_rad);
            att_transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

            world.shapes.ball.draw(world.caller, world.uniforms, att_transform, world.materials.transparent);
        }

        // Draw rope
        if (this.is_attached) {
            const anchor_pos = this.pos;
            const candy_pos = candy.pos;
            const len = (candy_pos.minus(anchor_pos)).norm();
            const center = (anchor_pos.plus(candy_pos)).times(0.5);

            let spring_transform = Mat4.scale(0.05, len/2, 0.05);
            const p = anchor_pos.minus(candy_pos).normalized();
            let v = vec3(0, 1, 0);
            if (Math.abs(v.cross(p).norm()) < 0.1) {
                v = vec3(0, 0, 1);
                spring_transform = Mat4.scale(0.05, 0.05, len/2);
            }
            const w = v.cross(p).normalized();

            const theta = Math.acos(v.dot(p));
            spring_transform.pre_multiply(Mat4.rotation(theta, w[0], w[1], w[2]));
            spring_transform.pre_multiply(Mat4.translation(center[0], center[1], center[2]));

            world.shapes.cylinder.draw(world.caller, world.uniforms, spring_transform, {...world.materials.rope, color: this.rope_color} );
        }
	}

    clicked_on(world){
        this.remove_candy();
    }
}

export class MovingAnchor extends Anchor {
    constructor(world) {
        super(world);

        this.period=10;
        this.spline = null;
        this.curve = null;
    }

    set_period(period) { this.period = period; }

    set_spline(spline) {
        this.spline = spline;

        this.curve_fn =
          (t) => this.spline.get_position(t);
        this.sample_cnt = 100;
    
        this.curve = new Curve_Shape(this.curve_fn, this.sample_cnt);
    }

    set_anchor_color(color) { 
        super.set_anchor_color(color);
        
        if (this.curve) { this.curve.changecolor(color); }
    }

    update(world, candy) {
        if (this.spline) {
            let c_t = (-Math.cos(world.sim_time * Math.PI / this.period) + 1) / 2; // sinusoidal motion
            this.pos = this.spline.get_position(c_t);
        }

        super.update(world, candy);
    }

    render(world, candy) {
        super.render(world, candy);

        if (this.curve) { this.curve.draw(world.caller, world.uniforms); }
    }
}

export {Spline};