/**
 * Client-Side Swarm Flow Field Engine for MDG.
 * Generates vector fields pointing towards player position for smooth monster swarm pathfinding.
 */

const UNREACHABLE = 999999;
const DX = [0, 0, 1, -1, 1, -1, 1, -1];
const DY = [1, -1, 0, 0, 1, 1, -1, -1];
const COST = [10, 10, 10, 10, 14, 14, 14, 14];

export class FlowField {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.integration = Array.from({ length: h }, () => new Int32Array(w).fill(UNREACHABLE));
    this.vectorX = Array.from({ length: h }, () => new Float32Array(w));
    this.vectorY = Array.from({ length: h }, () => new Float32Array(w));
    this.lastTargetTx = -1;
    this.lastTargetTy = -1;
  }

  update(grid, targetTx, targetTy) {
    if (!grid || !grid.length) return;
    if (this.lastTargetTx === targetTx && this.lastTargetTy === targetTy) return;

    this.lastTargetTx = targetTx;
    this.lastTargetTy = targetTy;

    const w = this.w;
    const h = this.h;

    // 1. Reset
    for (let y = 0; y < h; y++) {
      this.integration[y].fill(UNREACHABLE);
      this.vectorX[y].fill(0);
      this.vectorY[y].fill(0);
    }

    if (targetTx < 0 || targetTx >= w || targetTy < 0 || targetTy >= h) return;

    // 2. BFS Dijkstra
    this.integration[targetTy][targetTx] = 0;
    const queue = [targetTx, targetTy];
    let head = 0;

    const isWalkable = tile => tile !== 1 && tile !== 2 && tile !== 10 && tile !== 11 && tile !== 15;

    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const currentDist = this.integration[cy][cx];

      for (let i = 0; i < 8; i++) {
        const nx = cx + DX[i];
        const ny = cy + DY[i];

        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const tile = grid[ny][nx];
          if (isWalkable(tile)) {
            const newDist = currentDist + COST[i];
            if (newDist < this.integration[ny][nx]) {
              this.integration[ny][nx] = newDist;
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    // 3. Compute Vectors
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x === targetTx && y === targetTy) continue;
        if (this.integration[y][x] === UNREACHABLE) continue;

        let lowestCost = this.integration[y][x];
        let bestNx = x;
        let bestNy = y;

        for (let i = 0; i < 8; i++) {
          const nx = x + DX[i];
          const ny = y + DY[i];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            if (this.integration[ny][nx] < lowestCost) {
              lowestCost = this.integration[ny][nx];
              bestNx = nx;
              bestNy = ny;
            }
          }
        }

        const vx = bestNx - x;
        const vy = bestNy - y;
        const len = Math.hypot(vx, vy);
        if (len > 0.001) {
          this.vectorX[y][x] = vx / len;
          this.vectorY[y][x] = vy / len;
        }
      }
    }
  }

  getSteering(worldX, worldY, tileSize = 48) {
    const tx = Math.floor(worldX / tileSize);
    const ty = Math.floor(worldY / tileSize);
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return { vx: 0, vy: 0 };
    return { vx: this.vectorX[ty][tx], vy: this.vectorY[ty][tx] };
  }
}
