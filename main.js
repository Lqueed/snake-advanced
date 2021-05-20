const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let r_a = 1; 
let box = 20; //БЛОК 20х20
let canvasX = 800/box;
let canvasY = 600/box;

let minBoxes = 3;
let maxBoxes = 8;

let roomsArr = [];
let connectedRoomsIndexes = [];
let separateRoomsIndexes = [];
let firstRoom = true;

let score = 0;
let food = {
  x: 420,
  y: 320
};

function generateMap() {
  let maxRoomHeight = 400/box;
  let maxRoomWidth = 400/box;
  let minRoomHeight = 100/box;
  let minRoomWidth = 100/box;

  roomsCount = getRandomInt(minBoxes,maxBoxes);
  console.log('rooms: ', roomsCount);

  generateFirstRoom(300, 200, 200, 200, 0);
  for (let i = 1; i < roomsCount; i++) {
    generateRoom(maxRoomWidth, maxRoomHeight, minRoomWidth, minRoomHeight, i);
  }

  generateConnections();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function generateFirstRoom(x1, y1, w, h, index) {
  let roomCoords = {
    x1: x1,
    y1: y1,
    x2: x1+w,
    y2: y1+h
  }
  roomsArr.push(roomCoords);
  addConnectedRoom(index);
}

function generateRoom(maxW, maxH, minW, minH, index) {
  let width = getRandomInt(minW, maxW);
  let height = getRandomInt(minH, maxH);
  let posX = getRandomInt(1, canvasX-width-1)*box;
  let posY = getRandomInt(1, canvasY-height-1)*box;

  let roomCoords = {
    x1: posX,
    y1: posY,
    x2: posX+width*box,
    y2: posY+height*box
  }

  roomsArr.push(roomCoords);
  checkConnection(roomCoords, index);
}

function addConnectedRoom(index) {
  connectedRoomsIndexes.push(index);
  if (firstRoom) {
    firstRoom = false;
  }
}

function checkConnection(newRoom, index) {
  let isConnected = false;
  roomsArr.forEach(function(item, i, roomsArr) {
    if (i != index) {
      let room = roomsArr[i];

      if ( checkIntersection(room, newRoom) ) {
        isConnected = true;
        addConnectedRoom(index);
      }
    }
  })

  if (!isConnected) {
    separateRoomsIndexes.push(index)
  }
}

function checkIntersection(room, newRoom) {
  return (room.y1 <= newRoom.y2 && room.y2 >= newRoom.y1 && room.x1 <= newRoom.x2 && room.x2 >= newRoom.x1)
}

function generateConnections() {
  separateRoomsIndexes.forEach(function(item, i, separateRoomsIndexes) {
    let newRoom = roomsArr[separateRoomsIndexes[i]];

    roomsArr.forEach(function(item, j, roomsArr) {
      if (separateRoomsIndexes[i] != j) {
        let room = roomsArr[j];
        
        let sideX = [ Math.max(room.x1, newRoom.x1), Math.min(room.x2, newRoom.x2) ];
        let sideY = [ Math.max(room.y1, newRoom.y1), Math.min(room.y2, newRoom.y2) ];

        let leftTopX = Math.min(sideX[0], sideX[1]);
        let leftTopY = Math.min(sideY[0], sideY[1]);

        let rightBottomX = Math.max(sideX[0], sideX[1]);
        let rightBottomY = Math.max(sideY[0], sideY[1]);

        let width = rightBottomX-leftTopX;
        let height = rightBottomY-leftTopY;
        
        roomsArr.push({
          x1: leftTopX, 
          y1: leftTopY, 
          x2: rightBottomX, 
          y2: rightBottomY
        });
  
        //rooms are side-by-side by Y
        if ((room.x1 <= newRoom.x2 && room.x2 >= newRoom.x1)) {
        }
        
        //rooms are side-by-side by X
        if ((room.y1 <= newRoom.y2 && room.y2 >= newRoom.y1)) {
        }

      }
    })
  })
}

//obsolete
function getRoomDistance(room, newRoom) {
  let distY = Math.min(Math.abs(room.y1 - newRoom.y2), Math.abs(room.y2 - newRoom.y1));
  let distX = Math.min(Math.abs(room.x1 - newRoom.x2), Math.abs(room.x2 - newRoom.x1));
}

//проверка вхождения в поле - передаем левый верхний угол
function checkIfInField (x, y) {
  let inField = false;
  roomsArr.forEach(function(item, i, roomsArr) { //поменять на функцию которую можно прервать когда inField == true
    if (x >= roomsArr[i].x1 && x <= roomsArr[i].x2 - box && y >= roomsArr[i].y1 && y <= roomsArr[i].y2 - box) {
      inField = true;
    }
  })
  return inField;
}

function drawMap() {
  //draw borders
  for (let i = 0; i < roomsArr.length; i++) {
    let room = roomsArr[i];
    ctx.fillStyle = "white";
    ctx.fillRect((room.x1 - box), (room.y1 - box), (room.x2 - room.x1 + 2*box), (room.y2 - room.y1 + 2*box));
  }

  //draw thin border
  for (let i = 0; i < roomsArr.length; i++) {
    let room = roomsArr[i];
    ctx.fillStyle = "rgba(50, 50, 50, " + r_a + ")";
    ctx.fillRect((room.x1 - 3), (room.y1 - 3), (room.x2 - room.x1 + 6), (room.y2 - room.y1 + 6));
  }

  //draw background
  for (let i = 0; i < roomsArr.length; i++) {
    let room = roomsArr[i];
    ctx.fillStyle = "rgba(221, 221, 221, " + r_a + ")";
    ctx.fillRect(room.x1, room.y1, (room.x2 - room.x1), (room.y2 - room.y1));
  }
}

function placeFood() {
  //del previous
  ctx.fillStyle = "rgba(221, 221, 221, " + r_a + ")";
  ctx.fillRect(food.x, food.y, box, box);

  let x,y;
  while (!checkIfInField(x,y) && !checkIfInSnake(x,y)) {
    x = Math.floor((Math.random() * 39 + 1)) * box;
    y = Math.floor((Math.random() * 29 + 1)) * box;
  }
  food = {
    x: x,
    y: y
  }
}

function drawFood() {
  ctx.fillStyle = "rgba(232, 60, 35, " + r_a + ")";
  ctx.fillRect(food.x, food.y, box, box);
}

function checkIfInSnake(x,y) {
	for(let i = 0; i < snake.length; i++) {
    if (x == snake[i].x && snake[i].y == y) {
      return true;
    }
    else return false;
  }
}

//snake
let snake = [];
snake[0] = {
	x: 20 * box,
	y: 15 * box
};

//controls
document.addEventListener("keydown", direction);
let dir;
function direction(event) {
	if(event.keyCode == 37 && dir != "right")
		dir = "left";
	else if(event.keyCode == 38 && dir != "down")
		dir = "up";
	else if(event.keyCode == 39 && dir != "left")
		dir = "right";
	else if(event.keyCode == 40 && dir != "up")
		dir = "down";
}

function begin() {
  food = {
    x: 420,
    y: 320
  };
  snake[0] = {
    x: 20 * box,
    y: 15 * box
  };
  generateMap();
  drawMap();
  placeFood();
  drawFood();
}

begin();

function eatTail(head, arr) {
	for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y)
			clearInterval(game);
	}
}

function drawSnake() {
	for(let i = 0; i < snake.length; i++) {
		ctx.fillStyle = i == 0 ? "black" : "rgba(50, 50, 50, " + r_a + ")";
		ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }
}

function drawGame() {  
  drawMap();
  drawFood();
  
	let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (!checkIfInField(snakeX, snakeY)) {
    console.log('fail');
    snake[0] = snake[1];
    clearInterval(game);
  }

  drawSnake();

  ctx.fillStyle = "white";
  ctx.fillRect(40, 600, 300, 60);
	ctx.fillStyle = "black";
	ctx.font = "50px Arial";
	ctx.fillText(score, 50, 640);
    
	if (snakeX == food.x && snakeY == food.y) {
		score++;
    placeFood();
    drawFood();
    drawSnake();
	} else {
    snake.pop();
  }

	if (dir == "left") snakeX -= box;
	if (dir == "right") snakeX += box;
	if (dir == "up") snakeY -= box;
  if (dir == "down") snakeY += box;

	let newHead = {
		x: snakeX,
		y: snakeY
	};

	eatTail(newHead, snake);

	snake.unshift(newHead);
}

let game = setInterval(drawGame, 120);
