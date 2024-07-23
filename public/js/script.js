const socket = io();

const name = prompt("Enter Your Name");

if (!name) {
    alert("Name is required");
    location.reload();
}
const names = {};
const nameContainer = document.querySelector("#names");

let latitude = null;
let longitude = null;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            socket.emit("send-location", { latitude, longitude, name });
        },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 500,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 21);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Made By Dhyey with ❤️'
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, name } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(name).openPopup();
        markers[id] = marker;
    }
    if(!names[id]){
        names[id] = name;
        console.log(names);
        nameContainer.innerHTML += `<li>${name}</li>`;
    }
});

socket.on("remove-location", (data) => {
    const { id } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        delete names[id];
    }
});
let lat = null;
let lng = null;
let waypoint = [L.latLng(latitude, longitude),L.latLng(lat, lng)];

map.on("click", (e) => {
    lat = e.latlng.lat;
    lng = e.latlng.lng;

    console.log(lat, lng);
    console.log("My location", { latitude, longitude });
    
    L.Routing.control({
        waypoints: [
            L.latLng(latitude, longitude),
            L.latLng(lat, lng)
        ],
    }).addTo(map);
});
