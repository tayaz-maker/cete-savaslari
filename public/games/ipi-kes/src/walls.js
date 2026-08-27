import {Entity, tiny} from './entity.js';
import { defs} from './../examples/common.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;


export class Walls extends Entity{
	constructor(world, level_num=0){
		super(world);
		this.level_num = level_num;
        
		const tex_phong = new defs.Textured_Phong();
		const wall_text1 = {
			shader: tex_phong,
			ambient: 0.5,
			texture: new Texture("assets/bgr_1.jpeg"),
		};

		const wall_text2 = {
			shader: tex_phong,
			ambient: 0.5,
			texture: new Texture("assets/bgr_2.jpeg"),
		};

		const wall_text3 = {
			shader: tex_phong,
			ambient: 0.5,
			texture: new Texture("assets/bgr_3.jpeg"),
		};

		const wall_text4 = {
			shader: tex_phong,
			ambient: 0.5,
			texture: new Texture("assets/bgr_4.jpeg"),
		};

		const wall_text5 = {
			shader: tex_phong,
			ambient: 0.5,
			texture: new Texture("assets/bgr_5.jpeg"),
		};

		this.wall_textures = [wall_text1, wall_text2, wall_text3, wall_text4, wall_text5];
    }

	update(world){}

	set_level_num(level_num){
		this.level_num = level_num;
	}

	render(world){ //runs as fast as possible
        let wall_text = this.wall_textures[this.level_num - 1]

        // Draw the ground
		let ground_transform = Mat4.identity();
		ground_transform.pre_multiply(Mat4.rotation(Math.PI/2,1,0,0));
		ground_transform.pre_multiply(Mat4.scale(17,17,17));
		ground_transform.pre_multiply(Mat4.translation(0,-10,0));
		world.shapes.plane.draw(world.caller, world.uniforms, ground_transform, {... wall_text, color: color( 0,0,0 ,1 )} );

		// Draw the ceiling
		let ceiling_transform = Mat4.identity();
		ceiling_transform.pre_multiply(Mat4.rotation(Math.PI/2,1,0,0));
		ceiling_transform.pre_multiply(Mat4.scale(17,17,17));
		ceiling_transform.pre_multiply(Mat4.translation(0,10,0));
		world.shapes.plane.draw(world.caller, world.uniforms, ceiling_transform, {... wall_text, color: color( 0,0,0 ,1 )} );
		
		// Draw the walls
		const wall_transform1 = Mat4.identity();
		wall_transform1.pre_multiply(Mat4.scale(17,10,1));
		wall_transform1.pre_multiply(Mat4.translation(0,0,17));
		world.shapes.plane.draw(world.caller, world.uniforms, wall_transform1, {... wall_text, color: color(0,0, 0, 1)} );
		
		const wall_transform2 = Mat4.identity();
		wall_transform2.pre_multiply(Mat4.rotation(Math.PI/2,0,1,0));
		wall_transform2.pre_multiply(Mat4.scale(1,10,17));
		wall_transform2.pre_multiply(Mat4.translation(17,0,0));
		world.shapes.plane.draw(world.caller, world.uniforms, wall_transform2, {... wall_text, color: color(0,0, 0, 1)} );
		
		const wall_transform3 = Mat4.identity();
		wall_transform3.pre_multiply(Mat4.scale(17,10,1));
		wall_transform3.pre_multiply(Mat4.translation(0,0,-17));
		world.shapes.plane.draw(world.caller, world.uniforms, wall_transform3, { ...wall_text, color: color(0,0, 0, 1)});

		const wall_transform4 = Mat4.identity();
		wall_transform4.pre_multiply(Mat4.rotation(Math.PI/2,0,1,0));
		wall_transform4.pre_multiply(Mat4.scale(1,10,17));
		wall_transform4.pre_multiply(Mat4.translation(-17,0,0));
		world.shapes.plane.draw(world.caller, world.uniforms, wall_transform4, {... wall_text, color: color(0,0, 0, 1)} );

	}
}