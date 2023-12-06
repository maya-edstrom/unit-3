(function(){
//pseudo-global variables
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

//begin script when window loads
    window.onload = setMap;

//set up choropleth map
    function setMap() {
        //map frame dimensions
        var width = 600,
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


            let allMNCounties = topojson.feature(allmn, allmn.objects.mncounty2010).features,
                MNCounties = topojson.feature(mn, mn.objects.mncounty2010).features;


            //variables for data join
            var attrArray = ["varA", "varB", "varC", "varD", "varE"];

            //loop through csv to assign each set of csv attribute values to geojson region
            for (var i = 0; i < csvData.length; i++) {
                var csvRegion = csvData[i]; //the current region
                var csvKey = csvRegion.adm1_code; //the CSV primary key

                //loop through geojson regions to find correct region
                for (var a = 0; a < MNCounties.length; a++) {

                    var geojsonProps = MNCounties[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.adm1_code; //the geojson primary key

                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey) {

                        //assign all attributes and values
                        attrArray.forEach(function (attr) {
                            var val = parseFloat(csvRegion[attr]); //get csv attribute value
                            geojsonProps[attr] = val; //assign attribute and value to geojson properties


                        });
                    }
                }
            }


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

            //create the color scale
            var colorScale = makeColorScale(MNCounties);

            //add enumeration units to the map
            setEnumerationUnits(allMNCounties, map, path, colorScale);

            //function to create color scale generator
            function makeColorScale(data){
                var colorClasses = [
                    "#D4B9DA",
                    "#C994C7",
                    "#DF65B0",
                    "#DD1C77",
                    "#980043"
                ];

                //create color scale generator
                var colorScale = d3.scaleQuantile()
                    .range(colorClasses);

                //build array of all values of the expressed attribute
                var domainArray = [];
                for (var i=0; i<data.length; i++){
                    var val = parseFloat(data[i][expressed]);
                    domainArray.push(val);
                };

                //assign array of expressed values as scale domain
                colorScale.domain(domainArray);

                return colorScale;
            };

            function setEnumerationUnits(data, map, path, colorScale) {
                // your implementation here
            }


        }
    }
})();