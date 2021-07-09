import { dist } from './graph'

test('dist', () => {
  expect(dist([0, 0], [1, 0])).toBe(1);
  expect(dist([0, 0], [1, 1])).toBe(2);
  expect(dist([0, 0], [-1, 2])).toBe(5);
  expect(dist([1, 1], [0, 0])).toBe(2);
})