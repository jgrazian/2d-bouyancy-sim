import {toRad, toDeg} from './constants';


export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    scale(value: number): Vector {
        return new Vector(this.x * value, this.y * value);
    }

    dot(other: Vector): number {
        return this.x * other.x + other.y * this.y;
    }

    cross(other: Vector): number {
        return this.x * other.y - other.x * this.y;
    }

    normalize(): Vector {
        let len = this.len();
        return new Vector(this.x / len, this.y / len);
    }

    lenSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    len(): number {
        return Math.sqrt(this.lenSq());
    }

    angle(): number {
        return Math.atan2(this.y, this.x) * toDeg;
    }

    rotate(angle: number) {
        angle = toRad * angle;

        this.x = Math.cos(angle) * this.x - Math.sin(angle) * this.y;
        this.y = Math.sin(angle) * this.x + Math.cos(angle) * this.y; 
    }

}