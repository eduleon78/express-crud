var map = L.map('main_map').setView([10.992752, -63.814857], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var marker = L.marker([10.969136, -63.858322]).addTo(map);
var marker = L.marker([10.975314, -63.849984]).addTo(map);
var marker = L.marker([10.973468, -63.852968]).addTo(map);


