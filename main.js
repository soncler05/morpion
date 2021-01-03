
  var canvas = new fabric.Canvas('c');
  canvas.selection = false;
  var canvasWidth = canvas.getWidth();
  var canvasHeight = canvas.getHeight();
  var isEnded = false;
  turnId = 1;
  var players = [
    {id: 2, name: 'Clerson', isFirst:true, color:'#77BA99'},
    {id: 1, name: 'Clervil', isFirst: false, color:'#D33F49'}
  ];

  document.getElementById("box-1").style.backgroundColor = players.find(x => x.id === 1).color;
  document.getElementById("box-2").style.backgroundColor =players.find(x => x.id === 2).color;

  document.getElementById("player-1").innerHTML  = players.find(x => x.id === 1).name;
  document.getElementById("player-2").innerHTML  = players.find(x => x.id === 2).name;


  var pins = [];
  var directions = [{x:0, y:1}, {x:1, y:0}, {x:1, y:1}, {x:-1, y:1} ];
  var tmp;
  
  canvas.on('mouse:move', function(options) {
    var pointer = canvas.getPointer(options.e);

    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 
    var result = calculatePosition(pointer.x, pointer.y, 10); 

    if(tmp) canvas.remove(tmp);
    tmp = addCircle(result.left+6.5, result.top-4, players.find(x => x.id === turnId).color, 0.4);

  });
  canvas.on('mouse:out', function(options) {
    if(tmp) canvas.remove(tmp);
  });

  canvas.on('mouse:down', function(options) {
    // console.log(options.e.layerX, options.e.layerY);
    var pointer = canvas.getPointer(options.e);

    var result = calculatePosition(options.e.layerX, options.e.layerY, 10); 
    var result = calculatePosition(pointer.x, pointer.y, 10); 

    var pin = {x:result.left+6.5, y:result.top-4};

    if(pins.find(p => p.x === pin.x && p.y === pin.y)) return;

    addCircle(pin.x, pin.y, players.find(x => x.id === turnId).color);
    pins.push({x:pin.x, y:pin.y, playerId:turnId});
    console.log(turnId);
    
    console.log(result.left+6.5, result.top-4);
    
    var alignPins = isComplete(pin); 
    if (alignPins) {
      var turnIdLocal = turnId;
      isEnded = true;
      setTimeout(() => {
        alert(` ${players.find(x => x.id === turnIdLocal).name} ha completado un cinco!!!` );
      }, 10 );
    }

    changePlayer();

  });

  function calculatePosition(left, top, width) {
     var calculateLeft = Math.round(left / (width*4));
     var calculateTop = Math.round(top / (width*4));

     return {
       top:  calculateTop*4*width - width,
       left: calculateLeft*4*width -width
     }

  }
    
    
    
  // draw_grid2(600, 1200, 10, 0.05);
  // draw_grid2(600, 1200, 40, 0.1);
  // canvas.renderAll();

  draw_grid(10, 0.3);
  draw_grid(40, 0.8);

  // draw_grid(20);
  
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

function draw_grid2(heightTot, widthTot, width, borderWidth){
  var rowNumber = heightTot/width;
  var colNumber = widthTot/width;
  for (let index = 0; index < rowNumber; index++) {
    for (let ind = 0; ind < colNumber; ind++) {
      addRect(ind*width, index*width, width, borderWidth);
    }
  }
}


function addCircle(left, top, color='black', opacity=1) {
  if(left<0 || top<0 || left>1200-20 || top>600-20 || isEnded) return;
  var circle = new fabric.Circle({ angle: 30, radius: 10, top: top, left: left, opacity: opacity, fill:color });
  circle.selectable = false;
  circle.hoverCursor = 'default';
  canvas.add(circle);
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

function isComplete(pin) {
  var alignPins = [];

  for (let ind = 0; ind < directions.length; ind++) {
    const element = directions[ind];
    alignPins = [...getAligns(pin, element, 1), ...getAligns(pin, element, -1)];

    if (alignPins.length === 5) {
      return alignPins;
    }
  }

  function getAligns(pin, element, sign) {
    var alignPins = [];
    if(sign === 1) alignPins.push(pin);
    for (let index = 1; index <= 6; index++) {
      var calculatePin = {
        x: pin.x + (element.x*40*index*sign), 
        y: pin.y + (element.y*40*index*sign)
      };
      if(pins.find(p => p.x === calculatePin.x && p.y === calculatePin.y && p.playerId === turnId)) 
        alignPins.push(calculatePin);
      else break;      
    }
    return alignPins;
  }


}

function changePlayer() {
  turnId = players.find(x => x.id != turnId).id;
}