
const rate = 8;
const pad = 100;
export const grid_col = 160;
export const grid_row = 160;

export function convertCoord(x: number, y: number): [number, number] {
  return [x*rate+pad, y*rate+pad];
}

export const width = grid_col * rate + pad * 2;
export const height = grid_row * rate + pad * 2;

export const grid_color = 'rgb(100,100,100,0.5)';
export const figure_color = 'rgb(00,00,255)';
export const figure_alert_color = 'rgb(255,00,00)';
export const hole_color = 'rgb(0,0,0)';
