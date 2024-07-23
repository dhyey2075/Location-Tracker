const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('send-location', (data) => {
        const { latitude, longitude, name } = data;
        io.emit('receive-location', { id: socket.id, latitude, longitude, name });
    });

    socket.on('disconnect', () => {
        io.emit('remove-location', { id: socket.id });
    });
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
