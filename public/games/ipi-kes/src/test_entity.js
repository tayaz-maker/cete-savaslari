import {Entity, tiny, defs} from './entity.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Test_Entity extends Entity{
	constructor(world){
		super(world);
		this.angle = 0;
	}
	update(world){
		this.angle += world.timestep;
	}
	render(world){
		var transform = Mat4.identity().times(Mat4.translation(Math.cos(this.angle), Math.sin(this.angle), 0));
		world.shapes.cube.draw(world.caller, world.uniforms, transform, world.materials.default);
	}
}