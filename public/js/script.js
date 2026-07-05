const socket = io();

// Create map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// OpenStreetMap layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Store all markers
const markers = {};

// Get live location
if (navigator.geolocation) {

    navigator.geolocation.watchPosition(

        (position) => {

            const { latitude, longitude } = position.coords;

            socket.emit("send-location", {
                latitude,
                longitude,
            });

        },

        (error) => {
            console.log(error);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }

    );

} else {

    alert("Geolocation is not supported.");

}

// Receive locations from server
socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    map.setView([latitude, longitude], 16);

    if (markers[id]) {

        markers[id].setLatLng([latitude, longitude]);

    } else {

        markers[id] = L.marker([latitude, longitude]).addTo(map);

    }

});

// Remove marker when user disconnects
socket.on("user-disconnected", (id) => {

    if (markers[id]) {

        map.removeLayer(markers[id]);

        delete markers[id];

    }

});