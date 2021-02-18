function initMap() {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: maptoken
    }).addTo(mymap);
}

function addMap(data) {
    addTitle("titleid", data.charity + " - " + data.topic)

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