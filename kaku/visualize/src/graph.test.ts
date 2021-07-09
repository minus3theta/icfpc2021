import { dist, figure2graph } from './graph'
import { Figure, setOrigLen } from './state';

test('dist', () => {
  expect(dist([0, 0], [1, 0])).toBe(1);
  expect(dist([0, 0], [1, 1])).toBe(2);
  expect(dist([0, 0], [-1, 2])).toBe(5);
  expect(dist([1, 1], [0, 0])).toBe(2);
})

test('figure2graph', () => {
  const fig: Figure = {
    edges: [[0, 1], [1, 2], [0, 2]],
    vertices: [[0, 0], [1, 1], [-1, 1]],
    orig_len: []
  };
  setOrigLen(fig);
  const graph = figure2graph(fig);
  expect(graph.nodes[0]?.edges.length).toBe(2);
  expect(graph.nodes[1]?.edges.length).toBe(2);
  expect(graph.nodes[2]?.edges.length).toBe(2);
  expect(graph.orig_len[0]![1]).toBe(2);
  expect(graph.orig_len[0]![2]).toBe(2);
  expect(graph.orig_len[1]![2]).toBe(4);
})