import {tiny, defs} from '../examples/common.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Spline {
    constructor() {
      this.points = [];
      this.tangents = [];
      this.size = 0;
    }
  
    add_point(x, y, z, sx, sy, sz) {
      this.points.push(vec3(x, y, z));
      this.tangents.push(vec3(sx, sy, sz));
      this.size += 1;
    }
  
    get_position(t) {
      if (this.size < 2) {
        return vec3(0, 0, 0);
      }
  
      // === With Scaling Weights === //
      // Interpolate t in interval (x1, x2)
      const A = Math.floor(t * (this.size - 1));
      const B = Math.ceil(t * (this.size - 1));
      const x1 = A / (this.size - 1);
      const x2 = (A+1) / (this.size - 1);
      const s = (t - x1) / (x2 - x1);
  
      let a_p = this.points[A].copy()
      let a_t = this.tangents[A].copy()
      let b_p = this.points[B].copy()
      let b_t = this.tangents[B].copy()
  
      const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;  // 2t^3 - 3t^2 + 1
      const h10 = s ** 3 - 2 * s ** 2 + s;      // t^3 - 2t^2 + t
      const h01 = -2 * s ** 3 + 3 * s ** 2;     // -2t^3 + 3t^2
      const h11 = s ** 3 - s ** 2;              // t^3 - t^2
      
      return a_p.times(h00).plus(a_t.times(h10 * (x2-x1)).plus(b_p.times(h01).plus(b_t.times(h11 * (x2-x1)))));
    }
  
    get_size() { return this.size; }
  
    get_point(index) { return this.points[index]; }
  
    get_tangent(index) { return this.tangents[index]; }
  
    set_point(index, x, y, z) { this.points[index] = vec3(x, y, z); }
  
    set_tangent(index, x, y, z) { this.tangents[index] = vec3(x, y, z); }
  
    reset() {
      this.points = [];
      this.tangents = [];
      this.size = 0;
    }
  };
  
 export class Curve_Shape extends Shape {
    // curve_function: (t) => vec3
    constructor(curve_function, sample_count, curve_color=color( 1, 0, 0, 1 )) {
      super("position", "normal");
  
      this.material = { shader: new defs.Phong_Shader(), ambient: 1.0, color: curve_color }
      this.sample_count = sample_count;
  
      if (curve_function && this.sample_count) {
        for (let i = 0; i < this.sample_count + 1; i++) {
          let t = i / this.sample_count;
          this.arrays.position.push(curve_function(t));
          this.arrays.normal.push(vec3(0, 0, 0)); // have to add normal to make Phong shader work.
        }
      }
    }

    changecolor(curve_color) {
        this.material = { shader: new defs.Phong_Shader(), ambient: 1.0, color: curve_color }
    }
  
    draw(webgl_manager, uniforms, mat) {
      // call super with "LINE_STRIP" mode
      super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
    }
    
    update(webgl_manager, uniforms, curve_function) {
      if (curve_function && this.sample_count) {
        for (let i = 0; i < this.sample_count + 1; i++) {
          let t = 1.0 * i / this.sample_count;
          this.arrays.position[i] = curve_function(t);
        }
      }
      // this.arrays.position.forEach((v, i) => v = curve_function(i / this.sample_count));
      this.copy_onto_graphics_card(webgl_manager.context);
      // Note: vertex count is not changed.
      // not tested if possible to change the vertex count.
    }
  };