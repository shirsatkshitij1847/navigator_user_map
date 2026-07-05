const socket = io();

// Create map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Store all user markers
const markers = {};

// Check browser support
if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
} else {

    navigator.geolocation.watchPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            socket.emit("send-location", {
                latitude,
                longitude
            });

        },

        (error) => {

            console.log(error);

            switch (error.code) {

                case error.PERMISSION_DENIED:
                    alert("Location permission denied.");
                    break;

                case error.POSITION_UNAVAILABLE:
                    alert("Location unavailable.");
                    break;

                case error.TIMEOUT:
                    alert("Location request timed out.");
                    break;

                default:
                    alert("Unknown location error.");
            }

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

}

// Receive live locations
socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    if (markers[id]) {

        markers[id].setLatLng([latitude, longitude]);

    } else {

        markers[id] = L.marker([latitude, longitude]).addTo(map);

    }

    map.setView([latitude, longitude], 16);

});

// Remove marker when user disconnects
socket.on("user-disconnected", (id) => {

    if (markers[id]) {

        map.removeLayer(markers[id]);

        delete markers[id];

    }

});