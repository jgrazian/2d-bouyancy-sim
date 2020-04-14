import { Vector } from "./vector";
import { Vertex } from "./vertex";


export class Force{
    force: Vector;
    location: Vertex;

    constructor(force: Vector, location: Vertex) {
        this.force = force;
        this.location = location;
    }

    momentAbout(other: Vertex): number {
        let arm = other.vectorTo(this.location);
        return arm.cross(this.force);
    }
}