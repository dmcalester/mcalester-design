import { Experiment } from "./Experiment.js";
import { resolveCssColor } from "../core/utils.js";

export class LightTrail extends Experiment {
   static title = "Light Trail";
   static description =
      "Draw paths and complete polygons to add layers of light";

   static config = {
      diagonal: true,
      polygonOpacity: 0.1,
      strayInitialOpacity: 0.8,
      strayFadeAmount: 0.1,
      strayMinOpacity: 0.1,
      // Automode settings
      autoEnabled: true,
      autoDelay: 2000, // ms before automode starts
      autoInterval: 150, // ms between auto moves
   };

   setup() {
      this.lastDot = null;
      this.connections = [];
      this.connectionKeys = new Set();
      this.polygons = [];
      this.adjacency = new Map();
      this.strayBatches = [];

      this.config = { ...LightTrail.config };

      // Cache resolved CSS colors
      const styles = getComputedStyle(document.documentElement);
      this.lineColor = resolveCssColor(
         styles.getPropertyValue("--line-color").trim() || "#fff",
      );
      this.fillColor = resolveCssColor(
         styles.getPropertyValue("--fill-color").trim() ||
            styles.getPropertyValue("--line-color").trim() ||
            "#fff",
      );

      // Automode state
      this.autoTimeoutId = null;
      this.autoIntervalId = null;
      this.lastInteractionTime = 0;

      // Start automode after delay
      this.scheduleAutomode();

      // Keyboard handler
      this.handleKeyDown = (e) => {
         if (e.key === "d" || e.key === "D") {
            this.config.diagonal = !this.config.diagonal;
         }
      };
      document.addEventListener("keydown", this.handleKeyDown);
   }

   teardown() {
      document.removeEventListener("keydown", this.handleKeyDown);
      this.stopAutomode();
   }

   onLeaveCanvas() {
      // Only reset lastDot if automode isn't actively running
      if (!this.autoIntervalId) {
         this.lastDot = null;
      }
   }

   onDown() {
      this.reset();
   }

   reset() {
      // Stop automode during reset
      this.stopAutomode();

      // Clear all state
      this.connections = [];
      this.connectionKeys.clear();
      this.polygons = [];
      this.adjacency.clear();
      this.strayBatches = [];
      this.lastDot = null;

      // Reset all dots to base state
      this.grid.reset();

      // Restart automode
      this.scheduleAutomode();
   }

   // Automode methods
   scheduleAutomode() {
      if (!this.config.autoEnabled) return;

      this.stopAutomode();
      this.autoTimeoutId = setTimeout(() => {
         this.startAutomode();
      }, this.config.autoDelay);
   }

   startAutomode() {
      if (!this.config.autoEnabled) return;

      // Pick a random starting dot if we don't have one
      if (!this.lastDot) {
         const validDots = this.grid.dots.filter((d) => d.col > 0 || d.row > 0);
         this.lastDot = validDots[Math.floor(Math.random() * validDots.length)];
         this.highlightDot(this.lastDot);
      }

      this.autoIntervalId = setInterval(() => {
         this.autoStep();
      }, this.config.autoInterval);
   }

   stopAutomode() {
      if (this.autoTimeoutId) {
         clearTimeout(this.autoTimeoutId);
         this.autoTimeoutId = null;
      }
      if (this.autoIntervalId) {
         clearInterval(this.autoIntervalId);
         this.autoIntervalId = null;
      }
   }

   autoStep() {
      if (!this.lastDot) return;

      // Get neighbors and pick a random one, with slight bias toward unvisited
      const neighbors = this.grid.getNeighbors(
         this.lastDot,
         this.config.diagonal,
      );
      if (neighbors.length === 0) return;

      // Prefer neighbors that would create new connections
      const unconnected = neighbors.filter((n) => {
         const key = this.getConnectionKey(this.lastDot, n);
         return !this.connectionKeys.has(key);
      });

      // 70% chance to pick unconnected neighbor if available
      const candidates =
         unconnected.length > 0 && Math.random() < 0.7
            ? unconnected
            : neighbors;

      const nextDot = candidates[Math.floor(Math.random() * candidates.length)];
      this.processEnterDot(nextDot);
   }

   highlightDot(dot) {
      dot.opacity = this.grid.activeOpacity;
      dot.radius = dot.baseRadius * 1.5;
      dot.color = this.lineColor;
   }

   unhighlightDot(dot) {
      dot.opacity = this.grid.baseOpacity;
      dot.radius = dot.baseRadius;
      dot.color = null;
   }

   getConnectionKey(a, b) {
      return a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
   }

   addConnection(from, to) {
      const key = this.getConnectionKey(from, to);
      if (this.connectionKeys.has(key)) return false;

      // Validate neighbors (max 1 step apart)
      if (Math.abs(from.col - to.col) > 1 || Math.abs(from.row - to.row) > 1) {
         return false;
      }

      this.connectionKeys.add(key);
      this.connections.push({ from, to });

      if (!this.adjacency.has(from.id)) this.adjacency.set(from.id, new Set());
      if (!this.adjacency.has(to.id)) this.adjacency.set(to.id, new Set());
      this.adjacency.get(from.id).add(to.id);
      this.adjacency.get(to.id).add(from.id);

      return true;
   }

   onEnterDot(dot) {
      // User interaction - reset automode timer
      this.scheduleAutomode();
      this.processEnterDot(dot);
   }

   processEnterDot(dot) {
      this.highlightDot(dot);
      this.reactivateStrayConnections(dot);

      if (!this.lastDot || this.lastDot === dot) {
         this.lastDot = dot;
         return;
      }

      const isNeighbor = this.grid
         .getNeighbors(this.lastDot, this.config.diagonal)
         .includes(dot);

      if (isNeighbor) {
         if (this.addConnection(this.lastDot, dot)) {
            this.checkForPolygon(dot);
         }
      } else {
         const path = this.findPath(this.lastDot, dot);
         if (path.length === 0) return;

         for (const pathDot of path) {
            this.highlightDot(pathDot);
            this.reactivateStrayConnections(pathDot);
         }
         for (let i = 0; i < path.length - 1; i++) {
            if (this.addConnection(path[i], path[i + 1])) {
               this.checkForPolygon(path[i + 1]);
            }
         }
      }

      this.lastDot = dot;
   }

   reactivateStrayConnections(dot) {
      for (let i = this.strayBatches.length - 1; i >= 0; i--) {
         const batch = this.strayBatches[i];
         const toReactivate = [];
         const toKeep = [];

         for (const conn of batch.connections) {
            if (conn.from === dot || conn.to === dot) {
               toReactivate.push(conn);
            } else {
               toKeep.push(conn);
            }
         }

         for (const conn of toReactivate) {
            const key = this.getConnectionKey(conn.from, conn.to);
            if (!this.connectionKeys.has(key)) {
               this.connectionKeys.add(key);
               this.connections.push(conn);

               if (!this.adjacency.has(conn.from.id))
                  this.adjacency.set(conn.from.id, new Set());
               if (!this.adjacency.has(conn.to.id))
                  this.adjacency.set(conn.to.id, new Set());
               this.adjacency.get(conn.from.id).add(conn.to.id);
               this.adjacency.get(conn.to.id).add(conn.from.id);

               this.highlightDot(conn.from);
               this.highlightDot(conn.to);
               batch.dots.delete(conn.from);
               batch.dots.delete(conn.to);
            }
         }

         batch.connections = toKeep;

         if (batch.connections.length === 0 && batch.dots.size === 0) {
            this.strayBatches.splice(i, 1);
         }
      }
   }

   findPath(fromDot, toDot) {
      // A* pathfinding
      const heuristic = (dot) => {
         const dx = toDot.x - dot.x;
         const dy = toDot.y - dot.y;
         return Math.sqrt(dx * dx + dy * dy);
      };

      const openSet = [fromDot];
      const cameFrom = new Map();
      const gScore = new Map([[fromDot.id, 0]]);
      const fScore = new Map([[fromDot.id, heuristic(fromDot)]]);
      const closedSet = new Set();

      while (openSet.length > 0) {
         openSet.sort(
            (a, b) =>
               (fScore.get(a.id) ?? Infinity) - (fScore.get(b.id) ?? Infinity),
         );
         const current = openSet.shift();

         if (current === toDot) {
            const path = [];
            let step = toDot;
            while (step) {
               path.push(step);
               step = cameFrom.get(step.id);
            }
            return path.reverse();
         }

         closedSet.add(current.id);

         for (const neighbor of this.grid.getNeighbors(
            current,
            this.config.diagonal,
         )) {
            if (closedSet.has(neighbor.id)) continue;

            const dx = Math.abs(neighbor.col - current.col);
            const dy = Math.abs(neighbor.row - current.row);
            const moveCost = dx + dy === 2 ? 1.414 : 1;
            const tentativeG = (gScore.get(current.id) ?? Infinity) + moveCost;

            if (!openSet.includes(neighbor)) {
               openSet.push(neighbor);
            } else if (tentativeG >= (gScore.get(neighbor.id) ?? Infinity)) {
               continue;
            }

            cameFrom.set(neighbor.id, current);
            gScore.set(neighbor.id, tentativeG);
            fScore.set(neighbor.id, tentativeG + heuristic(neighbor));
         }
      }

      return [];
   }

   checkForPolygon(dot) {
      const neighbors = this.adjacency.get(dot.id);
      if (!neighbors || neighbors.size < 2) return;

      const neighborIds = Array.from(neighbors);
      for (let i = 0; i < neighborIds.length; i++) {
         for (let j = i + 1; j < neighborIds.length; j++) {
            const path = this.findPathInGraph(
               neighborIds[i],
               neighborIds[j],
               dot.id,
            );
            if (path) {
               const cycleDots = [dot, ...path.map((id) => this.grid.dots[id])];
               this.handlePolygon(cycleDots);
               return;
            }
         }
      }
   }

   findPathInGraph(fromId, toId, excludeId) {
      const queue = [[fromId]];
      const visited = new Set([fromId, excludeId]);

      while (queue.length > 0) {
         const path = queue.shift();
         const current = path[path.length - 1];

         if (current === toId) return path;

         const neighbors = this.adjacency.get(current);
         if (!neighbors) continue;

         for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
               visited.add(neighborId);
               queue.push([...path, neighborId]);
            }
         }
      }

      return null;
   }

   handlePolygon(polygonDots) {
      const polygonKeys = new Set();
      const polygonDotIds = new Set(polygonDots.map((d) => d.id));

      for (let i = 0; i < polygonDots.length; i++) {
         const from = polygonDots[i];
         const to = polygonDots[(i + 1) % polygonDots.length];
         polygonKeys.add(this.getConnectionKey(from, to));
      }

      // Separate polygon connections from strays
      const strayConnections = [];
      const strayDots = new Set();

      for (const conn of this.connections) {
         const key = this.getConnectionKey(conn.from, conn.to);
         if (polygonKeys.has(key)) {
            this.connectionKeys.delete(key);
         } else {
            strayConnections.push(conn);
            this.connectionKeys.delete(key);
            if (!polygonDotIds.has(conn.from.id)) strayDots.add(conn.from);
            if (!polygonDotIds.has(conn.to.id)) strayDots.add(conn.to);
         }
      }

      this.connections = [];
      this.adjacency.clear();

      // Age existing stray batches
      const { strayFadeAmount, strayMinOpacity, strayInitialOpacity } =
         this.config;
      for (const batch of this.strayBatches) {
         batch.opacity = Math.max(
            strayMinOpacity,
            batch.opacity - strayFadeAmount,
         );
         for (const dot of batch.dots) {
            dot.opacity = batch.opacity * this.grid.activeOpacity;
            dot.radius = dot.baseRadius * (1 + batch.opacity * 0.5);
            dot.color = this.lineColor;
         }
      }

      // Add new stray batch
      if (strayConnections.length > 0 || strayDots.size > 0) {
         this.strayBatches.push({
            connections: strayConnections,
            dots: strayDots,
            opacity: strayInitialOpacity,
         });
         for (const dot of strayDots) {
            dot.opacity = strayInitialOpacity * this.grid.activeOpacity;
            dot.radius = dot.baseRadius * 1.45;
            dot.color = this.lineColor;
         }
      }

      // Unhighlight polygon dots
      for (const dot of polygonDots) {
         this.unhighlightDot(dot);
      }

      // Store polygon
      this.polygons.push({
         dots: polygonDots,
         alpha: this.config.polygonOpacity,
      });
   }

   getExtendedPoint(dot) {
      const maxCol = this.grid.cols - 1;
      const maxRow = this.grid.rows - 1;
      let x = dot.x;
      let y = dot.y;

      if (dot.col === 0) x = 0;
      if (dot.row === 0) y = 0;
      if (dot.col === maxCol) x = this.renderer.width;
      if (dot.row === maxRow) y = this.renderer.height;

      return { x, y };
   }

   drawBackground(ctx) {
      for (const polygon of this.polygons) {
         ctx.beginPath();
         const first = this.getExtendedPoint(polygon.dots[0]);
         ctx.moveTo(first.x, first.y);
         for (let i = 1; i < polygon.dots.length; i++) {
            const pt = this.getExtendedPoint(polygon.dots[i]);
            ctx.lineTo(pt.x, pt.y);
         }
         ctx.closePath();
         ctx.globalAlpha = polygon.alpha;
         ctx.fillStyle = this.fillColor;
         ctx.fill();
      }
      ctx.globalAlpha = 1;
   }

   draw(ctx) {
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      // Draw stray connections
      for (const batch of this.strayBatches) {
         ctx.strokeStyle = this.lineColor;
         ctx.globalAlpha = batch.opacity;
         for (const { from, to } of batch.connections) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
         }
      }
      ctx.globalAlpha = 1;

      // Draw active connections
      ctx.strokeStyle = this.lineColor;
      for (const { from, to } of this.connections) {
         ctx.beginPath();
         ctx.moveTo(from.x, from.y);
         ctx.lineTo(to.x, to.y);
         ctx.stroke();
      }
   }
}
