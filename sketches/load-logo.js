// Load logo SVG inline so we can manipulate fill and stroke with CSS
fetch('../img/logo.svg')
  .then(response => response.text())
  .then(svg => {
    document.getElementById('logo').innerHTML = svg;
  });
