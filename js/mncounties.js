//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //use Promise.all to parallelize asynchronous data loading
    let promises = [
        d3.csv("data/unitsData.csv"),
        d3.json("data/MNCounties.topojson"),
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        let csvData = data[0],
            mn = data[1];
        console.log(csvData);
        console.log(mn);
    }
}

