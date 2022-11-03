// tile layers for the map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// darkmode layer 
var darkmode = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

// highway layer 
var highways =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme',
	minZoom: 1,
	maxZoom: 11
});

// geomap layer
var GeoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});

// topography layer
var topmap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// make basemap object 
let basemaps = {
    DarkMode: darkmode,
    HighWays: highways,
    Geo : GeoMap,
    Topography : topmap,
    Default: defaultMap,
};

// make a map object 
// GA coordinates = 32.1656° N, 82.9001° W   --- ca = 36.7783° N, 119.4179° W
var myMap = L.map("map",{
    center: [32.1656, -82.900],
    zoom: 3,
    layers: [defaultMap, darkmode, highways, GeoMap, topmap]
});

// add defualt map 
defaultMap.addTo(myMap);

// tectonic plate  layer
var tectonicplates = new L.layerGroup();

// variable to hold earthquake data 
var earthquakes = new L.layerGroup();

// getting data for earthquakes
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        // console.log(earthquakeData);
    // loading data and create functions
    // function that chooses color for each data point 
        function colorchoice(depth){
            if (depth > 90)
                return "#fc0303";
            else if(depth > 70)
                return "#fc0384";
            else if(depth > 50)
                return "#c203fc";
            else if(depth > 30)
                return "#7303fc";
            else if(depth > 10)
                return"#030bfc";
            else
                return"#0390fc";
        }

        // make function that determines size 
        function quakesize(mag){
            if(mag == 0)
                return 1;
            else
                return mag * 5;
        }
        // add on to the style for each data point 
        function datastyle(feature)
        {
            return{
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: colorchoice(feature.geometry.coordinates[2]), // locates the depths value in the dataset 
                color: "000000",
                radius: quakesize(feature.properties.mag),
                weight: 0.5,
                stroke: true
                
            }
        }
        // add geoJson data 
        L.geoJson(earthquakeData, {
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            // style each marker 
            style: datastyle,
            // add popups  
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);
    }
);
 
earthquakes.addTo(myMap)


// getting data for tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(
    function(plateData){
    // loading data 
    L.geoJson(plateData,{
        // add styling to make the lines visible
        color: "#9b05f2",
        weight: 3
    }).addTo(tectonicplates);
});

// add tectonic plates to map 
tectonicplates.addTo(myMap);

//overlay for tectonic plates 
var overlay = {
    "Tectonic Plates": tectonicplates,
    "Earthquake Data": earthquakes
};

// add earthquakes to map 

// add layer control
L.control
    .layers(basemaps, overlay)
    .addTo(myMap)
// add the legend to the map 
var legend = L.control({
    position: "bottomright"
});

// add the properties for the legend 
legend.onAdd = function(){
    var div = L.DomUtil.create("div", "info legend");

    //set up intervals  -10-10(#0390fc), 10-30(#030bfc), 30-50(#7303fc), 50-70(#c203fc), 70-90(#fc0384), 90+(#fc0303)
    var intervals = [-10,10,30,50,70,90];
    //set colors for each intervals
    var colors = [
        "#0390fc",
        "#030bfc",
        "#7303fc",
        "#c203fc",
        "#fc0384",
        "#fc0303"
    ];

    // loop through intervals and colors while generating the label with a colored square
    for(var i = 0; i < intervals.length; i++)
    {
        div.innerHTML += '<i style="background' + colors[i] + '"></i> ' +
        intervals[i] + (intervals[i + 1] ? 'km -' + intervals[i + 1] + 'km<br>' : '+');
        
        //"<i style = 'background: "
            // +colors[i]
            // +"'></i> "
            // +intervals[i]
            // +(intervals[i +1] ? "KM &ndash KM;" + intervals[i+1] + "KM<br>": "+");
    }

    return div;
};

//add legend to map 
legend.addTo(myMap)