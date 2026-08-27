import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Fan extends Entity{
	constructor(world) {
		super(world);

        // Physical attributes
        this.pos = vec3(0, 0, 0); // Position
        this.scale = 0.6; // Scale of obj
        this.click_radius = this.scale; //For raycasting
        this.rotationMatrix = Mat4.identity(); // Rotation matrix
        
        // Force effecting values
        this.direction = vec3(-1,0,0); // Direction fan faces, unit vector, updated based on rotations, should not be changed manually
        this.max_force = 30; // Scaling factor of the force to apply on candy
        this.effective_angle = Math.PI / 6; //Angle that the candy must be in for the fan to apply force
        
        // Time related values
        this.triggered = false; // Is the fan current going?
        this.triggered_at = 0; // Time the fan was last triggered at
        this.force_lifespan = 1; // How long should the fan last
        this.ease_out_value = 0; // Value ranging from 1 to 0 based on duration left for fan

        // Air ball related values
        this.air_balls = [];
        this.gen_air_ball_prob = 0.1;
	}
    
    set_rotations(rotx, roty, rotz) {
        const rotationX = Mat4.rotation(rotx, 1, 0, 0);
        const rotationY = Mat4.rotation(roty, 0, 1, 0);
        const rotationZ = Mat4.rotation(rotz, 0, 0, 1);
        this.rotationMatrix = rotationX.times(rotationY).times(rotationZ);

        this.direction = this.rotationMatrix.times(this.direction.to4(false)).to3().normalized();
    }

    set_position(px, py, pz) { this.pos = vec3(px, py, pz); }

	update(world, candy) {
        
         if(this.triggered){
            const time_passed = world.sim_time - this.triggered_at;

            //Check if time for applying force is over
            if(time_passed >= this.force_lifespan){
                this.triggered = false;
                this.cleanup_air_balls();
            }
            else{

                // Handle Air Balls
                this.remove_expired_air_balls();
                for(const air_ball of this.air_balls){
                    air_ball.update(world);
                } 

                // Magnitude of force based on an ease out function, goes from 1 to 0
                this.ease_out_value = Math.cos((time_passed * Math.PI) / (2 * this.force_lifespan));
                const time_adjusted_force_mag = this.max_force * this.ease_out_value;
                
                // Vector to candy, and the dot of that with the fans current direction
                const vec_to_candy = candy.pos.minus(this.pos);
                const distance_penalty = Math.max((vec_to_candy.norm()/4) ** 2, 1);

                vec_to_candy.normalize()
                const dot_of_vecs = this.direction.dot(vec_to_candy);
                
                // Apply force if within angle cone 
                if(Math.acos(dot_of_vecs) <= this.effective_angle){
                    const dist_adjusted_force_mag = time_adjusted_force_mag / (distance_penalty ** 2);
                    const force_to_apply = vec_to_candy.times(dist_adjusted_force_mag * dot_of_vecs);
                    candy.add_ext_force(force_to_apply[0], force_to_apply[1], force_to_apply[2]);
                }
            }            
        }
	}

    generate_air_balls(world){
        
        for(let i = 0; i < 40; i++){
            this.air_balls.push(new AirBall(world, this));
        }
    }
    
    remove_expired_air_balls (){
        this.air_balls = this.air_balls.filter(air_ball => air_ball.should_exist);
    }
    
    cleanup_air_balls () {
        this.air_balls = [];
    }

    trigger(world, sim_time) {
        this.triggered = true;
        this.triggered_at = sim_time;
        this.generate_air_balls(world);
    }

    clicked_on(world){
        this.trigger(world, world.sim_time);
    }

	render(world) {
        let transform = Mat4.scale(this.scale, this.scale, this.scale);
        transform.pre_multiply(this.rotationMatrix)
        transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));
        world.shapes.fan.draw(world.caller, world.uniforms, transform, world.materials.fan);

        for(const air_ball of this.air_balls){
            air_ball.render(world);
        }
    }
      
}

class AirBall extends Entity {
    constructor(world, fan){
        super(world);

        // Physical Properties
        this.pos = fan.pos.plus(fan.direction.times(fan.scale));
        this.max_radius = 0.05;
        this.radius = this.max_radius;

        // Velocity related properties
        this.velocity_mag = getRandomFloat(10,20);
        this.vel = this.get_initial_velocity(fan)
        
        // Time related properties
        this.lifespan = 0.6; // Time airball will last
        this.created_at = world.sim_time;
        this.should_exist = true; //Will serve as a flag for the corresponding fan to delete this airball
        this.ease_out_value = 0; // Value ranging from 1 to 0 based on duration left for fan
	}
    
    get_initial_velocity(fan){
        //Citation for getting the initial angle: https://gamedev.stackexchange.com/questions/26789/random-vector-within-a-cone
        const theta = getRandomFloat(0, fan.effective_angle);
        const phi = getRandomFloat(0, 2 * Math.PI);

        const temp = vec3(Math.cos(phi) * Math.sin(theta), Math.sin(phi) * Math.sin(theta), Math.cos(theta));

        let transform = Mat4.identity();
        transform.pre_multiply(Mat4.rotation(-Math.PI/2, 0,1,0));
        transform.pre_multiply(fan.rotationMatrix)
        transform.pre_multiply(Mat4.translation(fan.pos[0], fan.pos[1], fan.pos[2]));
        const random_vec = transform.times(temp);
        return random_vec.times(this.velocity_mag);
    }

	update(world){ //runs at a fixed timestep

        const time_passed = world.sim_time - this.created_at;

        if(time_passed >= this.lifespan){
            this.should_exist = false;
        }

        // Update position
        let new_p_pos = this.pos.plus(this.vel.times(world.timestep));
        this.pos = new_p_pos;

        // Radius eases out to 0
        this.radius = this.max_radius * Math.cos((time_passed * Math.PI) / (2 * this.lifespan));
        //Potential TODO: also make the opacity ease out

	}

	render(world){
        let transform = Mat4.scale(this.radius, this.radius, this.radius);
        transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

        world.shapes.ball.draw(world.caller, world.uniforms, transform, world.materials.airBall);
	}
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min);
}