// global variable
var markers = []

d3.json("./files/data.json").then((data) => {

    let xCoords = topics.map((d, i) => 150 + i * 100); // separate our swarms by 100 pixels each
    let xScale = d3.scaleOrdinal().domain(topics).range(xCoords);
    var xAxis = d3.axisBottom().scale(xScale)

    svg.append('g')
        .attr('class', 'axis')
        .attr("id", "cat-axis")
        .attr('transform', 'translate(0, 300)')
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, 10);

    let yScale = d3
        .scaleLinear()
        .domain(d3.extent(data.map(d => getDate(d.date))))
        .range([height - 300, 200]); // provide some margin at the top and bottom

    let size = scaleSize(data);
    let yPos = 200;

    // add circles
    svg.selectAll(".circ")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "black")
        .attr("value", (d) => d.charity + ", " + d.date)
        .attr("fill", (d) => color(d.topic))
        .attr("r", (d) => size(Math.sqrt(d.size)))
        .attr("cx", (d) => xScale(d.topic))
        .attr("cy", (d) => yPos);

    let simulation = d3.forceSimulation(data)
        .force("x",
            d3.forceX((d) => { return xScale(d.topic); }).strength(0.5))
        .force("y",
            d3.forceY(function (d) { return yPos; }).strength(0.1))
        .force("collide",
            d3.forceCollide((d) => { return size(Math.sqrt(d.size)); }))
        .alphaDecay(0)
        .alpha(0.3)
        .on("tick", tick);

    // add event listeners
    document.getElementById("switchTime").addEventListener("click", function () { 
        simulation.stop();
        simulation = addTimeSVG(data);
    });

    // add event listeners
    document.getElementById("switchCat").addEventListener("click", function () { 
        simulation.stop();
        simulation = addCatSVG(data);
    });

    // add base map
    initMap();
    d3.select("#id30")

    
    let filteredData = data.filter(d => (d.charity == "Bridges to Prosperity") & (d.date == "20-Oct"))[0]
    addMap(filteredData);

    // given a click on a circle, filter the data and display the volunteers on the map
    d3.selectAll(".circ").on('click', function () {
        let value = this.getAttribute("value");
        let values = value.split(", ");
        let filteredData = data.filter(d => (d.charity == values[0]) & (d.date == values[1]))[0]
        addMap(filteredData);
    })

});
