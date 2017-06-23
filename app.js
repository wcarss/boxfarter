function setup() {
  let _globalContext = null,
  setupContext = function () {
    let canvas = document.getElementById("canvas");
    let unknown_chrome_height_thing = 4;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-unknown_chrome_height_thing;
    return canvas.getContext("2d");
  },
  getContext = function () {
    return _globalContext;
  },
  setContext = function (context) {
    _globalContext = context;
    return _globalContext;
  },
  ctx = setContext(setupContext()),
  width = window.innerWidth,
  height = window.innerHeight - 4,
  player = {
    x: width / 2,
    y: height - 15,
    lastx: width / 2,
    lasty: height - 15,
    width: 25,
    height: 25,
    speed: 12,
    velX: 0,
    velY: 0,
    jumping: false,
    grounded: false
  },
  friction = 0.8,
  gravity = 0.3,
  placingBox = false,
  touch = [],
  keys = [];

  var boxes = [];

  // dimensions
  // left wall
  boxes.push({
    x: 0,
    y: 0,
    width: 10,
    height: height,
    color: "black",
  });
  
  // floor
  boxes.push({
    x: 0,
    y: height - 10,
    width: width,
    height: 50,
    color: "black",
  });
  
  // right wall
  boxes.push({
    x: width - 10,
    y: 0,
    width: 50,
    height: height,
    color: "black",
  });
 
  let boxCounts = [10, 10, 25, 25, 25, 25, 10, 10, 10, 10, 25, 25, 70, 70];
  let numBoxes = randomSelection(boxCounts);
  let paletteSource = randomSelection(palettes);
  let bgColorIndex = randomNumber(paletteSource.length);
  let backgroundColor = paletteSource[bgColorIndex];
  paletteSource.splice(bgColorIndex, 1);
  palette = [randomSelection(paletteSource), randomSelection(paletteSource)];
  for (var boxInc = 0; boxInc < numBoxes; boxInc++) {
    let widths = [40, 80, 40, 80, 40, 40, 40, 80, 40, 80, 400],
      heights = [40, 80, 40, 80, 40, 40, 40, 80, 40, 80, 400];

    boxes.push({
      x: randomNumber(width),
      y: randomNumber(height),
      width: randomSelection(widths),
      height: randomSelection(heights),
      color: randomSelection(palette)
    });
  }

  let winBox = false,
    newBox = {
      x: randomNumber(width),
      y: randomNumber(height),
      width:  30,
      height: 30,
      color: "gold",
      name: "win"
    };

  while (!winBox) {
    winBox = true;
    for (boxInc = 0; boxInc < numBoxes; boxInc++) {
      if(colCheck(newBox, boxes[boxInc])) {
        newBox['x'] = randomNumber(width);
        winBox = false;
        break;
      }
    }
  }
  boxes.push(newBox);
  console.log(boxes);
 
  function randomNumber (range) {
    return parseInt(Math.floor(Math.random() * range));
  }

  function randomSelection (array) {
    return array[randomNumber(array.length)];
  }

  function update () {
    // check keys
    if (keys[38]) {
      // up arrow
      if (!player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velY = -player.speed * 0.75;
      }
    }
    if (keys[39]) {
      // right arrow
      if (player.velX < player.speed) {
        player.velX++;
      } 
    }
    if (keys[37]) {
      // left arrow
      if (player.velX > -player.speed) {
        player.velX--;
      }
    }
    if (keys[32]) {
      if (placingBox === false) {
        placingBox = true;
        setTimeout(function() {
          boxes.push({
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height,
            color: "red",
          });
        }, 20);
        setTimeout(function() {
          placingBox = false;
        }, 350);
      }
    }

    if (touch['happening']) {
      console.log(touch);
      if (touch['x'] < player.x) {
        player.velX = -player.speed;
      } else if (touch['x'] > player.x) {
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
          setTimeout(function() {
            boxes.push({
              x: player.x,
              y: player.y,
              width: player.width,
              height: player.height,
              color: "red",
            });
          }, 20);
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
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
      vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
      
  // add the half widths and half heights of the objects
      hWidths = (shapeA.width / 2) + (shapeB.width / 2),
      hHeights = (shapeA.height / 2) + (shapeB.height / 2),
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
    return colDir;
  }

  document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
  });

  document.body.addEventListener("keyup", function (e) {
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

  document.body.addEventListener("mousedown", function (e) {
    touch['happening'] = true;
    touch['x'] = e.screenX;
    touch['y'] = e.screenY;
  })

  document.body.addEventListener("mouseup", function(e) {  
    touch['happening'] = false;
    delete(touch['x']);
    delete(touch['y']);
  });

  window.addEventListener("resize", function () {
    setContext(setupContext());
  });

  update();
}

window.addEventListener("load", function (e) {
  setup();
});
