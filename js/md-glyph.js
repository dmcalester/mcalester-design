const BRAILLE = Object.freeze({
   a: [1, 0, 0, 0, 0, 0],
   b: [1, 1, 0, 0, 0, 0],
   c: [1, 0, 0, 1, 0, 0],
   d: [1, 0, 0, 1, 1, 0],
   e: [1, 0, 0, 0, 1, 0],
   f: [1, 1, 0, 1, 0, 0],
   g: [1, 1, 0, 1, 1, 0],
   h: [1, 1, 0, 0, 1, 0],
   i: [0, 1, 0, 1, 0, 0],
   j: [0, 1, 0, 1, 1, 0],
   k: [1, 0, 1, 0, 0, 0],
   l: [1, 1, 1, 0, 0, 0],
   m: [1, 0, 1, 1, 0, 0],
   n: [1, 0, 1, 1, 1, 0],
   o: [1, 0, 1, 0, 1, 0],
   p: [1, 1, 1, 1, 0, 0],
   q: [1, 1, 1, 1, 1, 0],
   r: [1, 1, 1, 0, 1, 0],
   s: [0, 1, 1, 1, 0, 0],
   t: [0, 1, 1, 1, 1, 0],
   u: [1, 0, 1, 0, 0, 1],
   v: [1, 1, 1, 0, 0, 1],
   w: [0, 1, 0, 1, 1, 1],
   x: [1, 0, 1, 1, 0, 1],
   y: [1, 0, 1, 1, 1, 1],
   z: [1, 0, 1, 0, 1, 1],
});

class MdGlyph extends HTMLElement {
   static observedAttributes = ["source"];

   constructor() {
      super();
      this.attachShadow({ mode: "open" });
   }

   connectedCallback() {
      this.render();
   }

   attributeChangedCallback() {
      this.render();
   }

   createBrailleCell(letter) {
      const pattern = BRAILLE[letter.toLowerCase()] || [0, 0, 0, 0, 0, 0];
      const fill = (index) => (pattern[index] ? "#FFF" : "none");
      const strokeWidth = "2px";

      return `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="96 viewbox="0 0 60 96">
            <circle cx="47.5" cy="83.5" r="12.5" fill="${fill(0)}" stroke="#FFF" stroke-width="${strokeWidth}" />
            <circle cx="12.5" cy="83.5" r="12.5" fill="${fill(1)}" stroke="#FFF" stroke-width="${strokeWidth}" />
            <circle cx="47.5" cy="48" r="12.5" fill="${fill(2)}" stroke="#FFF" stroke-width="${strokeWidth}" />
            <circle cx="12.5" cy="48" r="12.5" fill="${fill(3)}" stroke="#FFF" stroke-width="${strokeWidth}" />
            <circle cx="47.5" cy="12.5" r="12.5" fill="${fill(4)}" stroke="#FFF" stroke-width="${strokeWidth}" />
            <circle cx="12.5" cy="12.5" r="12.5" fill="${fill(5)}" stroke="#FFF" stroke-width="${strokeWidth}" />
         </svg>
      `;
   }

   render() {
      const source = this.getAttribute("source") || "";

      const cells = source
         .split("")
         .map((letter) => this.createBrailleCell(letter))
         .join("");

      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 10px;


          margin: -10px 0 0 0;
          padding: 0;
          height: 48px;
          width: 65px;
          outline: 1px solid #fff;

        }
        svg {
          fill: currentColor;
          height:48px;
          width:96px;
        }
      </style>
      ${cells}
    `;
   }
}

customElements.define("md-glyph", MdGlyph);
