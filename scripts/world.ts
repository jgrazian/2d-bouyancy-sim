import { Line } from "./line";
import { Body } from "./body";
import { Force } from "./force";
import { Vector } from "./vector";
import { SAT } from "./sat";


export class World {
    bodies: Map<string, Body>;
    waterline?: Line;

    constructor() {
        this.bodies = new Map();
        this.waterline = null;
    }

    update(dt: number) {
        let gravity = new Vector(0, 9.81);
        for (let body of this.bodies.values()) {

            body.calculateBouyancy(this.waterline);
            body.forces.set('gravity', new Force(gravity.scale(1 * body.mass), body.polygon.centroid));
            body.update(dt);

            for (let other of this.bodies.values()) {
                if (body !== other) {
                    collideAndResolve(body, other);
                }
            }
        }
    }
}

function collideAndResolve(b1: Body, b2: Body) {
    let col = SAT(b1.polygon, b2.polygon);
    if (!col) { return };

    //CoM -> Point of Contact
    let r1 = new Vector(col.point.x - b1.polygon.centroid.x, col.point.y - b1.polygon.centroid.y);
    let r2 = new Vector(col.point.x - b2.polygon.centroid.x, col.point.y - b2.polygon.centroid.y);

    //Velocity at contact points
    let vp1 = new Vector(b1.velocity.x - b1.angular_velocity * r1.y, b1.velocity.y + b1.angular_velocity * r1.x);
    let vp2 = new Vector(b2.velocity.x - b2.angular_velocity * r2.y, b2.velocity.y + b2.angular_velocity * r2.x);
    
    //RelAtoB
    let rv = new Vector(vp2.x - vp1.x, vp2.y - vp1.y);
    let velRel = rv.dot(col.normal);

    //Rotational component - (r x n)^2 / Iz
    let v1 = r1.cross(col.normal);
    v1 = (v1 * v1) * b1.inv_inertia;
    let v2 = r2.cross(col.normal);
    v2 = (v2 * v2) * b2.inv_inertia;

    let e = 0.01; //Restitution
    let j = -(1 + e) * velRel;
    j = j / (b1.inv_mass + b2.inv_mass + v1 + v2); //impulse

    let impulse = new Vector(col.normal.x * j, col.normal.y * j);
    b1.velocity = new Vector(b1.velocity.x - b1.inv_mass * impulse.x, b1.velocity.y - b1.inv_mass * impulse.y);
    b2.velocity = new Vector(b2.velocity.x + b2.inv_mass * impulse.x, b2.velocity.y + b2.inv_mass * impulse.y);

    b1.angular_velocity -= b1.inv_inertia * r1.cross(impulse);
    b2.angular_velocity += b2.inv_inertia * r2.cross(impulse);

    //Friction
    let tangentVel = new Vector(rv.x - velRel * col.normal.x, rv.y - velRel * col.normal.y).normalize();

    let f1 = r1.cross(tangentVel);
    f1 = (f1 * f1) * b1.inv_inertia;
    let f2 = r2.cross(tangentVel);
    f2 = (f2 * f2) * b2.inv_inertia;
    let k = -(1 + e) * rv.dot(tangentVel);
    k = k / (b1.inv_mass + b2.inv_mass + v1 + v2);

    let friction = new Vector(tangentVel.x * k, tangentVel.y * k);
    b1.velocity = new Vector(b1.velocity.x - b1.inv_mass * friction.x, b1.velocity.y - b1.inv_mass * friction.y);
    b2.velocity = new Vector(b2.velocity.x + b2.inv_mass * friction.x, b2.velocity.y + b2.inv_mass * friction.y);

    b1.angular_velocity -= b1.inv_inertia * r1.cross(friction);
    b2.angular_velocity += b2.inv_inertia * r2.cross(friction);



    //Collision Resolution 
    const k_slop = 0.01;
    const percent = 0.8;
    let temp = Math.max(col.distance - k_slop, 0.0) / (b1.inv_mass + b2.inv_mass);
    let correction = new Vector(col.normal.x * percent * temp, col.normal.y * percent * temp);

    b1.polygon.translate(new Vector(1 * correction.x * b1.inv_mass, 1 * correction.y * b1.inv_mass));
    b2.polygon.translate(new Vector(-1 * correction.x * b2.inv_mass, -1 * correction.y * b2.inv_mass));
}

