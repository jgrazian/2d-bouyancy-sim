export const toRad: number = (Math.PI / 180);
export const toDeg: number = (180 / Math.PI);

export interface Projection {
    min: number;
    max: number;
    min_index: number;
    max_index: number;
}