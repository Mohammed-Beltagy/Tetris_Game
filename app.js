const grid = document.getElementById("grid"),
  background = grid.querySelector(".background");
let unit = parseFloat(getComputedStyle(grid).getPropertyValue("--unit"));
for (let i = 1; i <= 20; i++) {
  let horizontalLine = document.createElement("div");
  horizontalLine.className = "horizontal-line";
  horizontalLine.style.bottom = `${i * unit}px`;
  background.append(horizontalLine);
}
for (let i = 1; i <= 10; i++) {
  let verticalLine = document.createElement("div");
  verticalLine.className = "vertical-line";
  verticalLine.style.left = `${i * unit}px`;
  background.append(verticalLine);
}
