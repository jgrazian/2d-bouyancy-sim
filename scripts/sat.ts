import { Projection } from './constants';
import { Polygon } from './polygon';
import { Vector } from './vector';
import { Vertex } from './vertex';

interface Overlap {
    overlap: number;
    point_ind: number;
}

interface Manifold {
    normal: Vector;
    distance: number;
    point: Vertex;
}

/**
 * Check if two projections are overlapping on an axis.
 * @param proj1 Projection whos axis
 * @param proj2 Projection
 */
export function getOverlap(proj1: Projection, proj2: Projection): Overlap {
    let ans = null;
    if (proj1.min >= proj2.min && proj1.min <= proj2.max && proj1.max >= proj2.max) {
        // ----x2--x1-----x2--x1----
        ans = {
            overlap: Math.abs(proj2.max - proj1.min),
            point_ind: proj2.max_index
        };
    } else if (proj1.min <= proj2.min && proj1.max >= proj2.min && proj1.max <= proj2.max) {
        // ----x1--x2-----x1--x2----
        ans = {
            overlap: Math.abs(proj1.max - proj2.min),
            point_ind: proj2.min_index
        };
    } else if ((proj1.min < proj2.min && proj1.max > proj2.max) || (proj2.min < proj1.min && proj2.max > proj1.max)) {
        ans = {
            overlap: 9999,
            point_ind: 0
        }
    }
    return ans;
}

/**
 * Check if two polygons are overlapping and get distance and axis on which they are.
 * Separating axis theorem. http://www.dyn4j.org/2010/01/sat/
 * @param v1 Polygon1
 * @param v2 Polygon2
 */
export function SAT(poly1: Polygon, poly2: Polygon): Manifold {
    let min_overlap = Infinity;
    let min_axis = null;
    let point_ind = null;
    let poly = null;

    //Check normals of first polygon
    for (let i = 0; i < poly1.normals.length; i ++) {
        let axis = poly1.normals[i].normal;
        let proj1 = poly1.project(axis);
        let proj2 = poly2.project(axis);
        let overlap = getOverlap(proj1, proj2);

        if (!overlap) {
            return
        } else if (overlap.overlap < min_overlap) {
            min_overlap = overlap.overlap;
            min_axis = axis;
            point_ind = overlap.point_ind;
            poly = poly2;
        }
    }

    //Check normals of second polygon
    for (let i = 0; i < poly2.normals.length; i ++) {
        let axis = poly2.normals[i].normal;
        let proj1 = poly1.project(axis);
        let proj2 = poly2.project(axis);
        let overlap = getOverlap(proj2, proj1);

        if (!overlap) {
            return
        } else if (overlap.overlap < min_overlap) {
            min_overlap = overlap.overlap;
            min_axis = axis;
            point_ind = overlap.point_ind;
            poly = poly1;
        }
    }

    //Make axis always point to the first polygon
    if ((poly1.centroid.x - poly2.centroid.x) * min_axis.x < 0 || (poly1.centroid.y - poly2.centroid.y) * min_axis.y < 0) {
        min_axis.x = min_axis.x * -1;
        min_axis.y = min_axis.y * -1;
    }

    let return_point = new Vertex(poly.points[point_ind].x, poly.points[point_ind].y);
    return {distance: min_overlap, normal: min_axis, point: return_point};
}
