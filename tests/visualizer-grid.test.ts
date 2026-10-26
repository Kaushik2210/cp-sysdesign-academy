import { describe, expect, it } from "vitest";
import { DEFAULT_GRID, bfsGridSteps, dfsGridSteps, parseGrid, type Cell } from "../src/visualizers/grid";

/** Independent reference: plain BFS distance from S to E, or -1. */
function shortest(input: string): number {
  const { map, start, end } = parseGrid(input);
  const dist = new Map<string, number>([[start.join(","), 0]]);
  const q: Cell[] = [start];
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (map[nr]?.[nc] === undefined || map[nr][nc] === "#" || dist.has(`${nr},${nc}`)) continue;
      dist.set(`${nr},${nc}`, dist.get(`${r},${c}`)! + 1);
      q.push([nr, nc]);
    }
  }
  return dist.get(end.join(",")) ?? -1;
}

function randomGrid(seed: number, rows: number, cols: number, density: number): string {
  let x = seed;
  const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const g: string[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd() < density ? "#" : ".")));
  g[0][0] = "S";
  g[rows - 1][cols - 1] = "E";
  return g.map((r) => r.join("")).join("\n");
}

const last = <T>(a: T[]) => a[a.length - 1];

describe("parseGrid", () => {
  it("finds S and E", () => {
    const g = parseGrid("S.\n.E");
    expect(g.start).toEqual([0, 0]);
    expect(g.end).toEqual([1, 1]);
  });
  it("rejects bad grids with friendly messages", () => {
    expect(() => parseGrid("")).toThrow(/Enter a grid/);
    expect(() => parseGrid("S.\n.")).toThrow(/same length/);
    expect(() => parseGrid("S.x")).toThrow(/Unknown character/);
    expect(() => parseGrid("..E")).toThrow(/needs one S/);
    expect(() => parseGrid("S..")).toThrow(/needs one E/);
    expect(() => parseGrid("SSE")).toThrow(/Only one S/);
    expect(() => parseGrid("S" + ".".repeat(14) + "E")).toThrow(/at most 14 columns/);
    expect(() => parseGrid(Array(11).fill("SE").join("\n"))).toThrow();
  });
});

describe("BFS on a grid", () => {
  it("finds a shortest path: matches an independent BFS on 60 random grids", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGrid(seed, 6 + (seed % 4), 7 + (seed % 5), 0.15 + (seed % 5) * 0.06);
      const steps = bfsGridSteps(g);
      const path = last(steps).state.path;
      const want = shortest(g);
      if (want < 0) {
        expect(path, g).toEqual([]);
        expect(last(steps).note).toMatch(/unreachable/);
      } else {
        expect(path.length - 1, g).toBe(want);
      }
    }
  });
  it("the reported route is made of adjacent open cells from S to E", () => {
    const { map, start, end } = parseGrid(DEFAULT_GRID);
    const path = last(bfsGridSteps(DEFAULT_GRID)).state.path;
    expect(path[0]).toEqual(start);
    expect(last(path)).toEqual(end);
    for (let i = 0; i < path.length; i++) {
      expect(map[path[i][0]][path[i][1]]).not.toBe("#");
      if (i > 0) expect(Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1])).toBe(1);
    }
  });
  it("hand-checked default grid has a shortest path of 15 steps", () => {
    expect(shortest(DEFAULT_GRID)).toBe(15);
    expect(last(bfsGridSteps(DEFAULT_GRID)).state.path.length - 1).toBe(15);
  });
  it("distances never decrease along the order cells are popped", () => {
    const popped: number[] = [];
    for (const s of bfsGridSteps(DEFAULT_GRID)) if (s.line === 2 && s.state.current) popped.push(s.state.dist[s.state.current[0]][s.state.current[1]]!);
    expect(popped).toEqual([...popped].sort((a, b) => a - b));
  });
  it("handles S adjacent to E and a walled-in start", () => {
    expect(last(bfsGridSteps("SE")).state.path).toEqual([[0, 0], [0, 1]]);
    expect(last(bfsGridSteps("S#E")).note).toMatch(/unreachable/);
  });
  it("each cell is enqueued at most once", () => {
    const steps = bfsGridSteps(DEFAULT_GRID);
    const pushes = steps.filter((s) => s.line === 5).length;
    const reached = last(steps).state.status.flat().filter((x) => x !== "unseen").length;
    expect(pushes).toBe(reached - 1); // every reached cell except S was pushed exactly once
  });
});

describe("DFS on a grid", () => {
  it("agrees with BFS about reachability and returns a valid route", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGrid(seed, 6 + (seed % 4), 7 + (seed % 5), 0.15 + (seed % 5) * 0.06);
      const path = last(dfsGridSteps(g)).state.path;
      const want = shortest(g);
      expect(path.length > 0, g).toBe(want >= 0);
      if (want >= 0) expect(path.length - 1, g).toBeGreaterThanOrEqual(want);
      for (let i = 1; i < path.length; i++) expect(Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1])).toBe(1);
    }
  });
  it("on the default grid it finds a longer route than BFS (the point of the comparison)", () => {
    const dfs = last(dfsGridSteps(DEFAULT_GRID)).state.path.length - 1;
    const bfs = last(bfsGridSteps(DEFAULT_GRID)).state.path.length - 1;
    expect(dfs).toBeGreaterThanOrEqual(bfs);
  });
  it("pops exactly the cell that was next in line (top of the stack / front of the queue)", () => {
    for (const run of [dfsGridSteps, bfsGridSteps]) {
      const steps = run(DEFAULT_GRID);
      for (let i = 1; i < steps.length; i++) {
        if (steps[i].line !== 2) continue;
        expect(steps[i].state.current).toEqual(steps[i - 1].state.frontier[0]);
      }
    }
  });
  it("reports its frontier as a stack", () => {
    expect(dfsGridSteps(DEFAULT_GRID)[0].state.frontierKind).toBe("stack");
    expect(bfsGridSteps(DEFAULT_GRID)[0].state.frontierKind).toBe("queue");
  });
});
