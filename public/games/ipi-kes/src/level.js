import {Entity, tiny, defs} from './entity.js';
import { Raycast } from './raycast.js';
import { Walls } from './walls.js'

export class Level extends Entity {
    constructor(world) {
        super(world);

        // Objects
        this.candy = null;  // Candy
        this.anchors = []   // Anchors
        this.fans = [];     // Fans
        this.goal = null;   // hedef
        this.props = [];    // Level Props
        this.blocks = [];   // Solid Blocks
        this.walls = new Walls(this); //Walls

        // Level Parameters
        this.grav = 9.8;
        this.x_bound = { lower: -10, upper: 10 };
        this.y_bound = { lower: -10, upper: 10 };
        this.z_bound = { lower: -10, upper: 10 };
    }

    get_gravity() { return this.grav; }

    set_candy(candy) { this.candy = candy; }
    set_anchor(i, anchor) { this.anchors[i] = anchor; }
    set_goal(goal) { this.goal = goal; }
    set_prop(i, prop) { this.props[i] = prop; }
    set_gravity(g) { this.grav =  g; }
    set_x_bound(l, u) { this.x_bound = { lower: l, upper: u }; }
    set_y_bound(l, u) { this.y_bound = { lower: l, upper: u }; }
    set_z_bound(l, u) { this.z_bound = { lower: l, upper: u }; }

    add_anchor(anchor) { this.anchors.push(anchor); }
    add_fan(fan) { this.fans.push(fan)};
    add_prop(prop) { this.props.push(prop); }
    add_block(prop) { this.blocks.push(prop); }

    update(world) {
        // Reset external forces on candy
        this.candy.set_ext_force(0, 0, 0);

        // Apply external forces on candy
        if (!this.candy.get_is_bubbled()) { // Don't apply gravity when in bubble
            this.candy.add_ext_force(0, -this.grav * this.candy.get_mass(), 0);
        }

        // Update anchors and ropes
        for (var anchor of this.anchors) {
            anchor.update(world, this.candy);
        }

        // Update fans
        for (var fan of this.fans) {
            fan.update(world, this.candy);
        }

        // Update level props
        for (var prop of this.props) {
            prop.update(world, this.candy);
        }

        // Update candy attributes (pos, vel, acc)
        this.candy.update(world);

        // TODO: Check if candy is out of bounds (should this go somewhere else for organization)
        const candy_pos = this.candy.get_position();
        if (candy_pos[0] < this.x_bound.lower || candy_pos[0] > this.x_bound.upper) { world.status = "OUT_OF_BOUNDS"; }
        if (candy_pos[1] < this.y_bound.lower || candy_pos[1] > this.y_bound.upper) { world.status = "OUT_OF_BOUNDS"; }
        if (candy_pos[2] < this.z_bound.lower || candy_pos[2] > this.z_bound.upper) { world.status = "OUT_OF_BOUNDS"; }

        // Hedefe ulaştı mı
        this.goal.update(world, this.candy);

        //Check if user has clicked on anything
        this.check_raycast(world);
    }

    render(world) {
        // Draw candy
        this.candy.render(world);

        // Draw anchors and ropes
        for (var anchor of this.anchors) {
            anchor.render(world, this.candy);
        }

        // Draw fans
        for (var fan of this.fans) {
            fan.render(world);
        }

        // Draw level props
        for (var prop of this.props) {
            prop.render(world);
        }

        // Draw level props
        for (var block of this.blocks) {
            block.render(world);
        }

        // Hedefi çiz
        this.goal.render(world);

        // Draw walls
        this.walls.render(world);
    }

    check_raycast(world){
        if(!world.user_clicked){
            return false;
        }
        world.user_clicked = false;

        // Supports Anchors, Fans, Candy
        // Requires these to have 'pos', 'click_radius', and 'clicked_on(world)'
        const combined = this.anchors.concat(this.fans).concat(this.candy)
        const locs = world.locs; //Locations to check
        const ray_through = [];

        // Check if ray goes through anything
        entity_loop:
        for (const entity of combined) {
            for(const loc of locs){
                if (entity.pos.minus(loc).norm() <= entity.click_radius){
                    ray_through.push(entity);
                    continue entity_loop;
                }
            }
        }

        if(ray_through.length > 0){
            const clicked_entity = Raycast.get_closest_ob(world, ray_through);
            clicked_entity.clicked_on(world)
        }
    }

    // === DEBUG FUNCTIONS ===
    _vec3_to_string(v, p) {
        return '<' + v[0].toFixed(p) + ',' + v[1].toFixed(p) + ',' + v[2].toFixed(p) + '>';
    }

    export_level() {
        let ex = '';

        // Level
        ex += 'level ';
        ex += this.grav.toFixed(2) + ' ';
        ex += '<' + this.x_bound.lower.toFixed(2) + ',' + this.x_bound.upper.toFixed(2) + '> ';
        ex += '<' + this.y_bound.lower.toFixed(2) + ',' + this.y_bound.upper.toFixed(2) + '> ';
        ex += '<' + this.z_bound.lower.toFixed(2) + ',' + this.z_bound.upper.toFixed(2) + '>\n';

        // Candy
        ex += 'candy ';
        ex += this.candy.mass.toFixed(2) + ' ';
        ex += this._vec3_to_string(this.candy.pos, 2) + ' ';
        ex += this._vec3_to_string(this.candy.vel, 2) + ' ';
        ex += this._vec3_to_string(this.candy.acc, 2) + '\n';

        // Anchors
        for (var anchor of this.anchors) {
            ex += 'anchor ';
            ex += this._vec3_to_string(anchor.pos, 2) + ' ';
            ex += anchor.ks + ' ';
            ex += anchor.kd + ' ';
            ex += anchor.rest_length + ' ';
            ex += ((anchor.candy) ? 'candy' : 'no-candy') + ' ';
            ex += ((anchor.can_attach) ? 'can-attach' : 'cannot-attach') + '\n';
        }

        // Goal
        ex += 'goal '
        ex += this._vec3_to_string(this.goal.pos, 2) + '\n';
        console.log(ex);
    }
}