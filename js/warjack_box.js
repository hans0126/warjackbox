 function warjackBox() {

     var _self = this;

     var animeRequest;

     _self.getBrush = getBrush;
     _self.resetTable = resetTable;
     _self.mirrorMode = false;
     _self.getDataArray = getDataArray;
     _self.transferAndRender = transferAndRender;

     var stage = new PIXI.Container(),
         table = new PIXI.Container();

     var cubeWidth = 40,
         cubeHeight = 40;

     var arrData = [];

     var mirror = [5, 3, 1, -1, -3, -5];

     var brushType = null;


     var paintStart = false;

     _self.init = function() {
         editAreaRenderer = new PIXI.autoDetectRenderer(360, 360);
         document.getElementById("c").appendChild(editAreaRenderer.view);

         table.interactive = true;
         table.x = 20;
         table.y = 20;




         table.mousedown = function() {
             paintStart = true;
         }

         table.mouseup = function() {
             paintStart = false;
         }


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
                 cube.origanlColor = 0x334455;

                 graphic.beginFill(cube.origanlColor);
                 graphic.drawRect(0, 0, cubeWidth, cubeHeight);
                 graphic.endFill();

                 cube.addChild(graphic);
                 cube.addChild(txt);

                 cube.mousedown = function() {
                     painProcess(this);
                 }

                 cube.mouseover = function(event) {
                     var _this = this.getChildAt(0);
                     _this.clear();
                     _this.beginFill(0xcccccc);
                     _this.lineStyle(2, 0xFF0000);
                     _this.drawRect(0, 0, cubeWidth, cubeHeight);
                     _this.endFill();
                     if (paintStart) {
                         painProcess(this);
                     }

                 }

                 cube.mouseout = function(event) {
                     var _this = this.getChildAt(0);
                     _this.clear();
                     _this.beginFill(this.origanlColor);
                     _this.drawRect(0, 0, cubeWidth, cubeHeight);
                     _this.endFill();
                 }

                 table.addChild(cube);
             }
         }

         stage.addChild(table);

         table.hitArea = new PIXI.Rectangle(0, 0, table.width, table.height);

         anime();
         // editAreaRenderer.render(stage);
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

     function painProcess(_cube) {
         var _targetCube = _cube;
         var _mirrorCube;
         var _mirrorIndex
         var _mirrorReverseText;

         var _color = [0x666666, 0xFFFFFF];

         if (_self.mirrorMode) {
             var i = table.getChildIndex(_cube);
             if (i < 6) {
                 _mirrorIndex = mirror[i];
             } else {
                 _mirrorIndex = mirror[i % 6];
             }

             _mirrorCube = table.getChildAt(i + _mirrorIndex);

             switch (brushType.font) {
                 case "L":
                     _mirrorReverseText = "R";
                     break;

                 case "R":
                     _mirrorReverseText = "L";
                     break;

                 case "M":
                     _mirrorReverseText = "C";
                     break;

                 case "C":
                     _mirrorReverseText = "M";
                     break;

                 default:
                     _mirrorReverseText = brushType.font
             }
         }

         if (brushType.bType == 'disabled') {
             reDrawCubeBg(_targetCube.getChildAt(0), _color[0]);
             _targetCube.getChildAt(1).visible = false;

             if (_self.mirrorMode) {
                 reDrawCubeBg(_mirrorCube.getChildAt(0), _color[0]);
                 _mirrorCube.getChildAt(1).visible = false;
             }

         } else {

             reDrawCubeBg(_targetCube.getChildAt(0), _color[1]);

             if (_self.mirrorMode) {
                 reDrawCubeBg(_mirrorCube.getChildAt(0), _color[1]);
             }

             if (brushType.font) {
                 _targetCube.getChildAt(1).visible = true;
                 _targetCube.getChildAt(1).text = brushType.font;
                 _targetCube.getChildAt(1).x = cubeWidth / 2 - _targetCube.getChildAt(1).width / 2;
                 _targetCube.getChildAt(1).y = cubeHeight / 2 - _targetCube.getChildAt(1).height / 2;

                 if (_self.mirrorMode) {
                     _mirrorCube.getChildAt(1).visible = true;
                     _mirrorCube.getChildAt(1).text = _mirrorReverseText;
                     _mirrorCube.getChildAt(1).x = cubeWidth / 2 - _mirrorCube.getChildAt(1).width / 2;
                     _mirrorCube.getChildAt(1).y = cubeHeight / 2 - _mirrorCube.getChildAt(1).height / 2;
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
         _targetCube.origanlColor = _targetCube.getChildAt(0).tint;
         console.log( _targetCube.origanlColor);
         if (_self.mirrorMode) {
             _mirrorCube.blockType = brushType.bType;
             _mirrorCube.blockContent = _mirrorReverseText;
             _mirrorCube.origanlColor = _mirrorCube.getChildAt(0).tint;
         }

     }

     function resetTable() {
         for (var i = 0; i < table.children.length; i++) {
             table.children[i].getChildAt(0).tint = 0x666666;
             table.children[i].getChildAt(1).visible = false;
             table.children[i].blockType = null;
             table.children[i].blockContent = null;
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
                     _color = 0x666666;
                     _text = '';
                     _fontVisible = false;
                 } else {
                     _color = 0xffffff;
                     _text = "";
                     _fontVisible = true;
                     if (_reData[i][j] != "+") {
                         _text = _reData[i][j];
                     }
                 }

                 _cube.getChildAt(0).tint = _color;
                 _cube.getChildAt(1).visible = _fontVisible;
                 _cube.getChildAt(1).text = _text;
                 _cube.getChildAt(1).x = cubeWidth / 2 - _cube.getChildAt(1).width / 2;
                 _cube.getChildAt(1).y = cubeHeight / 2 - _cube.getChildAt(1).height / 2;

                 colCounter++;
             }
         }

         editAreaRenderer.render(stage);
     }

     function reDrawCubeBg(_cube, _color) {
         _cube.clear();
         _cube.beginFill(_color);
         _cube.drawRect(0, 0, cubeWidth, cubeHeight);
         _cube.endFill();
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
