import * as gfx from "./graphics";
import {Polygon} from './polygon';
import { Vertex } from "./vertex";
import { Line } from "./line";
import { World } from "./world";
import { Body } from "./body";
import { SAT } from './sat';
import { Vector } from "./vector";


const canvas = <HTMLCanvasElement> document.getElementById('canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

gfx.initialize(ctx); //Need to give gfx the handle to the Canvas

let pts = [new Vertex(0, 0), new Vertex(0, 50), new Vertex(150, 50), new Vertex(150, 0), new Vertex(100, 0), new Vertex(0, 0)];
let sq = new Polygon(pts);
sq.translate(155, 220);
sq.rotate(15);
let body = new Body(sq, 3500);
body.kinematic = false;

let pts2 = [new Vertex(0, 0), new Vertex(0, 25), new Vertex(50, 25), new Vertex(50, 0)];
let sq2 = new Polygon(pts2);
sq2.translate(170, 130);
let body2 = new Body(sq2, 250);
body2.kinematic = false;

let pts3 = [new Vertex(0, 0), new Vertex(0, 25), new Vertex(50, 25), new Vertex(50, 0)];
let sq3 = new Polygon(pts3);
sq3.translate(240, 100);
let body3 = new Body(sq3, 750);

let wl = new Line(new Vertex(0, 300), new Vertex(600, 300));


let world = new World();
world.bodies.set('1', body);
//world.bodies.set('2', body2);
//world.bodies.set('3', body3);
world.waterline = wl;

function main() {
    ctx.fillStyle = 'lightskyblue';
    ctx.fillRect(0, 0, 600, 300);
    ctx.fillStyle = 'navy';
    ctx.fillRect(0, 300, 600, 200);

    world.update(0.025);
    gfx.draw_polygon(body.polygon, {debug: false});
    //gfx.draw_polygon(body2.polygon);
    //gfx.draw_polygon(body3.polygon);
    gfx.draw_line(world.waterline, {strokeStyle: 'dodgerblue'});

    window.requestAnimationFrame(main);
}
window.requestAnimationFrame(main);

//Mouse Stuff
function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return new Vertex(evt.clientX - rect.left, evt.clientY - rect.top);
}

canvas.addEventListener('mousedown', function(evt) {
    let mousePos = getMousePos(canvas, evt);
    for (let b of world.bodies.values()) {
        if (b.polygon.containsPoint(mousePos)) {
            b.trackingMouse = true;
        }
    }
});

canvas.addEventListener('mouseup', function(evt) {
    for (let b of world.bodies.values()) {
        b.trackingMouse = false;
    }
});

canvas.addEventListener('mousemove', function(evt) {
    for (let b of world.bodies.values()) {
        if (b.trackingMouse) {
            let mp = getMousePos(canvas, evt);
            let dv = new Vector(2 * (mp.x - b.polygon.centroid.x), 2 * (mp.y - b.polygon.centroid.y));

            b.velocity = dv;
        }
    }
});
