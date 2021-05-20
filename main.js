const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 20; //БЛОК 20х20
let canvasX = 800/box;
let canvasY = 600/box;

let minBoxes = 3;
let maxBoxes = 8;

let roomsArr = [];
let connectedRoomsIndexes = [];
let separateRoomsIndexes = [];
let firstRoom = true;

// ctx.fillStyle = "black";
// ctx.fillRect(0, 0, 1200, 800);

function generateMap() {
  let maxRoomHeight = 400/box;
  let maxRoomWidth = 400/box;
  let minRoomHeight = 100/box;
  let minRoomWidth = 100/box;

  roomsCount = getRandomInt(minBoxes,maxBoxes);
  console.log('rooms: ', roomsCount);

  for (let i = 0; i < roomsCount; i++) {
    generateRoom(maxRoomWidth, maxRoomHeight, minRoomWidth, minRoomHeight, i);
  }

  generateConnections();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function generateRoom(maxW, maxH, minW, minH, index) {
  let width = getRandomInt(minW, maxW);
  let height = getRandomInt(minH, maxH);
  let posX = getRandomInt(0, canvasX-width)*box;
  let posY = getRandomInt(0, canvasY-height)*box;
  
  ctx.fillStyle = "grey";
  ctx.fillRect(posX, posY, width*box, height*box);

  // let roomCoords = [posX, posY, posX+width*box, posY+height*box];
  let roomCoords = {
    x1: posX,
    y1: posY,
    x2: posX+width*box,
    y2: posY+height*box
  }
  roomsArr.push(roomCoords);
  firstRoom ? addConnectedRoom(index) : checkConnection(roomCoords, index);
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

        // console.log(leftTopX, leftTopY);
        // console.log(rightBottomX, rightBottomY);
        let width = rightBottomX-leftTopX;
        let height = rightBottomY-leftTopY;
        
        ctx.fillStyle = "red";
        ctx.fillRect(leftTopX, leftTopY, width, height);
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
  // console.log('dist y ', distY);

  let distX = Math.min(Math.abs(room.x1 - newRoom.x2), Math.abs(room.x2 - newRoom.x1));
  // console.log('dist x ', distX);
}

function checkIfInField (x, y) {
  let inField = false;
  roomsArr.forEach(function(item, i, roomsArr) { //поменять на функцию которую можно прервать когда inField == true
    if (x >= roomsArr[i].x1 && x <= roomsArr[i].x2 - box && y >= roomsArr[i].y1 && y <= roomsArr[i].y2 - box) {
      inField = true;
    }
  })
  console.log(inField)
}

generateMap();

ctx.fillStyle = "black";
ctx.fillRect(300, 300, box, box);

checkIfInField (300, 300)


