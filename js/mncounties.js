//begin script when window loads
window.onload = setMap;

//set up choropleth map
function setMap() {
    //map frame dimensions
    let width = 600,
        height = 460;

    //create new svg container for the map
    let map = d3.select("#container")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

   //create Albers equal area conic projection centered on Minnesota
    let projection = d3.geoAlbers()
        .center([-94.5, 46.2])
        .rotate([0, 0, 0])
        .parallels([-46.5, 46.5])        
        .scale(3000)
        .translate([width / 2, height / 2]);

    let path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    let promises = [];
    promises.push(d3.csv("data/unitsData.csv"));
    promises.push(d3.json("data/mn-county-2010.topojson"));
    promises.push(d3.json("data/mn-county-2010.topojson"));

    Promise.all(promises).then(callback);

    function callback(data) {
        let csvData = data[0],
            allmn = data[1];
            mn = data[2];

            console.log(allmn);

        
    let allMNCounties = topojson.feature(allmn, allmn.objects.mncounty2010).features,
    MNCounties = topojson.feature(mn, mn.objects.mncounty2010).features;

        let allCounties = map.append("path")
            .datum(allMNCounties)
            .attr("class", "counties")
            .attr("d", path)
            .attr("fill", "#ccc") // set a fill color
            .attr("stroke", "#333"); // set a stroke color

        let selectCounties = map.selectAll(".selectCounties")
            .data(MNCounties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path)
            .attr("fill", "#ccc") // set a fill color
            .attr("stroke", "#333"); // set a stroke color
    }
}
