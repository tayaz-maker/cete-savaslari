import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Block extends Entity{
		constructor(world) {
			super(world);
	    this.pos = vec3(0, 0, 0); // position
	    this.rotationMatrix = Mat4.identity(); // euler rotation
	    this.size = vec3(1, 1, 1);
		}

		set_rotations(rotx, roty, rotz) {
		    const rotationX = Mat4.rotation(rotx, 1, 0, 0);
		    const rotationY = Mat4.rotation(roty, 0, 1, 0);
		    const rotationZ = Mat4.rotation(rotz, 0, 0, 1);
		    this.rotationMatrix = rotationX.times(rotationY).times(rotationZ);
		}

		set_position(px, py, pz) { this.pos = vec3(px, py, pz); }
		set_size(sx, sy, sz) { this.size = vec3(sx, sy, sz); }

		collide_sphere(center, radius){
			let transform = Mat4.identity();
			transform.pre_multiply(this.rotationMatrix)
			transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));
			let sphere_pos = Mat4.inverse(transform).times(center.to4(1)).to3();

			let c1 = vec3(-this.size[0], -this.size[1], -this.size[2]);
			let c2 = vec3(this.size[0], this.size[1], this.size[2]);

			let closest_dir = vec3(0,0,0);
			let closest_dist = 1000;
			let dist_sq = radius*radius;

			let normal = vec3(0,0,0)

			//console.log(sphere_pos);
			if(sphere_pos[0]+radius > c1[0] && sphere_pos[0]-radius < c2[0]){
				if(sphere_pos[1]+radius > c1[1] && sphere_pos[1]-radius < c2[1]){
					if(sphere_pos[2]+radius > c1[2] && sphere_pos[2]-radius < c2[2]){
						sphere_pos[1] = sphere_pos[1]/this.size[1];
						sphere_pos[1] = sphere_pos[1]/this.size[1];
						sphere_pos[1] = sphere_pos[1]/this.size[1];
						if(Math.abs(sphere_pos[0]) > Math.abs(sphere_pos[1]) && Math.abs(sphere_pos[0]) > Math.abs(sphere_pos[2]))
							normal = vec3(Math.sign(sphere_pos[0]), 0, 0)
						if(Math.abs(sphere_pos[1]) > Math.abs(sphere_pos[0]) && Math.abs(sphere_pos[1]) > Math.abs(sphere_pos[2]))
							normal = vec3(0, Math.sign(sphere_pos[1]), 0)
						if(Math.abs(sphere_pos[2]) > Math.abs(sphere_pos[0]) && Math.abs(sphere_pos[2]) > Math.abs(sphere_pos[1]))
							normal = vec3(0, 0, Math.sign(sphere_pos[1]))
					}
				}
			}
			return this.rotationMatrix.times(normal.to4(0)).to3();

			// if (sphere_pos[0] < c1[0]){
			// 	dist_sq -= (sphere_pos[0] - c1[0])**2;
			// 	if(Math.abs(sphere_pos[0] - c1[0]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[0] - c1[0]);
			// 		closest_dir = vec3(-1,0,0);
			// 	}
			// }
			// else if (sphere_pos[0] > c2[0]){
			// 	dist_sq -= (sphere_pos[0] - c2[0])**2;
			// 	if(Math.abs(sphere_pos[0] - c2[0]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[0] - c2[0]);
			// 		closest_dir = vec3(1,0,0);
			// 	}
			// }
			// if (sphere_pos[1] < c1[1]){
			// 	dist_sq -= (sphere_pos[1] - c1[1])**2;
			// 	if(Math.abs(sphere_pos[1] - c1[1]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[1] - c1[1]);
			// 		closest_dir = vec3(0,-1,0);
			// 	}
			// }
			// else if (sphere_pos[1] > c2[1]){
			// 	dist_sq -= (sphere_pos[1] - c2[1])**2;
			// 	if(Math.abs(sphere_pos[1] - c2[1]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[1] - c2[1]);
			// 		closest_dir = vec3(0,1,0);
			// 	}
			// }
			// if (sphere_pos[2] < c1[2]){
			// 	dist_sq -= (sphere_pos[2] - c1[2])**2;
			// 	if(Math.abs(sphere_pos[2] - c1[2]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[2] - c1[2]);
			// 		closest_dir = vec3(0,0,-1);
			// 	}
			// }
			// else if (sphere_pos[2] > c2[2]){
			// 	dist_sq -= (sphere_pos[2] - c2[2])**2;
			// 	if(Math.abs(sphere_pos[2] - c2[2]) < closest_dist){
			// 		closest_dist = Math.abs(sphere_pos[2] - c2[2]);
			// 		closest_dir = vec3(0,0,1);
			// 	}
			// }

			// if (dist_sq > 0)
			// 	return transform.times(closest_dir.to4(0));
			// else
			// 	return vec3(0,0,0);
		}

		render(world){
			let transform = Mat4.scale(this.size[0], this.size[1], this.size[2]);
      transform.pre_multiply(this.rotationMatrix)
			transform.pre_multiply(Mat4.translation(this.pos[0], this.pos[1], this.pos[2]));

			world.shapes.cube.draw(world.caller, world.uniforms, transform, world.materials.default);
		}
}