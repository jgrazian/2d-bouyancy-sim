import {Vector} from './vector';
import {Line} from './line';
import {toRad, toDeg} from './constants';


export class Vertex {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    dot(other: Vector): number {
        return this.x * other.x + other.y * this.y;
    }

    cross(other: Vector): number {
        return this.x * other.y - other.x * this.y;
    }

    scale(value: number) {
        this.x = this.x * value;
        this.y = this.y * value;
    }

    distToSq(other: Vertex): number {
        return (other.x - this.x) * (other.x - this.x) + (other.y - this.y) * (other.y - this.y);
    }

    distTo(other: Vertex): number {
        return Math.sqrt(this.distToSq(other));
    }

    angleTo(other: Vertex): number {
        return Math.atan2(other.y - this.y, other.x - this.x) * toDeg;
    }

    vectorTo(other: Vertex): Vector {
        return new Vector(other.x - this.x, other.y - this.y);
    }

    rotate(angle: number, center?: Vertex) {
        center = center || new Vertex(0, 0);
        angle = angle * toRad; //Convert angle to radians

        let new_x = Math.cos(angle) * (this.x - center.x) - Math.sin(angle) * (this.y - center.y) + center.x;
        let new_y = Math.sin(angle) * (this.x - center.x) + Math.cos(angle) * (this.y - center.y) + center.y;

        this.x = new_x;
        this.y = new_y;
    }

    translate(x: number | Vector, y?: number) {
        if (x instanceof Vector) {
            this.x = this.x + x.x;
            this.y = this.y + x.y;
        } else {
            this.x = this.x + x;
            this.y = (y) ? this.y + y : this.y;
        }
    }

    isAbove(other: Line): boolean {
        if (other.mid().vectorTo(this).dot(other.normal()) > 1) {
            return true;
        } else {
            return false;
        }
    }

    areColinear(other1: Vertex, other2: Vertex): boolean {
        let a = this.x * (other1.y - other2.y) + other1.x * (other2.y - this.y) + other2.x * (this.y - other1.y);
        return (a < 0.2);
    }

    equals(other: Vertex, tol: number = 0): boolean {
        if (Math.abs(this.x - other.x) <= tol && 
            Math.abs(this.y - other.y) <= tol) {
            return true;
        } else {
            return false;
        }
    }
}