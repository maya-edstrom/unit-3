(function(){
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; // Matching your CSV column names
var expressed = attrArray[0]; // Initially expressed as varA


    window.addEventListener('load', setMap);

    function setMap() {
        var width = window.innerWidth * 0.5,
            height = 460;

        let map = d3.select("#map-container")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        let projection = d3.geoAlbers()
            .center([-94.5, 46.2])
            .rotate([0, 0, 0])
            .parallels([-46.5, 46.5])
            .scale(3000)
            .translate([width / 2, height / 2]);

        let path = d3.geoPath()
            .projection(projection);

        Promise.all([
            d3.csv("data/unitsData.csv"),
            d3.json("data/mn-county-2010.topojson")
            ]).then(callback);

            function callback(data) {
                let csvData = data[0], 
                    mn = data[1];

                let MNCounties = topojson.feature(mn, mn.objects.mncounty2010).features;

                for (var i = 0; i < csvData.length; i++) {
                    var csvRegion = csvData[i];
                    var csvKey = csvRegion.adm1_code; // Use COUNTY as the key

                    for (var a = 0; a < MNCounties.length; a++) {
                        var geojsonProps = MNCounties[a].properties;
                        var geojsonKey = geojsonProps.COUNTY;

                        if (geojsonKey == csvKey) {
                            attrArray.forEach(function(attr){
                                var val = parseFloat(csvRegion[attr]);
                                geojsonProps[attr] = val;
                            });
                        }
                    }
                }

                let counties = map.selectAll(".county")
                    .data(MNCounties)
                    .enter()
                    .append("path")
                    .attr("class", "county")
                    .attr("d", path)
                    .attr("fill", "#ccc")
                    .attr("stroke", "#333");

                console.log("MNCounties:", MNCounties);

                var colorScale = makeColorScale(MNCounties, expressed);

                console.log("colorScale:", colorScale);

                counties.attr("fill", function(d){
                    return colorScale(d.properties[expressed]);
                });

                setChart(csvData, colorScale);
                createDropdown(csvData, MNCounties); // Pass csvData and MNCounties to createDropdown
            
            }
        }

        function makeColorScale(data, expressed) {
            var colorClasses = [
                "#D4B9DA",
                "#C994C7",
                "#DF65B0",
                "#DD1C77",
                "#980043"
            ];

            var colorScale = d3.scaleQuantile()
                .range(colorClasses);

            var domainArray = [];
            for (var i = 0; i < data.length; i++) {
                var val = parseFloat(data[i].properties[expressed]);
                domainArray.push(val);
            }

            colorScale.domain(domainArray);

            console.log("Color Scale Domain:", colorScale.domain()); // Log the domain of the color scale

            return colorScale;
        }

        function setChart(csvData, colorScale) {
            var chartWidth = window.innerWidth * 0.425,
                chartHeight = 460;
        
            var chart = d3.select("#chart-container")
                .append("svg")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .attr("class", "chart");
        
            console.log("CSV Data for Chart:", csvData); // Debug CSV Data

              // Debugging individual values for max calculation
    csvData.forEach(function(d) {
        var val = parseFloat(d[expressed]);
        console.log("Value for " + expressed + ":", val);
    });
        
            var maxVal = d3.max(csvData, function(d) { return parseFloat(d[expressed]); });

            console.log("Max Value for Bar Chart:", maxVal); // Debug Max Value
        
            var yScale = d3.scaleLinear()
                .range([0, chartHeight])
                .domain([0, maxVal]);
        
            var bars = chart.selectAll(".bar")
                .data(csvData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("data-id", function(d) { return d.COUNTY; })
                .attr("width", chartWidth / csvData.length - 1)
                .attr("x", function(_, i){
                    return i * (chartWidth / csvData.length);
                })
                .attr("height", function(d){
                    return yScale(parseFloat(d[expressed]));
                })
                .attr("y", function(d){
                    return chartHeight - yScale(parseFloat(d[expressed]));
                })
                .style("fill", function(d){
                    return colorScale(d[expressed]);
                });
        
            console.log("Number of Bars Generated:", bars.size()); // Debug Bar Count
        
            chart.append("text")
                .attr("x", 20)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .text("Number of Variable " + expressed);

        d3.selectAll(".county")
            .on("mouseover", highlight)
            .on("mouseout", dehighlight);
    }

    function highlight(d) {
        var selected = d3.select(this);
        selected.style("stroke", "white").style("stroke-width", "4");

        if(d.properties && d.properties.COUNTY){
            d3.select(".bar[data-id='" + d.properties.COUNT + "']")
                .style("stroke", "white")
                .style("stroke-width", "4");
        }
    }

    function dehighlight(d) {
        var selected = d3.select(this);
        selected.style("stroke", "").style("stroke-width", "");

        if(d.properties && d.properties.COUNTY){
            d3.select(".bar[data-id='" + d.properties.COUNTY + "']")
                .style("stroke", "")
                .style("stroke-width", "");
        }
    }

    function createDropdown(csvData, MNCounties){
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData, MNCounties); // Call changeAttribute on change
            });
    
        dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");
    
        dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    }
    
    function changeAttribute(attribute, csvData, MNCounties){
        expressed = attribute; // Update the expressed attribute
    
        var colorScale = makeColorScale(MNCounties, expressed);
    
        // Update choropleth map
        var counties = d3.selectAll(".county")
            .transition() // Add a transition for smooth updating
            .duration(1000) // Transition duration
            .attr("fill", function(d){
                return colorScale(d.properties[expressed]);
            });
    
        // Update bar chart
        updateChart(csvData, colorScale);
    }
    
    function updateChart(csvData, colorScale){
        var chartWidth = window.innerWidth * 0.425,
            chartHeight = 460;
    
        var maxVal = d3.max(csvData, function(d) { return parseFloat(d[expressed]); });
    
        var yScale = d3.scaleLinear()
            .range([0, chartHeight])
            .domain([0, maxVal]);
    
        var chart = d3.select(".chart");
    
        // Update bars
        var bars = chart.selectAll(".bar")
            .data(csvData)
            .transition() // Add a transition for smooth updating
            .duration(1000) // Transition duration
            .attr("height", function(d){
                return yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d){
                return chartHeight - yScale(parseFloat(d[expressed]));
            })
            .style("fill", function(d){
                return colorScale(d[expressed]);
            });
    
        // Update chart title
        chart.select(".chartTitle")
            .text("Number of Variable " + expressed);
    }
})();
