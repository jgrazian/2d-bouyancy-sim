import { Vertex } from './vertex';
import { Vector } from './vector';


export class Line {
    v1: Vertex;
    v2: Vertex;

    constructor(v1: Vertex, v2: Vertex) {
        this.v1 = v1;
        this.v2 = v2;
    }

    normal(): Vector {
        return new Vector(-1 * (this.v2.y - this.v1.y), this.v2.x - this.v1.x)
    }

    mid(): Vertex {
        return new Vertex(0.5 * (this.v2.x + this.v1.x), 0.5 * (this.v2.y + this.v1.y));
    }

    lenSq(): number {
        return this.v1.distToSq(this.v2);
    }

    len(): number {
        return Math.sqrt(this.lenSq());
    }

    angle(): number {
        return this.v1.angleTo(this.v2);
    }

    rotate(angle: number, center?: Vertex) {
        center = center || this.mid();

        this.v1.rotate(angle, center);
        this.v2.rotate(angle, center);
    }

    translate(x: number | Vector, y?: number) {
        this.v1.translate(x, y);
        this.v2.translate(x, y);
    }

    intersect(other: Line): Vertex {
        let bot = (other.v2.x - other.v1.x) * (this.v1.y - this.v2.y) - (this.v1.x - this.v2.x) * (other.v2.y - other.v1.y);
        if (bot === 0) {
            return null;
        }

        let ta = ((other.v1.y - other.v2.y) * (this.v1.x - other.v1.x) + (other.v2.x - other.v1.x) * (this.v1.y - other.v1.y)) / bot;
        let tb = ((this.v1.y - this.v2.y) * (this.v1.x - other.v1.x) + (this.v2.x - this.v1.x) * (this.v1.y - other.v1.y)) / bot;

        if (0 <= ta && ta <= 1 && 0 <= tb && tb <= 1) {
            return new Vertex(this.v1.x + ta * (this.v2.x - this.v1.x), this.v1.y + ta * (this.v2.y - this.v1.y));
        } else {
            return null;
        }
    }
}