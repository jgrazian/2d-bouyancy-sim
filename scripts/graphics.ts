import {Polygon} from './polygon';
import {Vertex} from './vertex';
import {Line} from './line';
import { Force } from './force';

var ctx: CanvasRenderingContext2D = null

interface Options {
    strokeStyle?: string;
    lineWidth?: number;
    fillStyle?: string;
    radius?: number;
    debug?: boolean;
}

export function initialize(canvas: CanvasRenderingContext2D) {
    ctx = canvas;
}

export function draw_polygon(poly: Polygon, opts?: Options) {
    opts = opts || {};

    ctx.fillStyle = opts.fillStyle || 'slategrey';
    ctx.strokeStyle = opts.strokeStyle || 'black';
    ctx.lineWidth = opts.lineWidth || 1;

    ctx.beginPath();
    ctx.moveTo(poly.points[0].x, poly.points[0].y);
    for (let pt of poly.points) {
        ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (opts.debug) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        if (poly.normals) {
            for (let i of poly.normals) {
                ctx.beginPath();
                ctx.moveTo(i.point.x, i.point.y);
                ctx.lineTo(i.point.x + i.normal.x * 10, i.point.y + i.normal.y * 10);
                ctx.stroke();
            }
        }
        draw_point(poly.centroid);
    }
}

export function draw_polygons(polys: Polygon[], opts?: Options) {
    for (let x of polys) {
        draw_polygon(x, opts);
    }
}

export function draw_point(pt: Vertex, opts?: Options) {
    if (!pt) { return }; //Skip if no point
    opts = opts || {};

    ctx.fillStyle = opts.fillStyle || 'red';
    let radius = opts.radius || 3;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

export function draw_points(pts: Vertex[], opts?: Options) {
    if (!pts) { return };
    for (let x of pts) {
        draw_point(x, opts);
    }
}

export function draw_line(line: Line, opts?: Options) {
    if (!line) { return };
    opts = opts || {};

    ctx.strokeStyle = opts.strokeStyle || 'black';
    ctx.lineWidth = opts.lineWidth || 3;

    ctx.beginPath();
    ctx.moveTo(line.v1.x, line.v1.y);
    ctx.lineTo(line.v2.x, line.v2.y);
    ctx.stroke();
}

export function draw_lines(lines: Line[], opts?: Options) {
    if (!lines) { return };
    for (let x of lines) {
        draw_line(x, opts);
    }
}

export function draw_force(force: Force, opts?: Options) {
    if (!force) { return };
    opts = opts || {};

    ctx.strokeStyle = opts.strokeStyle || 'blue';
    ctx.lineWidth = opts.lineWidth || 1;

    ctx.beginPath();
    ctx.moveTo(force.location.x, force.location.y);
    let scaled_x = Math.log(force.force.x) * 2;
    if (scaled_x === -Infinity || scaled_x === Infinity) {
        scaled_x = 0;
    } else if (isNaN(scaled_x)) {
        scaled_x = Math.log(-1 * force.force.x) * -2;
    }

    let scaled_y = Math.log(force.force.y) * 2;
    if (scaled_y === -Infinity || scaled_y === Infinity) {
        scaled_y = 0;
    } else if (isNaN(scaled_y)) {
        scaled_y = Math.log(-1 * force.force.y) * -2;
    }
    ctx.lineTo(force.location.x + scaled_x, force.location.y + scaled_y);
    ctx.stroke();
    draw_point(force.location, {radius: 1, fillStyle: 'black'})
} 