//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {
    //map frame dimensions
    let width = 960,
        height = 460;

    //create new svg container for the map
    let map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    let projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);


    let path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    let promises = []
        promises.push(d3.csv("data/unitsData.csv"));
        promises.push(d3.json("data/AllMNCounties.topojson"));
        promises.push(d3.json("data/MNCounties.topojson"));

    Promise.all(promises).then(callback);
}
    function callback(data) {

        let csvData = data[0],
            allmn = data[1]
        mn = data[2];

        let allMNCounties = topojson.feature(allmn, allmn.objects.AllMNCounties).features,
            MNCounties = topojson.feature(mn, mn.objects.MNCounties).features;

        let allCounties = map.append("path")
            .datum(allMNCounties)
            .attr("class", "counties")
            .attr("d", path);

        let selectCounties = map.selectAll(".selectCounties")
            .data(MNCounties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);

    }


