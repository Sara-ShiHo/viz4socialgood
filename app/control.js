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
    .on("mouseover", function (d) {
      d3.select(this).style("opacity", 1.0)
      div.transition()
        .duration(100)
        .style("opacity", .9);
      div.html(d.charity + "<br>" + d.date)
        .style("left", (d.x + 25) + "px")
        .style("top", (d.y) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("opacity", 0.5)
      div.transition()
        .duration(100)
        .style("opacity", 0);
    })
}

function addAxis(xScale) {
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,450)')
    .call(d3.axisBottom(xScale));
}

// add main circle plot
function addTimeSVG(data) {

  function getDate(dateString) {
    var parts = dateString.split('-');
    var mydate = new Date(parts[1] + '1' + parts[0]);
    return mydate
  }

  let xScale = d3.scaleTime()
    .domain(d3.extent(data.map(d => getDate(d.date))))
    .range([width - 200, 200]); // provide some margin at the top and bottom

  let yScale = d3
    .scaleLinear()
    .domain(d3.extent(data.map(d => getDate(d.date))))
    .range([height - 200, 200]); // provide some margin at the top and bottom

  // size
  let sizeDomain = d3.extent(data.map(d => d.size));
  sizeDomain = sizeDomain.map((d) => Math.sqrt(d));
  let size = d3.scaleLinear().domain(sizeDomain).range([10, 50]); // radius range

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
    .attr("cx", (d) => xScale(getDate(d.date)))
    .attr("cy", (d) => yScale(getDate(d.date)))
    ;

  addAxis(xScale)

  // simulation
  d3.forceSimulation(data)
    .force("x",
      d3.forceX((d) => { return xScale(getDate(d.date)); }).strength(0.5))
    .force("y",
      d3.forceY(function (d) { return yScale(getDate(d.date)); }).strength(0.1))
    .force("collide",
      d3.forceCollide((d) => { return size(Math.sqrt(d.size)); }))
    .alphaDecay(0)
    .alpha(0.3)
    .on("tick", tick);
}

// add main circle plot
function addSVG(data) {

  function getDate(dateString) {
    var parts = dateString.split('-');
    // var mydate = new Date(parts[1] + '1' + parts[0]).getMonth(); 
    return Math.sqrt(parts[0])
  }
  // x position
  let xCoords = topics.map((d, i) => 150 + i * 100); // separate our swarms by 100 pixels each
  let xScale = d3.scaleOrdinal().domain(topics).range(xCoords);

  let yScale = d3
    .scaleLinear()
    .domain(d3.extent(data.map(d => getDate(d.date))))
    .range([height - 200, 200]); // provide some margin at the top and bottom

  // size
  let sizeDomain = d3.extent(data.map(d => d.size));
  sizeDomain = sizeDomain.map((d) => Math.sqrt(d));
  let size = d3.scaleLinear().domain(sizeDomain).range([10, 50]); // radius range

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
    .attr("cy", (d) => yScale(getDate(d.date)))
    ;

  addAxis(xScale)

  // simulation
  d3.forceSimulation(data)
    .force("x",
      d3.forceX((d) => { return xScale(d.topic); }).strength(0.5))
    .force("y",
      d3.forceY(function (d) { return yScale(getDate(d.date)); }).strength(0.1))
    .force("collide",
      d3.forceCollide((d) => { return size(Math.sqrt(d.size)); }))
    .alphaDecay(0)
    .alpha(0.3)
    .on("tick", tick);
}


// add map
function addMap(data) {
  if (markers) {
    markers.forEach(mark => mymap.removeLayer(mark)) // remove existing markers
    markers = []; // empty the list
  }
  var markerColor = color(data.topic)
  // loop through the volunteers
  var volunteers = data.volunteers
  volunteers.forEach(volunteer => {
    address = volunteer.volunteer_city + "+" + volunteer.volunteer_country
    url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + googletoken
    fetch(url).then(response =>
      response.json()).then(geodata => {
        coords = geodata.results[0].geometry.location;

        // add marker to the markers array
        markers.push(L.circleMarker([coords.lat, coords.lng], { color: markerColor })
          .bindPopup(volunteer.volunteer_city + ", " + volunteer.volunteer_country + "<br>" + volunteer.volunteer + "<br>" + `<a href="${volunteer.url}" target="_blank">Visit Viz</a>`)
          .addTo(mymap));
      })
  })
}

// add title
function addTitle(id, text) {
  var title = document.getElementById(id);
  if (title.textContent) {
    title.textContent = []; // empty the list
  }
  title.textContent += text;
}

// global variable
var markers = []

d3.json("./files/data.json").then((data) => {
  document.getElementById("switch").addEventListener("click", function(){ addTimeSVG(data) });

  addSVG(data);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: maptoken
  }).addTo(mymap);

  // given a click on a circle, filter the data and display the volunteers on the map
  d3.selectAll(".circ").on('click', function () {
    let value = this.getAttribute("value");
    let values = value.split(", ");
    let filteredData = data.filter(d => (d.charity == values[0]) & (d.date == values[1]))[0]

    // Add Title
    addTitle("titleid", filteredData.charity)
    addTitle("dateid", filteredData.date)
    addTitle("topicid", filteredData.topic)

    // Add Map
    addMap(filteredData);
  })

});
