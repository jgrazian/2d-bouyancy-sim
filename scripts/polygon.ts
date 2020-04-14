import { Vertex } from "./vertex";
import { Vector } from "./vector";
import { Line } from "./line";
import {Projection} from './constants';

interface Normal {
    point: Vertex;
    normal: Vector;
}

export class Polygon {
    points: Vertex[];
    area: number = 0;
    perimeter: number = 0;
    Ix: number = 0;
    Iy: number = 0;
    Iz: number = 0;

    centroid: Vertex = new Vertex(0, 0);
    normals: Normal[];

    //TODO: Add toggle to disable init
    constructor(points: Vertex[], init: boolean = true) {
        if (points[points.length - 1].equals(points[0])) {
            points.pop();
        }
        this.points = points;

        if (init) {
            this._initLight();
            this.update();
            if (this.area < 0) {
                console.error('Polygon must be defined counterclockwise');
            }
            this.init();
        } else {
            this._initLight();
        }
    }

    /**
     * One time function for fixed values (area, perimeter and moment of inertia)
     */
    init() {
        this.area = 0;
        this.perimeter = 0;

        this.Ix = 0;
        this.Iy = 0;
        this.Iz = 0;

        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            //Area
            this.area += this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y;

            //Perimeter
            this.perimeter += this.points[j].distTo(this.points[i]);

            //Second Moment, Ix and Iy
            let p1 = this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y;
            let py = this.points[j].x * this.points[j].x + this.points[j].x * this.points[i].x + this.points[i].x * this.points[i].x;
            let px = this.points[j].y * this.points[j].y + this.points[j].y * this.points[i].y + this.points[i].y * this.points[i].y;
            this.Ix += p1 * px;
            this.Iy += p1 * py;

            j = i;
        }
        this.area = -0.5 * this.area;

        this.Ix = -(1 / 12) * this.Ix;
        this.Iy = -(1 / 12) * this.Iy;

        //Apply parallel axis theorem
        this.Ix = this.Ix - this.area * (this.centroid.y * this.centroid.y);
        this.Iy = this.Iy - this.area * (this.centroid.x * this.centroid.x);

        //Calculate Iz
        this.Iz = this.Ix + this.Iy;
    }

    /**
     * Function to update centroid and normals
     */
    update() {
        this.centroid.x = 0;
        this.centroid.y = 0;

        this.normals = [];

        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            //Centroid
            this.centroid.x += (this.points[j].x + this.points[i].x) * (this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y);
            this.centroid.y += (this.points[j].y + this.points[i].y) * (this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y);

            //Normals
            let dx = this.points[i].x - this.points[j].x;
            let dy = this.points[i].y - this.points[j].y;
            let vec = new Vector(-dy, dx).normalize();
            this.normals.push({
                point: new Vertex(0.5 * (this.points[j].x + this.points[i].x), 0.5 * (this.points[j].y + this.points[i].y)),
                normal: vec
            });

            j = i;
        }
        let coef = -(1 / (6 * this.area));
        this.centroid.x = coef * this.centroid.x;
        this.centroid.y = coef * this.centroid.y;
    }

    translate(x: number | Vector, y?: number) {
        for (let pt of this.points) {
            pt.translate(x, y);
        }
        this.update();
    }

    rotate(angle: number, center?: Vertex) {
        center = center || this.centroid;
        for (let pt of this.points) {
            pt.rotate(angle, center);
        }
        this.update();
    }

    intersect(other: Line): Vertex[] {
        let pts = [];
        // Use each segment of the polygon to intersect with the line
        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            let int = other.intersect( new Line(new Vertex(this.points[j].x, this.points[j].y), new Vertex(this.points[i].x, this.points[i].y)) );

            if (int) {
                pts.push(int);
            }
            j = i;
        }
        return (pts.length > 0) ? pts : null;
    }

    divide(other: Line): Polygon {
        let int = this.intersect(other);
        if (!int) { return };

        let sideFlag = this.points[0].isAbove(other);
        let verts = [];

        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            let side = this.points[i].isAbove(other);
            if (side === sideFlag) {
                if (side) {
                    verts.push( new Vertex(this.points[i].x, this.points[i].y) );
                }
            } else {
                let div_pt = (this.points[i].areColinear(this.points[i - 1], int[0])) ? 0 : 1;
                verts.push(int[div_pt]);
                int.splice(div_pt, 1);
                if (side) {
                    verts.push( new Vertex(this.points[i].x, this.points[i].y) );
                }
                sideFlag = !sideFlag;
            }
        }
        if (int.length > 0) {
            verts.push(int[0]);
        }
        return new Polygon(verts, false);
    }

    project(axis: Vector): Projection {
        let res = {min: Infinity, max: -Infinity, min_index: 0, max_index: 0};
        for (let i=0; i < this.points.length; i++) {
            let dot = this.points[i].dot(axis);

            if (dot > res.max) {
                res.max = dot;
                res.max_index = i;
            } 
            if (dot < res.min) {
                res.min = dot;
                res.min_index = i;
            }
        }
        return res;
    }

    containsPoint(pt: Vertex) {
        let ray = new Line(pt, new Vertex(pt.x + 500, pt.y));
        let int = this.intersect(ray);
        if (!int) {return};
        if (int.length % 2 === 0) {
            return false;
        } else {
            return true;
        }
    }

    _initLight() {
        this.area = 0;
        this.centroid.x = 0;
        this.centroid.y = 0;
        this.perimeter = 0;
        let j = this.points.length - 1;
        for (let i = 0; i < this.points.length; i++) {
            //Area
            this.area += this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y;
            //Centroid
            this.centroid.x += (this.points[j].x + this.points[i].x) * (this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y);
            this.centroid.y += (this.points[j].y + this.points[i].y) * (this.points[j].x * this.points[i].y - this.points[i].x * this.points[j].y);
            //Perimeter
            this.perimeter += this.points[j].distTo(this.points[i]);

            j = i;
        }
        this.area = -0.5 * this.area;
        let coef = -(1 / (6 * this.area));
        this.centroid.x = coef * this.centroid.x;
        this.centroid.y = coef * this.centroid.y;
    }
}