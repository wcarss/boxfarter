import palettes from "./palette.js";

function setup() {
  let _globalContext = null,
    setupContext = function() {
      let canvas = document.getElementById("canvas");
      let unknown_chrome_height_thing = 4;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - unknown_chrome_height_thing;
      return canvas.getContext("2d");
    },
    getContext = function() {
      return _globalContext;
    },
    setContext = function(context) {
      _globalContext = context;
      return _globalContext;
    },
    ctx = setContext(setupContext()),
    width = window.innerWidth,
    height = window.innerHeight - 4,
    playerPlaced = false,
    player = {
      x: width / 2,
      y: height - 15,
      lastx: width / 2,
      lasty: height - 15,
      width: 25,
      height: 25,
      speed: 16,
      velX: 0,
      velY: 0,
      jumping: false,
      grounded: false
    },
    friction = 0.8,
    gravity = 0.3,
    placingBox = false,
    touch = [],
    keys = [],
    moveBoxes = true,
    boxScrollSpeed = randomSelection([0.1, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 3]),
    boxScrollTimer = randomSelection([25, 40, 40]);

  var boxes = [];

  // dimensions
  // left wall
  boxes.push({
    x: 0,
    y: 0,
    width: 10,
    height: height,
    color: "black",
    name: "lwall"
  });

  // floor
  boxes.push({
    x: 0,
    y: height - 10,
    width: width,
    height: 50,
    color: "black",
    name: "floor"
  });

  // right wall
  boxes.push({
    x: width - 10,
    y: 0,
    width: 50,
    height: height,
    color: "black",
    name: "rwall"
  });

  let boxCounts = [10, 10, 25, 25, 25, 25, 10, 10, 10, 10, 25, 25, 70, 70];
  let numBoxes = randomSelection(boxCounts);
  let paletteSource = randomSelection(palettes);
  let bgColorIndex = randomNumber(paletteSource.length);
  let backgroundColor = paletteSource[bgColorIndex];
  paletteSource.splice(bgColorIndex, 1);
  let palette = paletteSource;
  for (let boxInc = 0; boxInc < numBoxes; boxInc++) {
    let widths = [40, 80, 40, 80, 40, 40, 40, 80, 40, 80, 400],
      heights = [40, 80, 40, 80, 40, 40, 40, 80, 40, 80, 400];

    boxes.push({
      x: randomNumber(width - 20) + 10,
      y: randomNumber(height - 20) + 10,
      width: randomSelection(widths),
      height: randomSelection(heights),
      color: randomSelection(palette),
      speed: randomSelection([-5, -5, -3, -1, 0, 1, 1, 1, 2, 2, 4, 4, 8, 8, 20])
    });
  }

  let winBox = false,
    newBox = {
      x: randomNumber(width - 20) + 10,
      y: randomNumber(height - 20) + 10,
      width: 30,
      height: 30,
      color: "gold",
      name: "win",
      speed: randomSelection([-5, -1, 0, 1, 1, 1, 1, 2, 2, 2, 4, 4, 8, 20])
    };

  while (!winBox) {
    winBox = true;
    for (let boxInc = 0; boxInc < boxes.length; boxInc++) {
      if (colCheck(newBox, boxes[boxInc])) {
        newBox["x"] = randomNumber(width - 20) + 10;
        winBox = false;
        break;
      }
    }
  }
  boxes.push(newBox);
  console.log(boxes);

  while (!playerPlaced) {
    playerPlaced = true;
    for (let boxInc = 0; boxInc < boxes.length; boxInc++) {
      if (colCheck(player, boxes[boxInc])) {
        player["y"] = randomNumber(height - 20) + 10;
        playerPlaced = false;
        break;
      }
    }
  }

  function randomNumber(range) {
    return parseInt(Math.floor(Math.random() * range));
  }

  function randomSelection(array) {
    return array[randomNumber(array.length)];
  }

  function update() {
    // check keys
    if (keys[38]) {
      // up arrow
      if (player.grounded) {
        placingBox = false;
      }
      if (!placingBox) {
        placingBox = true;
        player.grounded = false;
        player.velY = -player.speed * 0.5;
        setTimeout(function() {
          placingBox = false;
        }, 450);
      }
    }
    if (keys[39]) {
      // right arrow
      if (player.velX < player.speed) {
        player.velX += 2;
      }
    }
    if (keys[37]) {
      // left arrow
      if (player.velX > -player.speed) {
        player.velX -= 2;
      }
    }
    if (keys[32]) {
      if (placingBox === false) {
        placingBox = true;
        //  setTimeout(function() {
        //    boxes.push({
        //      x: player.x,
        //      y: player.y + player.height,
        //      width: player.width - 2,
        //      height: player.height - 2,
        //      color: "black",
        //      speed: randomSelection([-2, -1, 0, 1, 1, 1, 1, 2, 2, 2, 4, 4])
        //    });
        // }, 20);
        //setTimeout(function() {
        //  placingBox = false;
        //}, 350);
      }
    }

    if (moveBoxes) {
      moveBoxes = false;
      for (let boxInc = 0; boxInc < boxes.length; boxInc++) {
        if (
          boxes[boxInc].name !== "floor" &&
          boxes[boxInc].name !== "lwall" &&
          boxes[boxInc].name !== "rwall"
        ) {
          boxes[boxInc].x -= boxScrollSpeed * boxes[boxInc].speed;
          if (boxes[boxInc].x <= -10) {
            boxes[boxInc].x = width;
          }
        }
      }
      setTimeout(() => (moveBoxes = true), boxScrollTimer);
    }

    if (touch["happening"]) {
      console.log(touch);
      if (touch["x"] < player.x) {
        player.velX = -player.speed;
      } else if (touch["x"] > player.x) {
        player.velX = player.speed;
      }
      if (!player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velY = -player.speed * 0.75;
        placingBox = true;
        setTimeout(function() {
          placingBox = false;
        }, 500);
      } else {
        if (placingBox === false) {
          placingBox = true;
          //  setTimeout(function() {
          //    boxes.push({
          //      x: player.x,
          //      y: player.y,
          //      width: player.width,
          //      height: player.height,
          //      color: "red"
          //    });
          //  }, 20);
          setTimeout(function() {
            placingBox = false;
          }, 350);
        }
      }
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    player.velX *= friction;
    player.velY += gravity;

    player.grounded = false;
    for (var i = 0; i < boxes.length; i++) {
      ctx.fillStyle = boxes[i].color;
      ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      var dir = colCheck(player, boxes[i]);

      if (dir === "win") {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        setup();
        return;
      } else if (dir === "l" || dir === "r") {
        player.velX = 0;
        player.jumping = false;
      } else if (dir === "b") {
        player.grounded = true;
        player.jumping = false;
      } else if (dir === "t") {
        player.velY *= -0.4;
      }
    }

    if (player.grounded) {
      player.velY = 0;
    }

    player.lastx = player.x;
    player.lasty = player.y;
    player.x += player.velX;
    player.y += player.velY;

    ctx.fillStyle = "red";
    //ctx.clearRect(player.lastx-1, player.lasty-1, player.width+2, player.height+2);
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
  }

  function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = shapeA.x + shapeA.width / 2 - (shapeB.x + shapeB.width / 2),
      vY = shapeA.y + shapeA.height / 2 - (shapeB.y + shapeB.height / 2),
      // add the half widths and half heights of the objects
      hWidths = shapeA.width / 2 + shapeB.width / 2,
      hHeights = shapeA.height / 2 + shapeB.height / 2,
      colDir = null;

    // if the x and y vectors are less than the half width or half height, they must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      // figures out on which side we are colliding (top, bottom, left, or right
      var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);

      if (shapeB.name === "win") {
        colDir = "win";
      } else if (oX >= oY) {
        if (vY > 0) {
          colDir = "t";
          shapeA.lasty = shapeA.y;
          shapeA.y += oY;
        } else {
          colDir = "b";
          shapeA.lasty = shapeA.y;
          shapeA.y -= oY;
        }
      } else {
        if (vX > 0) {
          colDir = "l";
          shapeA.lastx = shapeA.x;
          shapeA.x += oX;
        } else {
          colDir = "r";
          shapeA.lastx = shapeA.x;
          shapeA.x -= oX;
        }
      }
    }
    if (colDir && (shapeA.name === "win" || shapeB.name === "win")) {
      console.log("win collision, shapeA: ", shapeA, ", shapeB: ", shapeB);
    }
    return colDir;
  }

  document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
  });

  document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
  });

  /*  document.body.addEventListener("touchstart", function (e) {
    touch['happening'] = true;
    touch['x'] = e.touches[0].screenX;
    touch['y'] = e.touches[0].screenY;
  })

  document.body.addEventListener("touchend", function(e) {  
    touch['happening'] = false;
    delete(touch['x']);
    delete(touch['y']);
  });
*/

  document.body.addEventListener("mousedown", function(e) {
    touch["happening"] = true;
    touch["x"] = e.screenX;
    touch["y"] = e.screenY;
  });

  document.body.addEventListener("mouseup", function(e) {
    touch["happening"] = false;
    delete touch["x"];
    delete touch["y"];
  });

  window.addEventListener("resize", function() {
    setContext(setupContext());
  });

  update();
}

window.addEventListener("load", function(e) {
  setup();
});
