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
    {id: 1, name: 'Clerson', isFirst:true, color:'#77BA99'},
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
    if (!circleResult) return;

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
      // setTimeout(() => {
      //   alert(` ${players.find(x => x.id === turnIdLocal).name} ha completado un cinco!!!` );
      // }, 500 );
    }

    changePlayer();
    automaticPlay();

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

  return circle;
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

// goodOption = []; 


const starterPatterns = [
  {name: 'line'},
  // {name: 'triangle'},
  // {name: 'bigTriangle'},
]
const starterPattern = starterPatterns[getRandomInt(0, starterPatterns.length-1)];
function calculateCenter() {

  xTot = 1200;
  yTot = 600;

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
  const pinsGroup = {playerId:pins[0].playerId, directionIndex: directionIndex, pins: pins};
  switch (pins.length) {
    case 2:
      twoPins.push(pinsGroup);
      break;
    case 3:
      threePins.push(pinsGroup);
      cleanGroup(twoPins, pinsGroup);
      break;
    case 4:
      fourPins.push(pinsGroup);
      cleanGroup(threePins, pinsGroup);
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

function cleanGroup(bigGroup, pinsGroup) {
  var indexToRemove = bigGroup.find(x => 
    pinsGroup.directionIndex === x.directionIndex &&  
    pinsGroup.pins.findIndex(p => p.x === x.pins[0].x && p.y === x.pins[0].y) > -1 &&  
    pinsGroup.pins.findIndex(p => p.x === x.pins[x.pins.length-1].x && p.y === x.pins[x.pins.length-1].y) > -1)
  if(indexToRemove > -1) {
      bigGroup.splice(indexToRemove,1);
    }
}

function smartPlay() {

  //fourPins --automaticPlayer
  const autoFourPins = fourPins.filter(x => x.playerId === automaticPlayer.id);
  if(autoFourPins.length > 0) {
    const firstGroupPins = autoFourPins[0];
    const nextFirstPin = calculateNextPin(firstGroupPins.pins[0], directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = firstGroupPins.pins[firstGroupPins.pins.length - 1];
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    if ( //!pins.find(p => p.x === nextFirstPin.x && p.y === nextFirstPin.y) && 
          isPinValid(nextFirstPin) &&
          pins.findIndex(p => p.x == nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && isComplete(nextFirstPin, false, firstGroupPins.directionIndex).length === 5
        ) {
      play(nextFirstPin);
    } else if( //!pins.find(p => p.x === nextLastPin.x && p.y === nextLastPin.y) &&
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
                && isComplete(nextLastPin, false, firstGroupPins.directionIndex).length === 5
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
    const nextFirstPin = calculateNextPin(firstGroupPins.pins[0], directions[firstGroupPins.directionIndex], -1, 1);
    const lastPin = firstGroupPins.pins[firstGroupPins.pins.length - 1];
    const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
    if ( isPinValid(nextFirstPin) 
          && pins.findIndex(p => p.x == nextFirstPin.x && p.y === nextFirstPin.y) === -1
          && isComplete(nextFirstPin, false, firstGroupPins.directionIndex, true).length === 5
        ) {
      play(nextFirstPin);
    } else if(
                isPinValid(nextLastPin)  
                && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
                && isComplete(nextLastPin, false, firstGroupPins.directionIndex, true).length === 5
              ) {
      play(nextLastPin);
    } else {
      fourPins.splice(fourPins.findIndex(x => x.playerId != automaticPlayer.id), 1);
      smartPlay();
    }
    return;
  }
  
  // //threePins + 1 --automaticPlayer
  // const autoFourPins = fourPins.filter(x => x.playerId === automaticPlayer.id);
  // if(autoFourPins.length > 0) {
  //   const firstGroupPins = autoFourPins[0];
  //   const nextFirstPin = calculateNextPin(firstGroupPins.pins[0], directions[firstGroupPins.directionIndex], -1, 1);
  //   const lastPin = firstGroupPins.pins[firstGroupPins.pins.length - 1];
  //   const nextLastPin = calculateNextPin(lastPin, directions[firstGroupPins.directionIndex], 1, 1);
  //   if ( isPinValid(nextFirstPin) 
  //         && pins.findIndex(p => p.x == nextFirstPin.x && p.y === nextFirstPin.y) === -1
  //         && isComplete(nextFirstPin, false, firstGroupPins.directionIndex).length === 5
  //       ) {
  //     play(nextFirstPin);
  //   } else if(
  //               isPinValid(nextLastPin)  
  //               && pins.findIndex(p => p.x == nextLastPin.x && p.y === nextLastPin.y) === -1
  //               && isComplete(nextLastPin, false, firstGroupPins.directionIndex).length === 5
  //             ) {
  //     play(nextLastPin);
  //   } else {
  //     fourPins.splice(fourPins.findIndex(x => x.playerId === automaticPlayer.id), 1);
  //     smartPlay();
  //   }
  //   return;
  // }


}

//#endregion



//#region Helpers

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//#endregion