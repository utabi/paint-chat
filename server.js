// server.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const os = require('os');
const ejs = require('ejs');
const opn = require('opn');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 2525;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  opn(`http://localhost:${PORT}`);
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const interfaceInfo of interfaces[name]) {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        return interfaceInfo.address + ':' + PORT;
      }
    }
  }
  return null;
}
const localIpAddress = getLocalIpAddress();

app.get('/', (req, res) => {
  res.render('index', { localIpAddress });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('draw', ({ x1, y1, x2, y2, color, width, from }) => {
    io.emit('draw', { x1, y1, x2, y2, color, width, from });
  });
  

  // 全消しイベントを受信したときの処理
  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


