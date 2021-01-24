var module = angular.module('myApp', []);

module.controller("myController", function($scope) {

  $scope.hello = "Hello Nía";

//#region Main
  var canvas = new fabric.Canvas('c', 
  {
    selection : false,
    controlsAboveOverlay:true,
    centeredScaling:true,
    allowTouchScrolling: true
  }
);
  // canvas.selection = false;
  var canvasWidth = canvas.getWidth();
  var canvasHeight = canvas.getHeight();
  var isEnded = false;
  const automaticPlayer = {id: 2, name: '20-100', color:'#D33F49'};
  turnId = automaticPlayer.id;
  var players = [
    {id: 1, name: 'Karolina', isFirst:true, color:'#77BA99'},
    // {id: 2, name: 'Clervil', isFirst: false, color:'#D33F49'}
    automaticPlayer
  ];

  var lastPin;

  document.getElementById("box-1").style.backgroundColor = players.find(x => x.id === 1).color;
  document.getElementById("box-2").style.backgroundColor =players.find(x => x.id === 2).color;

  document.getElementById("player-1").innerHTML  = players.find(x => x.id === 1).name;
  document.getElementById("player-2").innerHTML  = players.find(x => x.id === 2).name;


  var pins = [];
  var directions = [{x:0, y:1}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ];
  var tmp;
  
  canvas.on('mouse:move', function(options) {

    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 

    if(tmp) canvas.remove(tmp);
    tmp = addCircle(result.left, result.top, players.find(x => x.id === turnId).color, 0.4);

  });
  canvas.on('mouse:out', function(options) {
    if(tmp) canvas.remove(tmp);
  });

  canvas.on('mouse:down', function(options) {
    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 
    var pin = {x:result.left, y:result.top};

    play(pin);
    
  });

  function play(pin) {
    
    var circleResult = addCircle(pin.x, pin.y, players.find(x => x.id === turnId).color);
    if (!circleResult) return circleResult;

    if(lastPin) canvas.remove(lastPin);
    lastPin = addLastCircle(pin.x, pin.y, players.find(x => x.id === turnId).color);

    pin.playerId = turnId;
    pin.id = pins.length;

    pins.push(pin);
    console.log(turnId);
        
    var alignPins = isComplete(pin); 
    if (alignPins) {
      var turnIdLocal = turnId;
      addLine(alignPins[0], alignPins[alignPins.length-1], players.find(x => x.id === turnIdLocal).color);
      console.log(alignPins);
      isEnded = true;
    }

    changePlayer();
    automaticPlay();

    return circleResult;
  }

  function calculatePosition(left, top, width) {
     var calculateLeft = Math.round(left / (width*4));
     var calculateTop = Math.round(top / (width*4));

     return {
       top:  calculateTop*4*width,
       left: calculateLeft*4*width
     }

  }

  // draw_grid(10, 0.3);
  draw_grid(40, 0.8);

  
  function draw_grid(size, opacity = 0.3) {

    let line = null;
    let rect = [];


    for (let i = 0; i < Math.ceil(canvasWidth / size); ++i) {
        rect[0] = i * size;
        rect[1] = 0;

        rect[2] = i * size;
        rect[3] = canvasWidth;

        line = null;
        line = new fabric.Line(rect, {
            stroke: '#999',
            opacity: opacity,
            excludeFromExport: true
        });

        line.selectable = false;
        line.hoverCursor = 'default';
        canvas.add(line);
        line.sendToBack();

    } 
 
    for (let i = 0; i < Math.ceil(canvasWidth / size); ++i) {
      rect[0] = 0;
      rect[1] = i * size;

      rect[2] = canvasWidth;
      rect[3] = i * size;

      line = null;
      line = new fabric.Line(rect, {
          stroke: '#999',
          opacity: opacity,
          excludeFromExport: true
      });
      line.selectable = false;
      line.hoverCursor = 'default';
      canvas.add(line);
      line.sendToBack();

  }
 
  canvas.renderAll();
}

function isPinValid(pin) {
  return !(pin.x<20 || pin.y<20 || pin.x>1200-20 || pin.y>600-20);
}

function addCircle(x, y, color='black', opacity=1) {
  if( !isPinValid({x:x, y:y}) || isEnded) return;
  if(pins.find(p => p.x === x && p.y ===y)) return;
  var circle = new fabric.Circle({ 
    angle: 30,
    radius: 10,
    top: y,
    left: x,
    opacity: opacity,
    fill:color,
    originX: 'center',
    originY: 'center'
   });
  circle.selectable = false;
  circle.hoverCursor = 'default';
  canvas.add(circle);
  return circle;
}

function addLastCircle(left, top, color='black', opacity= 0.5) {
  var circle = new fabric.Circle({ 
    angle: 30, 
    radius: 10, 
    top: top, 
    left: left, 
    opacity: opacity, 
    fill:color,
    originX: 'center',
    originY: 'center',
  });
  circle.selectable = false;
  circle.hoverCursor = 'default';
  canvas.add(circle);

  animateCircle(circle, 1);

  checkIsMapIsFull();

  return circle;
}

function checkIsMapIsFull() {
  if (totalPins === pins.length) {
    isEnded = true;
    alert('Ya no hay más jugada posible');
  }
}

function addRect(left, top, width, borderWidth) {
  const rect = new fabric.Rect({
    top: top,
    left: left,
    width: width,
    height: width,
    hasBorder: true,
    stroke: 'black',
    strokeWidth: borderWidth,
    fill:'transparent'
  });
  canvas.add(rect);
}

function addLine(pinFirst, pinLast, color='black') {
  const line = new fabric.Line([pinFirst.x, pinFirst.y, pinFirst.x, pinFirst.y], {
    stroke: color,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center'
  });
  line.selectable = false;
  line.hoverCursor = 'default';
  canvas.add(line);
  line.animate({
    x2: pinLast.x,
    y2: pinLast.y
  }, {
    onChange: canvas.renderAll.bind(canvas),
    onComplete: function() {
      line.setCoords();
      alert(` ${players.find(x => x.id === pinLast.playerId).name} ha completado un cinco!!!` );
    },
    duration: 2000
  });
}

function isComplete(pin, toGroup=true, directionIndex = null, otherPlayer= false) {
  var alignPins = [];

  localDirections = directionIndex ? [ directions[directionIndex] ] : directions;
  

  for (let ind = 0; ind < localDirections.length; ind++) {
    const element = localDirections[ind];
    alignPins = [...getAligns(pin, element, -1, otherPlayer), ...getAligns(pin, element, 1, otherPlayer)];

    if (alignPins.length === 5) {
      return alignPins;
    }
    else if(toGroup && alignPins.length > 1 && alignPins.length < 5) group(alignPins, ind);

  }

  function getAligns(pin, element, sign, otherPlayer) {
    var alignPins = [];
    const playerId = !otherPlayer ? turnId : players.find(x => x.id != turnId).id;  
    if(sign === 1) alignPins.push(pin);
    for (let index = 1; index <= 6; index++) {
      var nextPin = calculateNextPin(pin, element, sign, index);
      nextPin.playerId = playerId;
      nextPin = pins.find(p => p.x === nextPin.x && p.y === nextPin.y && p.playerId === playerId);
      if(nextPin) 
        if(sign === 1) alignPins.push(nextPin);
        else alignPins.unshift(nextPin);
      else break;      
    }
    return alignPins;
  }

}



function calculateNextPin(originPin, direction, sign, distance) {
  return {
    x: originPin.x + (direction.x*40*distance*sign), 
    y: originPin.y + (direction.y*40*distance*sign)
  }
}

function changePlayer() {
  turnId = players.find(x => x.id != turnId).id;
  if (turnId === automaticPlayer.id) automaticPlay();
}


function animateCircle(circle, dir, max=1) {
  const minScale = 1;
  const maxScale = 1.5;
  let counter = 1;
  action(dir);
  function action(dir) {
    return new Promise(resolve => {
      circle.animate({
        scaleX: dir ? maxScale : minScale,
        scaleY: dir ? maxScale : minScale
      }, {
        easing: fabric.util.ease.easeOutCubic,
        duration: 1000,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function() {
          if (counter >= max) {
            resolve('finished animating the point');
          } else {
            if (dir == 1)
              action(0);
            else
              action(1);
  
          }
          counter++;
        }
  
      });
    });
  }

}

function orderTwoPins(pinA, pinB) {
  let result = [];
  if(pinA.y === pinB.y) {
    result = pinA.x - pinB.x < 0 ? [pinA, pinB] : [pinB, pinA]; 
  } else {
    result = pinA.y -pinB.y < 0 ? [pinA, pinB] : [pinB, pinA]; 
  }
  return result;
}

function getPinById(id) {
  return pins.find(x => x.id === id);
}
function getPinByXY(pin) {
  return pins.find(p => p.x === pin.x && p.y === pin.y);
}
function getPinByXYAndUserId(pin, playerId) {
  return pins.find(p => p.x === pin.x && p.y === pin.y && p.playerId === playerId);
}

$scope.getPinById =getPinById;


//#endregion



//#region AutomaticPlayer
let twoPins = []; 
let oneWayTwoPins = []; 
let twoPinsPlus1 = []; 
let twoPinsPlus2 = []; 
let threePins = []; 
let oneWayThreePins = []; 
let ThreePinsPlus1 = []; 
let fourPins = [];  

$scope.twoPins = twoPins;
$scope.threePins = threePins;
$scope.fourPins = fourPins;

// goodOption = []; 


const starterPatterns = [
  {name: 'line'},
  // {name: 'triangle'},
  // {name: 'bigTriangle'},
]
const starterPattern = starterPatterns[getRandomInt(0, starterPatterns.length-1)];
const xTot = 1200;
const yTot = 600;
const totalPins = ((xTot / 40) - 1) * ((yTot / 40) - 1);
function calculateCenter() {


  return randomCenter({x: correctCenter(xTot) , y: correctCenter(yTot)});
  
  function correctCenter(num) {
    var middleNum = (num/2);
    return  middleNum - (middleNum%40);
  }
  
  function randomCenter(pin) {
    
    var localDirections = [
      ...[{x:0, y:0}], 
      ...directions, 
      ...directions.map(p => { return {x:p.x * 2, y:p.y *2} }),
      // ...directions.map(p => { return {x:p.x * 3, y:p.y *3} }),
    ];

    rnd = getRandomInt(0,localDirections.length - 1);
    
    return {x: pin.x + 40 * localDirections[rnd].x , y: pin.y + 40 * localDirections[rnd].y};
  }

}

automaticPlay();
function automaticPlay() {
  if(turnId != automaticPlayer.id) return;

  //first player, first pin
  if (pins.length === 0) {
    play(calculateCenter());
    return;
  }
  //first player, second pin
  if (pins.length === 2) {
    play(calculateSecondPin(pins[0]));
    return;
  }
  //first player, third pin
  if (pins.length === 4) {
    play(calculateSecondPin(pins[0]));
    return;
  }

  else {
    smartPlay();
  }
}

function calculateSecondPin(pin, distance=1) {
  possibilities = directions.map(p => {
    return {x: pin.x + 40 * distance * p.x , y: pin.y + 40 * distance * p.y}
  });

  possibilities = possibilities.filter(x => pins.filter(p => p.x === x.x && p.y === x.y).length === 0 );

  return possibilities[getRandomInt(0, possibilities.length - 1)];

}

function group(pins, directionIndex) {
  console.log('group: ' + pins.map(x => x.id));
  const pinsGroup = {playerId:pins[0].playerId, directionIndex: directionIndex, pinIds: pins.map(x => x.id)};
  switch (pins.length) {
    case 2:
      twoPins.push(pinsGroup);
      break;
    case 3:
      threePins.push(pinsGroup);
      RemoveFromGroup(twoPins, pinsGroup);
      break;
    case 4:
      fourPins.push(pinsGroup);
      RemoveFromGroup(threePins, pinsGroup);
      break;
  
    default:
      break;
  }


  console.log(twoPins);
  console.log(threePins);
  console.log(fourPins);
}

// function cleanAllGroups() {

//   const allGroups = [threePins, fourPins]; 

//   for (let index = 0; index < allGroups.length; index++) {
//     const element = allGroups[index];

//     for (let ind = 0; ind < element.pins.length; ind++) {
//       const el = element.pins[ind];
//       const idPlayer = el.idPlayer;
//     }
    
//   }
// }

function RemoveFromGroup(bigGroup, pinsGroup) {
  console.log("clean group");
  console.log(bigGroup);
  console.log(pinsGroup);
  var indexToRemove = bigGroup.findIndex(x => 
    pinsGroup.directionIndex === x.directionIndex &&  
    pinsGroup.pinIds.findIndex(p => p === x.pinIds[0]) > -1 &&  
    pinsGroup.pinIds.findIndex(p => p === x.pinIds[x.pinIds.length-1]) > -1)
  if(indexToRemove > -1) {
      bigGroup.splice(indexToRemove,1);
    }
}

function isGroupValid(group) {

  const otherPlayerId = players.find(x => x.id != group.playerId).id;

  const result = operation(getPinById(group.pinIds[group.pinIds.length-1]), 1) === 5 || operation(getPinById(group.pinIds[0]), -1) === 5;
  return result;
  function operation(pin, sign) {
    let count = group.pinIds.length;
    const c = 7 - group.pinIds.length;
    for (let index = 1; index < c; index++) {
      const nextPin = calculateNextPin(pin, directions[group.directionIndex], sign, index);
      if (count < 5) {
        if(!isPinValid(nextPin) || getPinByXYAndUserId(nextPin, otherPlayerId)) break;
        else count++;
      } else {
        const tmp = getPinByXYAndUserId(nextPin, group.playerId);
        if(tmp) count++;
      }
    }

    return count;
  }

}

// function cleanThreePinGroup(userId) {
//   let toClean = threePins.filter(x => x.userId === userId);
//   toClean = toClean.filter(gp => {
//     const firstNextPin = getPinByXYAndUserId(calculateNextPin(getPinById(gp.pinIds[0]), directions[gp.directionIndex], -1), userId); 
//     const lastNextPin = getPinByXYAndUserId(calculateNextPin(getPinById(gp.pinIds[gp.pinIds.length - 1]), directions[gp.directionIndex], 1), userId); 
    
//     if(firstNextPin && lastNextPin) return true;
    

    

//   } );
// }

function smartPlay() {

  //fourPins --automaticPlayer
  const autoFourPins = fourPins.filter(x => x.playerId === automaticPlayer.id);

  
  if(autoFourPins.length > 0) {
    const firstGroupPins = autoFourPins[0];
    if(!isGroupValid(firstGroupPins)){
      fourPins.splice(fourPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
        return smartPlay();
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    if (
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x == nextFirstPin.x && p.y === nextFirstPin.y) === -1
          // && isComplete(nextFirstPin, false, firstGroupPins.directionIndex).length === 5
        ) {
      play(nextFirstPin);
    } else if(
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
                // && isComplete(nextLastPin, false, firstGroupPins.directionIndex).length === 5
              ) {
      play(nextLastPin);
    } else {
      fourPins.splice(fourPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
      smartPlay();
    }
    return;
  }

  // //fourPins --player
  const playerFourPins = fourPins.filter(x => x.playerId != automaticPlayer.id);
  if(playerFourPins.length > 0) {
    const firstGroupPins = playerFourPins[0];
    if(!isGroupValid(firstGroupPins)){
      fourPins.splice(fourPins.findIndex(x => x.playerId != automaticPlayer.id), 1);
      smartPlay();
      return;
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    if ( isPinValid(nextFirstPin) 
          && pins.findIndex(p => p.x == nextFirstPin.x && p.y === nextFirstPin.y) === -1
          // && isComplete(nextFirstPin, false, firstGroupPins.directionIndex, true).length === 5
        ) {
      play(nextFirstPin);
    } else if(
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
                // && isComplete(nextLastPin, false, firstGroupPins.directionIndex, true).length === 5
              ) {
      play(nextLastPin);
    } else {
      fourPins.splice(fourPins.findIndex(x => x.playerId != automaticPlayer.id), 1);
      smartPlay();
    }
    return;
  }
  
  //threePins --automaticPlayer
  const autoThreePins = threePins.filter(x => x.playerId === automaticPlayer.id);
  if(autoThreePins.length > 0) {
    let firstGroupPins = autoThreePins.find(x => {
      const firstPin = getPinById(x.pinIds[0]);
      const lastPin = getPinById(x.pinIds[x.pinIds.length - 1]);
      const nextFirstPin =  calculateNextPin(firstPin, directions[x.directionIndex], -1);
      const nextLastPin =  calculateNextPin(lastPin, directions[x.directionIndex], 1);
      return isPinValid(nextFirstPin) && pins.findIndex(z => z.x === nextFirstPin && z.y === nextFirstPin.y) < -1
            && isPinValid(nextLastPin) && pins.findIndex(z => z.x === nextLastPin && z.y === nextLastPin.y) < -1;
    });
    firstGroupPins = firstGroupPins ? firstGroupPins : autoThreePins[0];
    if(!isGroupValid(firstGroupPins)){
      threePins.splice(threePins.findIndex(x => x.playerId === automaticPlayer.id), 1);
        smartPlay();
        return;
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    let resultPins = [];
    if ( 
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
        ) {
      resultPins.push(nextFirstPin);
    } else if( 
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
              ) {
        resultPins.push(nextLastPin);
    } else {
      threePins.splice(threePins.findIndex(x => x.playerId === automaticPlayer.id), 1);
      smartPlay();
      return;
    }
    if(playRandom(resultPins)) return;
     else {
      playerThreePins.splice(playerThreePins.findIndex(p => p === firstGroupPins), 1);
      smartPlay();
     }
     return;
  }
  
  //threePins --player
  const playerThreePins = threePins.filter(x => x.playerId != automaticPlayer.id);
  if(playerThreePins.length > 0) {
    let firstGroupPins = playerThreePins.find(x => {
      const firstPin = getPinById(x.pinIds[0]);
      const lastPin = getPinById(x.pinIds[x.pinIds.length - 1]);
      const nextFirstPin =  calculateNextPin(firstPin, directions[x.directionIndex], -1);
      const nextLastPin =  calculateNextPin(lastPin, directions[x.directionIndex], 1);
      return isPinValid(nextFirstPin) && pins.findIndex(z => z.x === nextFirstPin && z.y === nextFirstPin.y) < -1
            && isPinValid(nextLastPin) && pins.findIndex(z => z.x === nextLastPin && z.y === nextLastPin.y) < -1;
    });
    firstGroupPins = firstGroupPins ? firstGroupPins : playerThreePins[0];
    if(!isGroupValid(firstGroupPins)){
      threePins.splice(threePins.findIndex(x => x.playerId != automaticPlayer.id), 1);
        smartPlay();
        return;
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    let resultPins = [];
    if ( 
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
        ) {
      resultPins.push(nextFirstPin);
    } else if( 
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
              ) {
        resultPins.push(nextLastPin);
    } else {
      threePins.splice(threePins.findIndex(x => x.playerId === automaticPlayer.id), 1);
      smartPlay();
      return;
    }
     if(playRandom(resultPins)) return;
     else {
      playerThreePins.splice(playerThreePins.findIndex(p => p === firstGroupPins), 1);
      smartPlay();
     }
     return;
  }

  //twoPins --automaticPlayer
  const autoTwoPins = twoPins.filter(x => x.playerId === automaticPlayer.id);
  if(autoTwoPins.length > 0) {
    let firstGroupPins = autoTwoPins.find(x => {
      const firstPin = getPinById(x.pinIds[0]);
      const lastPin = getPinById(x.pinIds[x.pinIds.length - 1]);
      const nextFirstPin =  calculateNextPin(firstPin, directions[x.directionIndex], -1);
      const nextLastPin =  calculateNextPin(lastPin, directions[x.directionIndex], 1);
      return isPinValid(nextFirstPin) && pins.findIndex(z => z.x === nextFirstPin && z.y === nextFirstPin.y) < -1
            && isPinValid(nextLastPin) && pins.findIndex(z => z.x === nextLastPin && z.y === nextLastPin.y) < -1;
    });
    firstGroupPins = firstGroupPins ? firstGroupPins : autoTwoPins[0];
    if(!isGroupValid(firstGroupPins)){
      twoPins.splice(twoPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
        smartPlay();
        return;
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    let resultPins = [];
    if ( 
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
        ) {
      resultPins.push(nextFirstPin);
    } else if( 
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
              ) {
        resultPins.push(nextLastPin);
    } else {
      twoPins.splice(twoPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
      smartPlay();
      return;
    }
    if(playRandom(resultPins)) return;
     else {
      playerTwoPins.splice(playerTwoPins.findIndex(p => p === firstGroupPins), 1);
      smartPlay();
     }
     return;
  }

  //twoPins --player
  const playerTwoPins = twoPins.filter(x => x.playerId != automaticPlayer.id);
  if(playerTwoPins.length > 0) {
    let firstGroupPins = playerTwoPins.find(x => {
      const firstPin = getPinById(x.pinIds[0]);
      const lastPin = getPinById(x.pinIds[x.pinIds.length - 1]);
      const nextFirstPin =  calculateNextPin(firstPin, directions[x.directionIndex], -1);
      const nextLastPin =  calculateNextPin(lastPin, directions[x.directionIndex], 1);
      return isPinValid(nextFirstPin) && pins.findIndex(z => z.x === nextFirstPin && z.y === nextFirstPin.y) < -1
            && isPinValid(nextLastPin) && pins.findIndex(z => z.x === nextLastPin && z.y === nextLastPin.y) < -1;
    });
    firstGroupPins = firstGroupPins ? firstGroupPins : playerTwoPins[0];
    if(!isGroupValid(firstGroupPins)){
      twoPins.splice(twoPins.findIndex(x => x.playerId != automaticPlayer.id), 1);
        smartPlay();
        return;
    }
    const nextFirstPin = calculateNextPin(getPinById(firstGroupPins.pinIds[0]), directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = getPinById(firstGroupPins.pinIds[firstGroupPins.pinIds.length - 1]);
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    let resultPins = [];
    if ( 
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && pins.findIndex(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) === -1
        ) {
      resultPins.push(nextFirstPin);
    } else if( 
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
              ) {
        resultPins.push(nextLastPin);
    } else {
      twoPins.splice(twoPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
      smartPlay();
      return;
    }
     if(playRandom(resultPins)) return;
     else {
      playerTwoPins.splice(playerTwoPins.findIndex(p => p === firstGroupPins), 1);
      smartPlay();
     }
     return;
  }



}

function playLastPin() {
  let totYs = yTot / 40;
  let totXs = xTot / 40;
  let theYs = [];
  
  for (let index = 1; index < totYs; index++) {
    theYs.push(index * 40);
  }

  while (theYs.length > 0) {
    let aleatoryPin = {y: getRandomInt(0, theYs.length - 1)};
    for (let index = 1; index < totXs; index++) {
      aleatoryPin.x = (index * 40);

      if(getPinByXY(aleatoryPin)) break;
    }
    if(getPinByXY(aleatoryPin)) break;

    theYs.splice(theYs.findIndex(y => y === aleatoryPin.y), 1);
  }
  
}

function playRandom(pinGroup) {
let rdmPin;
  
  while (pinGroup.length > 0) {
    rdmPin = pinGroup[getRandomInt(0, pinGroup.length - 1)];
    if(play(rdmPin)) {
      return true;
    } else {
      pinGroup.splice(pinGroup.findIndex(p => p.x === rdmPin.x && p.y === rdmPin.y), 1);
    }
  }
  return false;
}

//#endregion

//#region Helpers

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//#endregion

});
