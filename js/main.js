(function(){
//pseudo-global variables
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

//begin script when window loads
    window.onload = setMap;

//set up choropleth map
    function setMap() {
        //map frame dimensions
        var width = window.innerWidth * 0.5,
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
                Background = data[1];
                Counties = data[2];


            let backgroundLines = topojson.feature(Background, Background.objects.backgroundLines),
            countyLines= topojson.feature(Counties, Counties.objects.mn-county-2010);

            //variables for data join
            var attrArray = ["varA", "varB", "varC", "varD", "varE"];

            //loop through csv to assign each set of csv attribute values to geojson region
            for (var i = 0; i < csvData.length; i++) {
                var csvRegion = csvData[i]; //the current region
                var csvKey = csvRegion.adm1_code; //the CSV primary key

                //loop through geojson regions to find correct region
                for (var a = 0; a < MNCounties.length; a++) {

                    var geojsonProps = MNCounties[a].properties; //the current region geojson properties

                    var geojsonKey = geojsonProps.COUNTY; //the geojson primary key

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
                    return ".selectCounties" + d.properties.adm1_code;
                })
                .attr("d", path)
                .attr("fill", "#ccc") // set a fill color
                .attr("stroke", "#333"); // set a stroke color

            //create the color scale
            var colorScale = makeColorScale(MNCounties, expressed);


            //add enumeration units to the map
            setEnumerationUnits(MNCounties, map, path, colorScale, expressed);


            //add coordinated visualization to the map
            setChart(csvData, colorScale);

            //function to create color scale generator
            function makeColorScale(data, expressed) {
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
                for (var i = 0; i < data.length; i++) {
                    var val = parseFloat(data[i][expressed]);
                    domainArray.push(val);
                }

                //assign array of expressed values as scale domain
                colorScale.domain(domainArray);

                console.log(colorScale)

                return colorScale;

            }


//function to create coordinated bar chart
            function setChart(csvData, colorScale){
                //chart frame dimensions
                var chartWidth = window.innerWidth * 0.425,
                    chartHeight = 460;

                //create a second svg element to hold the bar chart
                var chart = d3.select("body")
                    .append("svg")
                    .attr("width", chartWidth)
                    .attr("height", chartHeight)
                    .attr("class", "chart");

                //create a scale to size bars proportionally to frame
                var yScale = d3.scaleLinear()
                    .range([0, chartHeight])
                    .domain([0, 105]);

                //set bars for each province
                var bars = chart.selectAll(".bars")
                    .data(csvData)
                    .enter()
                    .append("rect")
                    .sort(function(a, b){
                        return a[expressed]-b[expressed]
                    })
                    .attr("class", function(d){
                        return "bars " + d.adm1_code;
                    })
                    .attr("width", chartWidth / csvData.length - 1)
                    .attr("x", function(d, i){
                        return i * (chartWidth / csvData.length);
                    })
                    .attr("height", function(d){
                        return yScale(parseFloat(d[expressed]));
                    })
                    .attr("y", function(d){
                        return chartHeight - yScale(parseFloat(d[expressed]))

                            .style("fill", function(d){
                                return colorScale(d[expressed]);
                            });

                    });
            };

            function setEnumerationUnits(data, map, path, colorScale, expressed) {
                var selectCounties = map.selectAll(".selectCounties")
                    .data(MNCounties)
                    .enter()
                    .append("path")
                    .attr("class", function(d){
                        return ".selectCounties" + d.properties.adm1_code;
                    })
                    .attr("d", path)
                    .style("fill", function(d){
                        //  console.log(d);
                        return colorScale(d.properties[expressed]);
                    });
            }


        }
    }
})();