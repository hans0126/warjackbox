 function warjackBox() {

     var _self = this;

     var animeRequest;
     _self.init = init;
     _self.getBrush = getBrush;
     _self.resetTable = resetTable;
     _self.mirrorMode = false;
     _self.getDataArray = getDataArray;
     _self.transferAndRender = transferAndRender;
     _self.changeMode = changeMode;
     _self.displayMode = 0; //0:warjack 1:colossus
     _self.LRbind = true;
     _self.MCbind = true;

     var stage = new PIXI.Container(),
         table = new PIXI.Container(),
         table2 = new PIXI.Container()

     var cubeWidth = 40,
         cubeHeight = 40;

     var arrData = [];
     var mirror = [5, 3, 1, -1, -3, -5];
     var reverseMirror = [-5, -3, -1, 1, 3, 5];
     var brushType = null;
     var paintStart = false;
     var cubeColor = [0x666666, 0xFFFFFF, 0xcccccc]; //disable,normal,hover
     var areaWidth = 360;
     var areaHeight = 360;

     function init() {
         var _areaWidth = areaWidth
         if (_self.displayMode == 1) {
             _areaWidth = areaWidth * 2;
         }

         editAreaRenderer = new PIXI.autoDetectRenderer(_areaWidth, areaHeight);
         editAreaRenderer.roundPixels = true;
         document.getElementById("c").appendChild(editAreaRenderer.view);

         table.interactive = table2.interactive = true;
         table.x = 20;
         table.y = table2.y = 20;
         table2.x = 380;

         table.mousedown = table2.mousedown = function() {
             if (!brushType) return
             paintStart = true;
         }

         table.mouseup = table.mouseout = table2.mouseup = table2.mouseout = function() {
             paintStart = false;
         }

         createCubes(table);
         createCubes(table2);

         stage.addChild(table);
         stage.addChild(table2);

         table.hitArea = new PIXI.Rectangle(0, 0, table.width, table.height);
         table2.hitArea = new PIXI.Rectangle(0, 0, table2.width, table2.height);

         table.idName = "table";
         table2.idName = "table2";

         if (_self.displayMode == 0) {
             table2.visible = false;
         }

         anime();
     }

     function penDown(event) {
         if (!brushType) return

         anime();
         this.dragging = true;
         var newPosition = event.data.getLocalPosition(this);
         painProcess(newPosition.x, newPosition.y);
     }

     function painting(event) {
         if (this.dragging) {
             var newPosition = event.data.getLocalPosition(this);
             painProcess(newPosition.x, newPosition.y);
         }
     }

     function penUp() {
         this.dragging = false;
         console.log("A");
         window.cancelRequestAnimFrame(animeRequest);
     }

     function changeMode(_mode, _fn) {
         _self.displayMode = _mode
         if (_mode == 0) {
             table2.visible = false;
             editAreaRenderer.resize(areaWidth, areaHeight);
             _self.MCbind = true;
         } else {
             table2.visible = true;
             editAreaRenderer.resize(areaWidth * 2, areaHeight);
             _self.MCbind = false;
         }

         if (typeof(_fn) === "function") {
             _fn();
         }
     }


     function createCubes(_table) {
         for (var i = 0; i < 6; i++) {
             for (var j = 0; j < 6; j++) {

                 var cube = new PIXI.Container();
                 var graphic = new PIXI.Graphics();
                 var _x = j * cubeWidth + j * 5;
                 var _y = i * cubeHeight + i * 5;

                 /*  var txt = new PIXI.extras.BitmapText('K', {
                       font: "35px Crackhouse",
                       tint: 0x000000
                   })*/

                 txt = new PIXI.Text('', {
                     font: "36px Arial",
                     fill: "black"
                 });

                 txt.x = cubeWidth / 2 - txt.width / 2;
                 txt.y = cubeHeight / 2 - txt.height / 2;

                 cube.x = _x;
                 cube.y = _y;
                 cube.width = cubeWidth;
                 cube.height = cubeHeight;

                 cube.interactive = true;

                 cube.blockType = "enabled";
                 cube.blockContent = '';
                 cube.origanlColor = cubeColor[0];

                 graphic.beginFill(cube.origanlColor);
                 graphic.drawRect(0, 0, cubeWidth, cubeHeight);
                 graphic.endFill();

                 cube.addChild(graphic);
                 cube.addChild(txt);

                 cube.mousedown = function() {
                     if (!brushType) return
                     painProcess(this);
                 }

                 cube.mouseover = function(event) {
                     reDrawCubeBg(this.getChildAt(0), cubeColor[2], true);

                     if (paintStart) {
                         painProcess(this);
                     }
                 }

                 cube.mouseout = function(event) {
                     reDrawCubeBg(this.getChildAt(0), this.origanlColor);
                 }

                 _table.addChild(cube);
             }
         }
     }


     function painProcess(_cube) {
         var _targetCube = _cube;
         var _mirrorCube;
         var _mirrorIndex
         var _mirrorReverseText;
         var _currentColor;

         if (_self.mirrorMode) {
             var _idx;
             if (_self.displayMode == 0) {
                 _idx = table.getChildIndex(_cube);
                 _mirrorIndex = getMirrorIdx(_idx);
                 _mirrorCube = table.getChildAt(_idx + _mirrorIndex);

             } else {
                 if (_cube.parent.idName == "table") {
                     _idx = table.getChildIndex(_cube);
                     _mirrorIndex = getMirrorIdx(_idx);
                     _mirrorCube = table2.getChildAt(_idx + _mirrorIndex);
                 } else {
                     _idx = table2.getChildIndex(_cube);
                     _mirrorIndex = getMirrorIdx(_idx, true);
                     _mirrorCube = table.getChildAt(_idx - _mirrorIndex);
                 }
             }

             switch (brushType.font) {
                 case "L":

                     if (_self.LRbind) {
                         _mirrorReverseText = "R";
                     } else {
                         _mirrorReverseText = brushType.font;
                     }
                     break;

                 case "R":
                     if (_self.LRbind) {
                         _mirrorReverseText = "L";
                     } else {
                         _mirrorReverseText = brushType.font;
                     }
                     break;

                 case "M":

                     if (_self.MCbind) {
                         _mirrorReverseText = "C";
                     } else {
                         _mirrorReverseText = brushType.font;
                     }
                     break;

                 case "C":
                     if (_self.MCbind) {
                         _mirrorReverseText = "M";
                     } else {
                         _mirrorReverseText = brushType.font;
                     }
                     break;
                 case "S":
                     _mirrorReverseText = "S";
                     break;

                 default:
                     _mirrorReverseText = brushType.font
             }
         }

         if (brushType.bType == 'disabled') {

             _currentColor = cubeColor[0];

             reDrawCubeBg(_targetCube.getChildAt(0), _currentColor, true);
             drawSymbol(_targetCube.getChildAt(1), '', false);

             if (_self.mirrorMode) {
                 reDrawCubeBg(_mirrorCube.getChildAt(0), _currentColor);
                 drawSymbol(_mirrorCube.getChildAt(1), '', false);
             }

         } else {
             _currentColor = cubeColor[1];

             reDrawCubeBg(_targetCube.getChildAt(0), _currentColor, true);
             if (_self.mirrorMode) {
                 reDrawCubeBg(_mirrorCube.getChildAt(0), _currentColor);
             }

             if (brushType.font) {
                 drawSymbol(_targetCube.getChildAt(1), brushType.font, true);
                 if (_self.mirrorMode) {
                     drawSymbol(_mirrorCube.getChildAt(1), _mirrorReverseText, true);
                 }

             } else {
                 _targetCube.getChildAt(1).visible = false;
                 if (_self.mirrorMode) {
                     _mirrorCube.getChildAt(1).visible = false
                 }
             }
         }

         _targetCube.blockType = brushType.bType;
         _targetCube.blockContent = brushType.font;
         _targetCube.origanlColor = _currentColor;

         if (_self.mirrorMode) {
             _mirrorCube.blockType = brushType.bType;
             _mirrorCube.blockContent = _mirrorReverseText;
             _mirrorCube.origanlColor = _currentColor;
         }

         function getMirrorIdx(_idx, _reverse) {

             var _index
             if (_idx < 6) {
                 if (_reverse) {
                     _index = reverseMirror[_idx];
                 } else {
                     _index = mirror[_idx];
                 }

             } else {
                 if (_reverse) {
                     _index = reverseMirror[_idx % 6];
                 } else {
                     _index = mirror[_idx % 6];
                 }
             }
             return _index
         }

     }

     function resetTable() {
         var _array = [table, table2];
         for (var k = 0; k < _array.length; k++) {
             for (var i = 0; i < _array[k].children.length; i++) {
                 var _cube = _array[k].getChildAt(i);
                 reDrawCubeBg(_cube.getChildAt(0), cubeColor[0]);
                 _cube.getChildAt(1).visible = false;
                 _cube.blockType = null;
                 _cube.blockContent = null;
                 _cube.origanlColor = cubeColor[0];
             }
         }
     }


     function getBrush(_b) {

         switch (_b) {
             case 'disabled':
                 brushType = {
                     bType: _b,
                     font: ""
                 }
                 break;

             case 'enabled':
                 brushType = {
                     bType: _b,
                     font: ""
                 }
                 break;

             default:
                 brushType = {
                     bType: 'enabled',
                     font: _b
                 }
         }
     }

     function getDataArray() {
         var _arr = [];

         for (var i = 0; i < 6; i++) {
             _arr[i] = [];
         }

         for (var i = 0; i < table.children.length; i++) {

             var _outSymbol = '-';
             if (table.children[i].blockType == "disabled") {
                 _outSymbol = '-';

             } else {
                 if (table.children[i].blockContent != '') {
                     _outSymbol = table.children[i].blockContent;
                 } else {
                     _outSymbol = '+';
                 }
             }

             _arr[Math.floor(i / 6)].push(_outSymbol);

         }

         return _arr
     }

     function transferAndRender(_data) {
         var _reg = /[clmrgi+-]/ig;
         var _data = _data.split('\n'),
             _reData = [],
             colCounter = 0;

         for (var i = 0; i < _data.length; i++) {
             _reData[i] = [];
             var _col = _data[i].split(',');

             for (var j = 0; j < _col.length; j++) {
                 var _status = _col[j].match(_reg)
                 if (_status) {
                     _reData[i].push(_status[0].toUpperCase());
                 } else {
                     _reData[i].push("-");
                 }

             }
         }

         for (var i = 0; i < _reData.length; i++) {
             for (j = 0; j < _reData[i].length; j++) {
                 var _color,
                     _text,
                     _cube = table.getChildAt(colCounter),
                     _fontVisible;

                 if (_reData[i][j] == "-") {
                     _color = cubeColor[0];
                     _text = '';
                     _fontVisible = false;
                 } else {
                     _color = cubeColor[1];
                     _text = "";
                     _fontVisible = true;
                     if (_reData[i][j] != "+") {
                         _text = _reData[i][j];
                     }
                 }

                 reDrawCubeBg(_cube.getChildAt(0), _color);
                 drawSymbol(_cube.getChildAt(1), _text, _fontVisible);

                 colCounter++;
             }
         }

         editAreaRenderer.render(stage);
     }

     function reDrawCubeBg(_cube, _color, _line) {
         _cube.clear();
         _cube.beginFill(_color);
         if (_line) {
             _cube.lineStyle(2, 0xFF0000);
         }
         _cube.drawRect(0, 0, cubeWidth, cubeHeight);
         _cube.endFill();
     }

     function drawSymbol(_symbol, _text, _visible) {
         _symbol.visible = _visible;
         _symbol.text = _text;
         _symbol.x = cubeWidth / 2 - _symbol.width / 2;
         _symbol.y = cubeHeight / 2 - _symbol.height / 2;
     }

     function anime() {
         animeRequest = window.requestAnimFrame(anime);
         editAreaRenderer.render(stage);
     }
 }


 window.requestAnimFrame = (function() {
     return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function(callback) {
             window.setTimeout(callback, 1000 / 60);
         };
 })();

 window.cancelRequestAnimFrame = (function() {
     return window.cancelAnimationFrame ||
         window.webkitCancelRequestAnimationFrame ||
         window.mozCancelRequestAnimationFrame ||
         window.oCancelRequestAnimationFrame ||
         window.msCancelRequestAnimationFrame ||
         clearTimeout
 })();
