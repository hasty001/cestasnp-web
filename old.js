var map=L.map('map').setView([48.85,19.96],8);
var markerLayerGroup=L.layerGroup().addTo(map);
var markerLayerGroup_all=L.layerGroup().addTo(map);
L.tileLayer('http://tiles.freemap.sk/T/{z}/{x}/{y}',{maxZoom:18,attribution:''}).addTo(map);do_points();
function removeMarkerLayerGroup(){map.removeLayer(markerLayerGroup);}
function do_points(){var myIcon={iconUrl:'https://cestasnp.sk/images/mapa/pin.png',iconAnchor:[14,32],popupAnchor:[3,-20]};
var marker;requestURL="https://sledovanie-cestasnp.rhcloud.com/ajax/pois/onroute?callback=?";
console.log("request to pois/onroute done");
$.getJSON(requestURL,function(json){parse_json=json.data;
for(var i in parse_json)
{var leafIcon=L.icon(myIcon);
marker=L.marker([parse_json[i].coordinates[1],
parse_json[i].coordinates[0]],
{icon:leafIcon}).bindPopup("<b><a href='javascript:all_messages("+parse_json[i].user_id+")'>"
+parse_json[i].group+"</a></b>, <b>"
+parse_json[i].date+"</br></b>"
+parse_json[i].text+"<img src='"
+parse_json[i].img+"'>",{maxHeight:200});
markerLayerGroup.addLayer(marker);}});};
function all_messages(userid){removeMarkerLayerGroup();
var myIcon={iconUrl:'https://cestasnp.sk/images/mapa/pin.png',
iconAnchor:[14,32],popupAnchor:[3,-20]};var marker_all
;requestURL="https://sledovanie-cestasnp.rhcloud.com/ajax/pois/usermessages?userid="+userid+"&callback=?";
console.log("request to pois/onroute done");
$.getJSON(requestURL,function(json){parse_json=json.data;
for(var i in parse_json)
{var leafIcon=L.icon(myIcon);
marker_all=L.marker([parse_json[i].coordinates[1],
parse_json[i].coordinates[0]],{icon:leafIcon}).bindPopup("<b>"
+parse_json[i].group+"</b>, <b>"
+parse_json[i].date+"</br></b>"
+parse_json[i].text+"<img src='"
+parse_json[i].img+"'>",{maxHeight:200});
markerLayerGroup_all.addLayer(marker_all);}});};

<div id="map" 
class="leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom" 
tabindex="0" 
style="position: relative;">
    <div class="leaflet-pane leaflet-map-pane" 
    style="transform: translate3d(-315px, -68px, 0px);">
        <div class="leaflet-pane leaflet-tile-pane">
            <div class="leaflet-layer " 
            style="z-index: 1; opacity: 1;">
                <div class="leaflet-tile-container leaflet-zoom-animated" 
                style="z-index: 18; transform: translate3d(0px, 0px, 0px) scale(1);">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/141/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(377px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/142/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(633px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/141/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(377px, 171px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/142/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(633px, 171px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/143/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(889px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/140/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(121px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/140/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(121px, 171px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/143/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(889px, 171px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/139/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(-135px, 171px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/144/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(1145px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/139/87" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(-135px, -85px, 0px); opacity: 1;">
                <img alt="" 
                src="http://tiles.freemap.sk/T/8/144/88" 
                class="leaflet-tile leaflet-tile-loaded" 
                style="width: 256px; height: 256px; transform: translate3d(1145px, 171px, 0px); opacity: 1;">
            </div>
        </div>
    </div>
    <div class="leaflet-pane leaflet-shadow-pane"></div>
    <div class="leaflet-pane leaflet-overlay-pane"></div>
    <div class="leaflet-pane leaflet-marker-pane">
        <img src="https://cestasnp.sk/images/mapa/pin.png" 
        class="leaflet-marker-icon leaflet-zoom-animated leaflet-interactive" 
        tabindex="0" 
        style="margin-left: -14px; margin-top: -32px; transform: translate3d(357px, 175px, 0px); z-index: 175;">
        <img src="https://cestasnp.sk/images/mapa/pin.png" 
        class="leaflet-marker-icon leaflet-zoom-animated leaflet-interactive" 
        tabindex="0" 
        style="margin-left: -14px; margin-top: -32px; transform: translate3d(976px, 65px, 0px); z-index: 65;">
        <img src="https://cestasnp.sk/images/mapa/pin.png" 
        class="leaflet-marker-icon leaflet-zoom-animated leaflet-interactive" 
        tabindex="0" 
        style="margin-left: -14px; margin-top: -32px; transform: translate3d(497px, 225px, 0px); z-index: 225;">
    </div>
    <div class="leaflet-pane leaflet-tooltip-pane"></div>
    <div class="leaflet-pane leaflet-popup-pane"></div>
    <div class="leaflet-proxy leaflet-zoom-animated" 
    style="transform: translate3d(36402px, 22549px, 0px) scale(128);">
    </div>
</div>
<div class="leaflet-control-container">
    <div class="leaflet-top leaflet-left">
        <div class="leaflet-control-zoom leaflet-bar leaflet-control">
            <a class="leaflet-control-zoom-in" href="#" title="Zoom in">+</a>
            <a class="leaflet-control-zoom-out" href="#" title="Zoom out">-</a>
        </div>
    </div>
    <div class="leaflet-top leaflet-right"></div>
    <div class="leaflet-bottom leaflet-left"></div>
    <div class="leaflet-bottom leaflet-right">
        <div class="leaflet-control-attribution leaflet-control">
            <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>
        </div>
    </div>
</div>
</div>