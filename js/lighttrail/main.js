import { Grid } from "./core/Grid.js";
import { Renderer } from "./core/Renderer.js";
import { Input } from "./core/Input.js";
import { resolveCssColor } from "./core/utils.js";
import { LightTrail } from "./experiments/LightTrail.js";

class PlaygroundApp {
   constructor() {
      this.canvas = document.getElementById("lighttrail-canvas");
      if (!this.canvas) return;

      const styles = getComputedStyle(document.documentElement);
      const dotSize = parseFloat(styles.getPropertyValue("--dot-size")) || 2;
      const cellSize = parseFloat(styles.getPropertyValue("--grid-cell-size")) || 48;
      const rawDotColor = styles.getPropertyValue("--dot-color").trim() || "#ffffff";
      const dotColor = resolveCssColor(rawDotColor);

      this.grid = new Grid({
         dotRadius: dotSize,
         spacing: cellSize,
         color: dotColor,
      });

      this.renderer = new Renderer(this.canvas, this.grid);
      this.input = new Input(this.canvas, this.grid);

      this.loadExperiment();
      this.renderer.start();
   }

   loadExperiment() {
      const experiment = new LightTrail(this.grid, this.renderer);
      this.renderer.setExperiment(experiment);
      this.input.setExperiment(experiment);
   }
}

document.addEventListener("DOMContentLoaded", () => {
   new PlaygroundApp();
});
