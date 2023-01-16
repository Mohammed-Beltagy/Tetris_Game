const grid = document.getElementById("grid"),
  background = grid.querySelector(".background"), // for grid design
  playground = grid.querySelector(".playground"); // for inserting block

// Get the with of Cells from CSS.. Depends on Screen Size
let unit = parseFloat(getComputedStyle(grid).getPropertyValue("--unit"));
// Create the Background of the game
let colsCount = 11,
  rowsCount = 21;
for (let i = 1; i < rowsCount; i++) {
  let horizontalLine = document.createElement("div");
  horizontalLine.className = "horizontal-line";
  horizontalLine.style.bottom = `${i * unit}px`;
  background.append(horizontalLine);
}
for (let i = 1; i < colsCount; i++) {
  let verticalLine = document.createElement("div");
  verticalLine.className = "vertical-line";
  verticalLine.style.left = `${i * unit}px`;
  background.append(verticalLine);
}

// Create Grid from arrs to save the position of block
let gridCols; // gridCols[x,y]
function resetGrid() {
  gridCols = new Array();
  // create cols
  for (let i = 0; i < colsCount; i++) {
    let col = new Array();
    // create Empty Cells in every col
    for (let i = 0; i < rowsCount; i++) {
      col.push(undefined);
    }
    gridCols.push(col);
  }
}

// will be changed to true if the is no space for the current block
let colIsFull = false;

// Create the (Square) block
class Smashboy {
  constructor() {
    this.color = "green";
    this.cells = new Array(); // cells will be added on creating the block
    this.cellsShadow = new Array(); // shadow will be added on creating the block
    // the position of every cell [x,y]
    this.cellsPosByPixel = [
      { x: 5 * unit, y: unit * -1 },
      { x: 6 * unit, y: unit * -1 },
      { x: 5 * unit, y: 0 },
      { x: 6 * unit, y: 0 },
    ];
    this.cellsPosByIndex = [
      { x: 5, y: -1 },
      { x: 6, y: -1 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
    ];
    this.cellsShadowIndex = [];
    this.autoFall; // interval to fall down
    this.fallTime = 1000;
    this.stopped = false;
  }
  createBlock() {
    // create the Cells
    for (let i = 0; i < 4; i++) {
      let cell = document.createElement("div");

      cell.classList = "cell";
      cell.style.backgroundColor = this.color;

      playground.append(cell);
      this.cells.push(cell);
    }
    // create the Cells Shadow
    for (let i = 0; i < 4; i++) {
      let shadow = document.createElement("div");

      shadow.classList = "cell-shadow";
      shadow.style.backgroundColor = this.color;

      background.append(shadow);
      this.cellsShadow.push(shadow);
    }
    // append Cells to the Array
    this.cells.forEach((cell, index) => {
      // position every cell depending on (cellsPos) Array
      cell.style.left = this.cellsPosByPixel[index].x + "px";
      cell.style.top = this.cellsPosByPixel[index].y + "px";
      // position every cell in (gridCols) Array
      let posInArr = this.cellsPosByIndex[index];
      // check if the position is free
      if (gridCols[posInArr.x][posInArr.y] == undefined) {
        gridCols[posInArr.x][posInArr.y] = cell;
      } else {
        colIsFull = true;
      }
    });
    // Check If Losed Or Not
    if (colIsFull) {
      endGame();
      this.cellsShadow.forEach((cellShadow) => {
        cellShadow.remove();
      });
    } else {
      this.setShadow();
      this.startMove();
    }
  }
  setShadow() {
    // set default value for shadow pos
    for (let i = 0; i < 4; i++) {
      let cellx = `${this.cellsPosByIndex[i].x}`,
        celly = `${this.cellsPosByIndex[i].y}`,
        pos = {
          x: parseInt(cellx),
          y: parseInt(celly),
        };
      this.cellsShadowIndex[i] = pos;
    }
    // check for the height cell
    for (let i = 0; i < 4; i++) {
      if (
        (gridCols[this.cellsShadowIndex[i].x][this.cellsShadowIndex[i].y] ===
          undefined ||
          this.cells.includes(
            gridCols[this.cellsShadowIndex[i].x][this.cellsShadowIndex[i].y]
          )) &&
        this.cellsShadowIndex[i].y < rowsCount
      ) {
        if (i == 3) {
          this.cellsShadowIndex.forEach((shadowPos) => {
            shadowPos.y += 1;
          });
          i = -1;
        }
      } else {
        this.cellsShadowIndex.forEach((shadowPos) => {
          shadowPos.y -= 1;
        });
        this.cellsShadowIndex.forEach((shadowPos, index) => {
          this.cellsShadow[index].style.left = shadowPos.x * unit + "px";
          this.cellsShadow[index].style.top = shadowPos.y * unit + "px";
        });
        break;
      }
    }
  }

  startMove() {
    // Auto Fall Interval
    this.autoFall = setInterval(() => {
      this.move("down");
    }, this.fallTime);
  }
  resetFallInterval() {
    clearInterval(this.autoFall);
    this.startMove();
  }
  stopBlock() {
    this.stopped = true;
    // clear fall interval
    clearInterval(this.autoFall);
    // remove the shadow from body
    this.cellsShadow.forEach((cellShadow) => {
      cellShadow.remove();
    });
    // create new block
    checkIfCompleted();
    newBlock();
  }

  /*  remove the block cells from (gridCols)
      => so you can change the position and add cells again */
  removeFromGrid() {
    this.cells.forEach((cell, index) => {
      gridCols[this.cellsPosByIndex[index].x][this.cellsPosByIndex[index].y] =
        undefined;
    });
  }
  // modify (cellsPosByPx) , (style.left & style.top) & (gridCols) depending on (cellsPosByIndex)
  changePos() {
    this.cellsPosByIndex.forEach((cellPos, index) => {
      // modify (gridCols)
      gridCols[cellPos.x][cellPos.y] = this.cells[index];
      // modify (cellsPosByPx)
      this.cellsPosByPixel[index].x = cellPos.x * unit;
      this.cellsPosByPixel[index].y = cellPos.y * unit;
      // modify (style)
      this.cells[index].style.left = this.cellsPosByPixel[index].x + "px";
      this.cells[index].style.top = this.cellsPosByPixel[index].y + "px";
    });
  }

  move(direction) {
    // Move To Specific Direction If The Space Is Free And The Block Didn't Reach To Bottom
    if (direction === "rotate") {
      this.rotate();
    } else if (direction === "down") {
      if (this.stuckedDown()) {
        this.stopBlock();
      } else {
        // remove the block from the grid
        this.removeFromGrid();
        // modify the position to the new position
        this.cellsPosByIndex.forEach((cellPox) => {
          cellPox.y += 1;
        });
        // refresh the postion
        this.changePos();
      }
    }
    if (direction === "left") {
      if (this.stuckedLeft()) {
        return;
      } else {
        // remove the block from the grid
        this.removeFromGrid();
        // modify the position to the new position
        this.cellsPosByIndex.forEach((cellPox) => {
          cellPox.x -= 1;
        });
        // refresh the postion
        this.changePos();
      }
    }
    if (direction === "right") {
      if (this.stuckedRight()) {
        return;
      } else {
        // remove the block from the grid
        this.removeFromGrid();
        // modify the position to the new position
        this.cellsPosByIndex.forEach((cellPox) => {
          cellPox.x += 1;
        });
        // refresh the postion
        this.changePos();
      }
    }
    // reposition the shadow
    this.setShadow();
  }
  rotate() {
    return;
  }

  stuckedDown() {
    let stucked = false;
    let bottomIndex = 0; // get the lower cell index
    this.cellsPosByIndex.forEach((cellPos) => {
      if (cellPos.y > bottomIndex) {
        bottomIndex = cellPos.y;
      }
    });
    // check if there is no space under than the bottom cells
    this.cellsPosByIndex.forEach((cellPos) => {
      if (
        cellPos.y === bottomIndex &&
        (cellPos.y >= rowsCount - 1 ||
          gridCols[cellPos.x][cellPos.y + 1] != undefined)
      ) {
        stucked = true;
      }
    });
    return stucked;
  }
  stuckedLeft() {
    let stucked = false,
      leftIndex = colsCount - 1; // get the left-side cell index
    this.cellsPosByIndex.forEach((cellPos) => {
      if (cellPos.x <= leftIndex) {
        leftIndex = cellPos.x;
      }
    });
    // check if there is no space left than the left cells
    this.cellsPosByIndex.forEach((cellPos) => {
      if (
        cellPos.x === leftIndex &&
        (cellPos.x <= 0 || gridCols[cellPos.x - 1][cellPos.y] != undefined)
      ) {
        stucked = true;
      }
    });
    return stucked;
  }
  stuckedRight() {
    let stucked = false,
      rightIndex = 0; // get the right-side cell index
    this.cellsPosByIndex.forEach((cellPos) => {
      if (cellPos.x > rightIndex) {
        rightIndex = cellPos.x;
      }
    });
    // check if there is no space right than the right cells
    this.cellsPosByIndex.forEach((cellPos) => {
      if (
        cellPos.x === rightIndex &&
        (cellPos.x >= colsCount - 1 ||
          gridCols[cellPos.x + 1][cellPos.y] != undefined)
      ) {
        stucked = true;
      }
    });
    return stucked;
  }
}

// Create the (Row) block
class Hero extends Smashboy {
  constructor() {
    super();
    this.color = "darkviolet";
    this.cells = new Array(); // cells will be added on creating the block
    // the position of every cell [x,y]
    this.cellsPosByPixel = [
      { x: 4 * unit, y: 0 },
      { x: 5 * unit, y: 0 },
      { x: 6 * unit, y: 0 },
      { x: 7 * unit, y: 0 },
    ];
    this.cellsPosByIndex = [
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
    ];
    this.cellsShadowIndex = [];
    this.autoFall; // interval to fall down
    this.fallTime = 1000;
    this.stopped = false;
    this.angle = 0; // used for (rotate) function
  }

  // rotate function
  rotate() {
    if (this.angle == 0) {
      // switch from horizontal to vertical

      // remove the block from the grid
      this.removeFromGrid();

      // change the position by index
      /* if the space is free aroun cell[1] the rotate around it
      else if the space is free aroun cell[2] the rotate around it
         else do nothing */
      if (
        gridCols[this.cellsPosByIndex[1].x][this.cellsPosByIndex[1].y + 1] ==
          undefined &&
        gridCols[this.cellsPosByIndex[1].x][this.cellsPosByIndex[1].y - 1] ==
          undefined &&
        gridCols[this.cellsPosByIndex[1].x][this.cellsPosByIndex[1].y - 2] ==
          undefined &&
        this.cellsPosByIndex[1].y < rowsCount - 1
      ) {
        this.cellsPosByIndex[0].x += 1;
        this.cellsPosByIndex[0].y += 1;

        this.cellsPosByIndex[2].x -= 1;
        this.cellsPosByIndex[2].y -= 1;

        this.cellsPosByIndex[3].x -= 2;
        this.cellsPosByIndex[3].y -= 2;

        this.angle = 90;
      } else if (
        gridCols[this.cellsPosByIndex[2].x][this.cellsPosByIndex[2].y + 1] ==
          undefined &&
        gridCols[this.cellsPosByIndex[2].x][this.cellsPosByIndex[2].y - 1] ==
          undefined &&
        gridCols[this.cellsPosByIndex[2].x][this.cellsPosByIndex[2].y - 2] ==
          undefined &&
        this.cellsPosByIndex[2].y < rowsCount - 1
      ) {
        this.cellsPosByIndex[0].x += 2;
        this.cellsPosByIndex[0].y += 1;

        this.cellsPosByIndex[1].x += 1;

        this.cellsPosByIndex[2].y -= 1;

        this.cellsPosByIndex[3].x -= 1;
        this.cellsPosByIndex[3].y -= 2;

        this.angle = 90;
      }

      // refresh the position
      this.changePos();
    } else {
      // switch from vertical to horizontal

      // remove the block from the grid
      this.removeFromGrid();

      // change the position by index
      /* if the space is free aroun cell[1] the rotate around it
         else if the space is free aroun cell[0] the rotate around it
         else do nothing */
      if (
        gridCols[this.cellsPosByIndex[1].x - 1][this.cellsPosByIndex[1].y] ==
          undefined &&
        gridCols[this.cellsPosByIndex[1].x + 1][this.cellsPosByIndex[1].y] ==
          undefined &&
        gridCols[this.cellsPosByIndex[1].x + 2][this.cellsPosByIndex[1].y] ==
          undefined
      ) {
        this.cellsPosByIndex[0].x -= 1;
        this.cellsPosByIndex[0].y -= 1;

        this.cellsPosByIndex[2].x += 1;
        this.cellsPosByIndex[2].y += 1;

        this.cellsPosByIndex[3].x += 2;
        this.cellsPosByIndex[3].y += 2;

        this.angle = 0;
      } else if (
        gridCols[this.cellsPosByIndex[0].x - 1][this.cellsPosByIndex[0].y] ==
          undefined &&
        gridCols[this.cellsPosByIndex[0].x + 1][this.cellsPosByIndex[0].y] ==
          undefined &&
        gridCols[this.cellsPosByIndex[0].x + 2][this.cellsPosByIndex[0].y] ==
          undefined
      ) {
        this.cellsPosByIndex[0].x -= 1;

        this.cellsPosByIndex[1].y += 1;

        this.cellsPosByIndex[2].x += 1;
        this.cellsPosByIndex[2].y += 2;

        this.cellsPosByIndex[3].x += 2;
        this.cellsPosByIndex[3].y += 3;

        this.angle = 0;
      }

      // refresh the position
      this.changePos();
    }
  }
}

// Insert a new random block
let blocks = [Smashboy, Hero],
  currentBlock;
function newBlock() {
  currentBlock = new blocks[Math.floor(Math.random() * 2)]();
  currentBlock.createBlock();
}

// end the game
let score = 0;
function endGame() {
  grid.querySelector(".game-alert h1").innerText = `Score: ${score}`;
  grid.querySelector(".game-alert button").innerText = "Try Again";
  grid.querySelector(".game-alert").style.display = "flex";
}

// Start Game
grid.querySelector(".game-alert button").onclick = function () {
  playground.innerHTML = "";
  resetGrid();
  colIsFull = false;
  this.parentElement.style.display = "none";
  newBlock();
};

// Adding Controls To Current Block
window.addEventListener("keydown", (e) => {
  if (currentBlock.stopped || colIsFull === true) {
    return;
  }
  switch (e.keyCode) {
    case 83: /// s
    case 40: // down arrow
      // Reset the ramain time to fall down > move down
      currentBlock.resetFallInterval();
      currentBlock.move("down");
      break;
    case 65: // a
    case 37: // left arrow
      currentBlock.move("left");
      break;
    case 68: // d
    case 39: // right arrow
      currentBlock.move("right");
      break;
    case 87: // w
    case 38: // up arrow
      currentBlock.move("rotate");
      break;
    case 32: // space
      currentBlock.fallTime = 0;
      currentBlock.resetFallInterval();
      break;
  }
});

// Check If There Are Completed Rows
function checkIfCompleted() {
  const completedRowsIndex = new Array();
  // loop on the rows
  for (let i = 0; i < rowsCount; i++) {
    // loop on the cells in the row
    for (let c = 0; c < colsCount; c++) {
      /* if the cell is free break the loop in the row
          else => if this is the last cell and not free push Row Index into the Array*/
      if (gridCols[c][i] === undefined) {
        break;
      } else if (c == colsCount - 1) {
        completedRowsIndex.push(i);
      }
    }
  }
  // remove completed rows
  if (completedRowsIndex.length > 0) {
    for (let i = 0; i < completedRowsIndex.length; i++) {
      // delete cells from Grid and Body
      for (let c = 0; c < colsCount; c++) {
        gridCols[c][completedRowsIndex[i]].remove();
        delete gridCols[c][completedRowsIndex[i]];
      }
      // make the heigher rows fall down
      for (let r = completedRowsIndex[i]; r >= 0; r--) {
        for (let c = 0; c < colsCount; c++) {
          // if there are any cell heigher make it fall down
          if (gridCols[c][r - 1] != undefined) {
            gridCols[c][r - 1].style.top = r * unit + "px";
          }
          // change the pos in grid even if undefined
          gridCols[c][r] = gridCols[c][r - 1];
        }
      }
    }
  }

  score += completedRowsIndex.length * 16;
}
