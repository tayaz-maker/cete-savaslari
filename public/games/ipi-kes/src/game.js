import {tiny, defs} from './../examples/common.js';
import { AnyLevelFactory } from './level_factories/level_factory.js';
import { Raycast } from './raycast.js'

import { Shape_From_File } from '../examples/obj-file-demo.js';
const { vec3, vec4, vec, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const Game_Base = defs.Game_Base = 
class Game_Base extends Component{
	init(){
		this.shapes = {
			'cube' : new defs.Cube(),
			'plane' : new defs.Square(),
			'ball' : new defs.Subdivision_Sphere(4),
			'cylinder' : new defs.Rounded_Capped_Cylinder(20, 10),
			'eater' : new defs.Subdivision_Sphere(4),
      		'candy' : new defs.Subdivision_Sphere(4),
      		'fan' : new Shape_From_File("./assets/fan.obj")
		};

		const phong = new defs.Phong_Shader();
		const endScreen = new defs.endScreen();

		this.materials = {};
		this.materials.default = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.9,.9,1 )}
		this.materials.candy = { shader: phong, ambient: .2, diffusivity: 1, specularity: 1, color: color( 1.,.6,0.,1 )}
		this.materials.anchor = { shader: phong, ambient: .2, diffusivity: 1, specularity: 1, color: color( 0.,0.,1.,1 )}
		this.materials.rope = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 1.,0.,0.,1 )}
		this.materials.goal = { shader: phong, ambient: 0.4, diffusivity: 1, specularity: 0.2, color: color( .2,.8,.2,1 )}
		this.materials.transparent = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 1,1,1,.5 )}
		this.materials.bubble = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .6,.8,.9,.3 )}
    	this.materials.fan = {shader: phong, ambient: 0.3, diffusivity: 1, specularity: 0.5, color: color(0.2, 0.55, 0.66, 1)};
    	this.materials.airBall = {shader: phong, ambient: 0.2, diffusivity: 1,specularity: 0.5,color: color(1, 1, 1, 1)};
		this.materials.winImage = {shader: endScreen, ambient : 1, specularity: 0.1, diffusivity: 0.1, color: color(0.0,0.0,0,1), texture: new Texture("assets/win-page.png","LINEAR_MIPMAP_LINEAR")}
		// TODO: fix the transparent material used to display the range of an anchor and for bubbles


		// Camera Related Vars
		this.camera_angle = Math.PI/2;
		this.camera_height = 0;

		// Setup Camera
		this.camera_eye = vec3(Math.cos(this.camera_angle)*15, this.camera_height, Math.sin(this.camera_angle)*15);
		const camera = Mat4.look_at(this.camera_eye, vec3(0, this.camera_height, 0), vec3(0, 1, 0));
		Object.assign(this.uniforms, {camera_transform: Mat4.inverse(camera), camera_inverse: camera});

		// Move camera vars
		this.move_up = false;
		this.move_down = false;
		this.rotate_right = false;
		this.rotate_left = false;
	}
	render_animation(caller){
		
		// Movement Controls - Uncomment if you would like to fly around
		// if(!caller.controls){
		// 	this.animated_children.push(caller.controls = new defs.Movement_Controls({uniforms: this.uniforms}));
		// 	caller.controls.add_mouse_controls(caller.canvas);
		// 	Shader.assign_camera(Mat4.translation(0,3,-15), this.uniforms);
		// }
		
		this.camera_eye = vec3(Math.cos(this.camera_angle)*17, this.camera_height, Math.sin(this.camera_angle)*17);
		const camera = Mat4.look_at(this.camera_eye, vec3(0, this.camera_height, 0), vec3(0, 1, 0));
		Object.assign(this.uniforms, {camera_transform: Mat4.inverse(camera), camera_inverse: camera});

		// Setup Raycaster
		if(!this.raycast){
			this.raycast = new Raycast(this, caller.canvas);
		}

		this.move_camera();

		this.uniforms.projection_transform = Mat4.perspective(Math.PI/4, caller.width/caller.height, 1, 100);

		const t = this.t = this.uniforms.animation_time/1000;
		const angle = Math.sin(t);
		const light_position = Mat4.rotation(0,1,0,0).times(vec4(0,-1,1,0));
		this.uniforms.lights = [defs.Phong_Shader.light_source(light_position, color(1,1,1,1), 1000000)];
	}
	render_controls(){
		this.control_panel.innerHTML += "<h2>Kamera</h2>";
		this.key_triggered_button( "Sola çevir", ['j'], () => this.rotate_left = true, undefined, () => this.rotate_left = false );
		this.new_line();
		this.key_triggered_button( "Sağa çevir", ['l'], () => this.rotate_right = true, undefined, () => this.rotate_right = false );
		this.new_line();
		this.key_triggered_button( "Yukarı", ['i'], () => this.move_up = true, undefined, () => this.move_up = false );
		this.new_line();
		this.key_triggered_button( "Aşağı", ['k'], () => this.move_down = true, undefined, () => this.move_down = false );
		this.new_line();
		this.control_panel.innerHTML += "<h2>Oyun</h2>";
		this.key_triggered_button( "Dışa aktar", ['`', 'e'], this.export );
		this.new_line();
		this.key_triggered_button( "Yeniden başlat", ['`', 'r'], this.restart );
		this.new_line();
		this.key_triggered_button( "Sonraki bölüm", ['`', 't'], this.complete );
		this.new_line();
	}

	// Camera Controls
	move_camera(){
		if(this.move_up)
			this.camera_height = Math.min(this.camera_height + 0.2, 8);
		if(this.move_down)
			this.camera_height = Math.max(this.camera_height - 0.2, -8);
		if(this.rotate_right)
			this.camera_angle = (this.camera_angle - (Math.PI/144)) % (2*Math.PI);
		if(this.rotate_left)
			this.camera_angle = (this.camera_angle + (Math.PI/144)) % (2*Math.PI);
	}
	
	// Debug Controls
	export() {
		this.level.export_level();
	}
	restart() {
		this.status = "DEBUG_RESTART";
	}
	complete() {
		this.status = "LEVEL_COMPLETE";
	}
}

export class Game extends Game_Base{
	init(){
		super.init();

		if(this.level_number == null) this.level_number = 1;
		this.level = null;
		this.sim_accumulator = 0.0;
    	this.sim_time = 0.0;
		this.timestep = 0.01;
		this.timescale = 1;

		//Raycasting Vars for the Levels. These are set by the Raycaster object
		this.user_clicked = false;
		this.locs = [] //Location of points along the ray

		// Game Status
		// ACTIVE: game is being played
		// OUT_OF_BOUNDS: candy has gone out of bounds -> restart level
		// LEVEL_COMPLETE: hedefe ulaştı
		// DEBUG_RESTART: input to restart activated
		this.status = "ACTIVE";

		// Create a level
		// TODO: better level progression system
		this.level = AnyLevelFactory.makeLevel(this, this.level_number);
	}
	render_animation(caller){
		super.render_animation(caller);
		this.caller = caller;

		this.sim_accumulator += Math.min(this.uniforms.animation_delta_time/1000, 0.25) * this.timescale;
		this.sim_time += this.sim_accumulator;

		while(this.sim_accumulator >= this.timestep){
			this.level.update(this);
			this.sim_accumulator -= this.timestep;
		}

		this.level.render(this);

		if (this.status == "OUT_OF_BOUNDS" || this.status == "LEVEL_COMPLETE" || this.status == "DEBUG_RESTART") {
			if(this.status == "LEVEL_COMPLETE") this.level_number++;
			this.init();
		}	
	}

}