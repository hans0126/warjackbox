 function warjackBox() {

     var _self = this;

     //methods
     _self.init = init;
     _self.getBrush = getBrush;
     _self.resetTable = resetTable;
     _self.changeDataRender = changeDataRender;
     _self.getDataArray = getDataArray;
     _self.changeMode = changeMode;
     _self.exportImg = exportImg;
     _self.getTotalType = getTotalType;
     //options
     _self.mirrorMode = false;
     _self.displayMode = 0; //0:warjack 1:colossus
     _self.LRbind = true;
     _self.MCbind = true;
     _self.tableData = [];
     _self.requestAnime = null;

     var stage = new PIXI.Container(),
         table = new PIXI.Container(),
         table2 = new PIXI.Container();

     var cubeWidth = 40,
         cubeHeight = 40;

     var arrData = [];
     var mirror = [5, 3, 1, -1, -3, -5];
     var reverseMirror = [-5, -3, -1, 1, 3, 5];
     var brushType = {
         bType: 'enabled',
         font: ""
     };
     var paintStart = false;
     var cubeColor = [0x666666, 0xFFFFFF, 0xcccccc]; //disable,normal,hover
     var areaWidth = 300;
     var areaHeight = 300;

     function init(_element) {

         if (!_element) {
             console.log('%c lose stage element!', 'background: #F00; color: #FFF');
             return;
         }

         var _areaWidth = areaWidth;

         switch (_self.tableData.length) {
             case 1:
                 _self.displayMode = 0;
                 break;

             case 2:
                 _self.displayMode = 1;
                 break;
         }

         if (_self.displayMode == 1) {
             _areaWidth = areaWidth * 2;
         }

         editAreaRenderer = new PIXI.autoDetectRenderer(_areaWidth, areaHeight);
         editAreaRenderer.roundPixels = true;
         _element.appendChild(editAreaRenderer.view);

         table.interactive = table2.interactive = true;
         table.buttonMode = true;
         table.defaultCursor = "crosshair";

         table.mousedown = table2.mousedown = function() {
             if (!brushType) return;
             paintStart = true;
         };

         table.mouseup = table.mouseout = table2.mouseup = table2.mouseout = function() {
             paintStart = false;
         };

         createCubes(table);
         createCubes(table2);

         stage.addChild(table);
         stage.addChild(table2);

         table.hitArea = new PIXI.Rectangle(0, 0, table.width, table.height);
         table2.hitArea = new PIXI.Rectangle(0, 0, table2.width, table2.height);

         table.idName = "table";
         table2.idName = "table2";

         table.x = areaWidth / 2 - table.width / 2;
         table.y = table2.y = areaHeight / 2 - table.height / 2;

         table2.x = areaWidth + areaWidth / 2 - table.width / 2;

         if (_self.displayMode === 0) {
             table2.visible = false;
         }

         loadTableData();

         anime();
     }

     function changeMode(_mode, _fn) {
         _self.displayMode = _mode;
         if (_mode === 0) {
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
                 cube.blockContent = '-';
                 cube.origanlColor = cubeColor[0];

                 graphic.beginFill(cube.origanlColor);
                 graphic.drawRect(0, 0, cubeWidth, cubeHeight);
                 graphic.endFill();

                 cube.addChild(graphic);
                 cube.addChild(txt);

                 cube.mousedown = cubeMousedown;

                 cube.mouseover = cubeMouseover;

                 cube.mouseout = cubeMouseout;

                 _table.addChild(cube);
             }
         }
     }

     function cubeMousedown() {
         if (!brushType) return;
         painProcess(this);
     }

     function cubeMouseover() {
         reDrawCubeBg(this.getChildAt(0), cubeColor[2], true);
         if (paintStart) {
             painProcess(this);
         }
     }

     function cubeMouseout() {
         reDrawCubeBg(this.getChildAt(0), this.origanlColor);
     }

     function painProcess(_cube) {
         var _targetCube = _cube;
         var _mirrorCube;
         var _mirrorIndex;
         var _mirrorReverseText;
         var _currentColor;

         if (_self.mirrorMode) {
             var _idx;
             if (_self.displayMode === 0) {
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
                     _mirrorReverseText = brushType.font;
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
                     _mirrorCube.getChildAt(1).visible = false;
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

             var _index;
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
             return _index;
         }
     }

     function resetTable(_fn) {
         var _array = [table, table2];
         for (var k = 0; k < _array.length; k++) {
             for (var i = 0; i < _array[k].children.length; i++) {
                 var _cube = _array[k].getChildAt(i);
                 reDrawCubeBg(_cube.getChildAt(0), cubeColor[0]);
                 _cube.getChildAt(1).visible = false;
                 _cube.blockType = "enabled";
                 _cube.blockContent = "-";
                 _cube.origanlColor = cubeColor[0];
             }
         }

         if (typeof(_fn) == "function") {
             _fn(getDataArray());
         }
     }


     function exportImg() {
         editAreaRenderer.render(stage);
         return editAreaRenderer.view.toDataURL("image/png");
     }

     function getBrush(_b) {

         switch (_b) {
             case 'disabled':
                 brushType = {
                     bType: _b,
                     font: ""
                 };
                 break;

             case 'enabled':
                 brushType = {
                     bType: _b,
                     font: ""
                 };
                 break;

             default:
                 brushType = {
                     bType: 'enabled',
                     font: _b
                 };
         }
     }

     function getDataArray() {
         var tableGroup = [table, table2],
             loadLimit,
             returnArr = [];

         if (_self.displayMode === 0) {
             loadLimit = 1;
         } else {
             loadLimit = 2;
         }

         for (var i = 0; i < loadLimit; i++) {

             var _arr = [];

             for (var k = 0; k < 6; k++) {
                 _arr[k] = [];
             }

             for (var j = 0; j < tableGroup[i].children.length; j++) {

                 var _outSymbol = '-';
                 if (tableGroup[i].getChildAt(j).blockType == "disabled") {
                     _outSymbol = '-';

                 } else {
                     if (tableGroup[i].getChildAt(j).blockContent !== '') {
                         _outSymbol = tableGroup[i].getChildAt(j).blockContent;
                     } else {
                         _outSymbol = '+';
                     }
                 }

                 _arr[Math.floor(j / 6)].push(_outSymbol);

             }

             returnArr.push(_arr);

         }

         return returnArr;
     }

     function changeDataRender(_data) {
         _self.tableData = _data;
         loadTableData();
     }

     function loadTableData() {

         var _tempTable = [table, table2];
         for (var i = 0; i < _self.tableData.length; i++) {
             transferAndRender(_self.tableData[i], _tempTable[i]);
         }
     }

     function transferAndRender(_data, _table) {

         var _reg = /[clmrgis+-]/ig,
             _reData = [],
             colCounter = 0;

         for (var ii = 0; ii < _data.length; ii++) {
             _reData[ii] = [];
             var _col = _data[ii];

             for (var jj = 0; jj < _col.length; jj++) {
                 var _status = _col[jj].match(_reg);
                 if (_status) {
                     _reData[ii].push(_status[0].toUpperCase());
                 } else {
                     _reData[ii].push("-");
                 }

             }
         }

         loopBreak:

             for (var i = 0; i < _reData.length; i++) {
                 for (var j = 0; j < _reData[i].length; j++) {

                     var _color,
                         _text,
                         _cube = _table.getChildAt(colCounter),
                         _fontVisible,
                         _blockType;

                     if (_reData[i][j] == "-") {
                         _blockType = "disabled";
                         _color = cubeColor[0];
                         _text = '';
                         _fontVisible = false;
                     } else {
                         _blockType = "enabled";
                         _color = cubeColor[1];
                         _text = "";
                         _fontVisible = true;
                         if (_reData[i][j] != "+") {
                             _text = _reData[i][j];
                         }
                     }

                     reDrawCubeBg(_cube.getChildAt(0), _color);
                     drawSymbol(_cube.getChildAt(1), _text, _fontVisible);
                     _cube.origanlColor = _color;
                     _cube.blockType = _blockType;
                     _cube.blockContent = _text;

                     colCounter++;
                     if (colCounter == 36) {
                         break loopBreak;
                     }
                 }
             }

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

     function getTotalType(_array) {
         var _data,
             _reSystem = [],
             _life = 0;

         if (typeof(_array) == "object") {
             _data = _array;
         } else {
             _data = getDataArray();
         }

         for (var i = 0; i < _data.length; i++) {
             for (var j = 0; j < _data[i].length; j++) {
                 for (var k = 0; k < _data[i][j].length; k++) {
                     var _va = _data[i][j][k];
                     if (_reSystem.indexOf(_va) == -1 && _va != "+" && _va != "-") {
                         _reSystem.push(_va);
                     }
                     if (_va != "-") {
                         _life++;
                     }
                 }
             }
         }

         return {
             life: _life,
             system: _reSystem
         };

     }

     function anime() {
         _self.requestAnime = window.requestAnimFrame(anime);
         editAreaRenderer.render(stage);
     }
 }
