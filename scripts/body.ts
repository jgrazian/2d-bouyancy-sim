import { Polygon } from "./polygon";
import { Vector } from "./vector";
import { Force } from "./force";
import { toDeg } from "./constants";
import { Line } from "./line";


export class Body {
    polygon: Polygon;
    mass: number;
    inv_mass: number;
    inertia: number;
    inv_inertia: number;
    velocity: Vector;
    acceleration: Vector;
    angular_velocity: number;
    angular_acceleration: number;
    forces: Map<string, Force>;
    moments: Map<string, number>;
    kinematic: boolean;
    trackingMouse: boolean;

    constructor(poly: Polygon, mass?: number) {
        this.polygon = poly;
        this.mass = mass || this.polygon.area;
        this.inv_mass = 1 / this.mass;
        this.inertia = this.polygon.Iz * (this.mass / this.polygon.area);
        this.inv_inertia = 1 / this.inertia;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.angular_velocity = 0;
        this.angular_acceleration = 0;
        this.forces = new Map();
        this.moments = new Map();
        this.kinematic = false;
        this.trackingMouse = false;
    }

    update(dt: number) {
        this.applyForces();
        this.updateMovement(dt);
    }

    updateMovement(dt: number) {
        this.velocity = new Vector(this.velocity.x + this.acceleration.x * dt, this.velocity.y + this.acceleration.y * dt);
        this.polygon.translate(this.velocity.x * dt, this.velocity.y * dt);

        this.angular_velocity += this.angular_acceleration * dt;
        this.polygon.rotate(this.angular_velocity * dt * toDeg);
    }

    applyForces() {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.angular_acceleration = 0;

        if (this.kinematic) { return };

        for (let value of this.forces.values()) {
            this.angular_acceleration += value.momentAbout(this.polygon.centroid);
            this.acceleration = this.acceleration.add(value.force);
        }
        for (let value of this.moments.values()) {
            this.angular_acceleration += value;
        }

        this.acceleration = this.acceleration.scale(1 / this.mass);
        this.angular_acceleration /= this.inertia;
    }

    calculateBouyancy(wl: Line) {
        if (!wl) { return };
        let submerged = this.polygon.divide(wl);
        if (!submerged && this.polygon.centroid.isAbove(wl)) {
            submerged = this.polygon;
        } else if (!submerged) {
            this.forces.delete('bouyancy');
            this.forces.delete('drag');
            this.moments.delete('drag');
            return;
        }

        let center = submerged.centroid;
        center.x = (Math.abs(center.x - this.polygon.centroid.x) > 0.01) ? center.x : this.polygon.centroid.x;
        let force = new Vector(0, -1).scale(submerged.area * 1.025 * 9.81);
        let bf = new Force(force, center);
        this.forces.set('bouyancy', bf);

        //Linear drag
        let drag_dir = (this.velocity.y > 0) ? -1 : 1;
        let drag_vector = new Vector(0, drag_dir).scale(0.5 * submerged.perimeter * 0.65 * 1.025 * (this.velocity.y * this.velocity.y));
        let drag_force = new Force(drag_vector, this.polygon.centroid);
        this.forces.set('drag', drag_force);
        //Angular drag
        let angular_drag = -0.45 * this.angular_velocity
        this.moments.set('drag', angular_drag * this.inertia);
    }
}