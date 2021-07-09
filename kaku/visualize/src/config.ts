
const rate = 10;
const pad = 100;

export function convertCoord(x: number, y: number): [number, number] {
  return [x*rate+pad, y*rate+pad];
}

export const width = 100 * rate + pad;
export const height = 100 * rate + pad;

export const grid_color = 'rgb(1,1,1,0.3)';
export const figure_color = 'rgb(00,00,255)';
export const hole_color = 'rgb(255,00,00)';
