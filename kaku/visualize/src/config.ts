
const rate = 10;
const pad = 100;

export function convertCoord(x: number, y: number): [number, number] {
  return [x*rate+pad, y*rate+pad];
}

export const width = 100 * rate + pad;
export const height = 100 * rate + pad;

export const grid_color = 'rgb(100,100,100,0.5)';
export const figure_color = 'rgb(00,00,255)';
export const figure_alert_color = 'rgb(255,00,00)';
export const hole_color = 'rgb(0,0,0)';
