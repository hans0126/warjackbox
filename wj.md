# Warjack damage record #
This program is use html5 render engine PIXI.js.
like this.
![Alt text](/img.jpg)
##methods##
|Method|Description|Detail|
|---|---|---|
|init(dom)|start this program| dom element |
|getBrush(string)|change brush|brush collection:"disabled","enabled","c","l","m","r","g","i","s"|
|resetTable(fn)| reset all value|callback:function(new data)|
|changeDataRender(array)|input array to renew edit area|&nbsp;|
|getDataArray()|output data|return array|
|changeMode(string,fn)|change display mode 1 table/ 2 tables|string:0 is single table 1 twin table <br/> fn:when change complete callback|

##options##

|Option|value|Description|
|---|---|---|
|mirrorMode|false|&nbsp;|
|displayMode|0|0:warjack 1:colossus|
|LRbind|true|on mirror mode you draw "L" then  mirrored object is "R".<br/> relatively you draw "R" mirrored object is "L"|
|MCbind|true|on mirror mode you draw "M" then  mirrored object is "C".<br/> relatively you draw "C" mirrored object is "M"|
|tableData|[ ]|before init() set data|

