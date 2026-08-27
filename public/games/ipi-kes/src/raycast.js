import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, vec, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Raycast extends Entity{
    
    constructor(world, canvas){
        super(world);
        this.click_ray = null;
        this.distance_go_to = 0.23; //How far out to travel off of the click_ray
        this.sample_distance = 0.0008; //How far to go before sampling
        this.add_mouse_position_controller(world, canvas);
    }

    mouse_click_handler(world, canvas, e){
        this.click_ray = this.mouse_position_normalized (world, canvas, e);
        //Update world vars so level can see
        world.user_clicked = true;
        world.locs = this.get_locations(world);
    }

    mouse_position_normalized(world, canvas, e){
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const normalized_x = (2 * x) / (rect.right - rect.left) - 1;
        const normalized_y = 1 - (2 * y) / (rect.bottom - rect.top);
        
        let transform = world.uniforms.projection_transform.times(world.uniforms.camera_inverse);
        transform = Mat4.inverse(transform);
        
        // near/far or from/to trick found here:https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
        let ray_far = transform.times(vec4(normalized_x, normalized_y, 1, 1));
        let ray_near = transform.times(vec4(normalized_x, normalized_y, -1, 1));

        ray_far = ray_far.to3().times(1/ray_far[3]);
        ray_near = ray_near.to3().times(1/ray_near[3]);
        
        return ray_far.minus(ray_near).normalized();
    }

    add_mouse_position_controller (world, canvas) {
		const handler = e => {
			e.preventDefault ();
			const src = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : e;
			this.mouse_click_handler(world, canvas, src);
		};
		canvas.addEventListener ("mousedown", handler);
		canvas.addEventListener ("pointerdown", handler);
		canvas.addEventListener ("touchstart", handler, { passive: false });
	}

    get_locations(world){
        //Get locations to sample for a click
        if(!this.click_ray){
            return []
        }

        const locs = []
        const current_pos = world.camera_eye.copy(); //world.camera_positions[world.camera_num].copy();

        for(let i = 0; i < this.distance_go_to; i += this.sample_distance){
            current_pos.add_by(this.click_ray.times(i));
            locs.push(current_pos.copy());
        }
        return locs;
    }

    render(world) {
        if(!this.click_ray){
            return
        }
        const locs = this.get_locations(world);
        
        for(const loc of locs){
            const transform = Mat4.scale(0.1, 0.1, 0.1)
            transform.pre_multiply(Mat4.translation(...loc));
            world.shapes.ball.draw(world.caller, world.uniforms, transform, world.materials.default);
        }
    }   

    static get_closest_ob(world, entities){
        //Helper function, given a list of entities returns the one that is closest to the camera
        //Assumes entity has a pos
        const cam_loc = world.camera_eye.copy(); //world.camera_positions[world.camera_num];
        let min_dist = 100000;
        let closest_entity = entities[0];
        for(const entity of entities){
            if(entity.pos.minus(cam_loc).norm() < min_dist){
                closest_entity = entity;
                min_dist = entity.pos.minus(cam_loc).normalized
            }
        }
        return closest_entity;
    }


}