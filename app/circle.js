let topics = ["Gender Equality", "Children and Youth", "Education", "Energy/ Sustainability", "Financial support", "Homelessness", "Human Rights", "Crisis", "Conservation", "Recycling", "Health", "Healthcare", "Infrastructures"];
let color = d3.scaleOrdinal().domain(topics).range(d3.schemeSet3);

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function tick() {
    d3.selectAll(".circ")
        .attr("cx", (d) => { return d.x })
        .attr("cy", (d) => { return d.y })
        .attr("id", (d, i) => { return "id"+i})
        .on("mouseover", function (d) {
            d3.select(this).style("opacity", 1.0)
                .transition()
                .attr('r', this.getAttribute('r') * 1.2);

            div.transition()
                .duration(1000)
                .style("opacity", .9);
            div.html(d.charity + "<br>" + d.date)
                .style("left", (d.x + 25) + "px")
                .style("top", (d.y) + "px");
        })
        .on("mouseout", function (d) {
            d3.select(this).style("opacity", 0.5)
                .transition()
                .attr('r', this.getAttribute('r') / 1.2);
            div.transition()
                .duration(1000)
                .style("opacity", 0);
        })
}

function wrap(text, width) {
    // helper function to wrap the tick labels according to a set width
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function scaleSize(data) {
    let sizeDomain = d3.extent(data.map(d => d.size));
    sizeDomain = sizeDomain.map((d) => Math.sqrt(d));
    return d3.scaleLinear().domain(sizeDomain).range([10, 50]); // radius range
}

// define helper function for date
function getDate(dateString) {
    var parts = dateString.split('-');
    var mydate = new Date(parts[1] + '20' + parts[0]);
    return mydate
}

// add main circle plot - time x-axis
function addTimeSVG(data) {

    let xScale = d3.scaleTime()
        .domain(d3.extent(data.map(d => getDate(d.date))).reverse())
        .range([width - 200, 200]); // provide some margin at the top and bottom

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(4);

    svg.select("#cat-axis")
        .transition().duration(500)
        .call(xAxis);

    d3.selectAll(".tick text")
        .call(wrap, 10)

    const yPos = 200;

    svg.selectAll(".circ")
        .transition()
        .attr("cx", (d) => xScale(getDate(d.date)))
        .attr("cy", yPos);

    let size = scaleSize(data);

    let simulation = d3.forceSimulation(data)
        .force("x",
            d3.forceX((d) => { return xScale(getDate(d.date)); }).strength(1))
        .force("y",
            d3.forceY(function (d) { return yPos; }).strength(0.2))
        .force("collide",
            d3.forceCollide((d) => { return size(Math.sqrt(d.size)); }))
        .alphaDecay(0)
        .alpha(0.3)
        .on("tick", tick);

    return simulation;
}

function addCatSVG(data) {
    let xCoords = topics.map((d, i) => 150 + i * 100); // separate our swarms by 100 pixels each
    let xScale = d3.scaleOrdinal().domain(topics).range(xCoords);
    var xAxis = d3.axisBottom().scale(xScale)

    svg.select("#cat-axis")
        .transition().duration(500)
        .call(xAxis);

    yPos = 200

    let size = scaleSize(data);

    // add circles
    svg.selectAll(".circ")
        .transition()
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

    return simulation;
}

// add title
function addTitle(id, text) {
    var title = document.getElementById(id);
    if (title.textContent) {
        title.textContent = []; // empty the list
    }
    title.textContent += text;
}
