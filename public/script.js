const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lineWidthSlider = document.getElementById('thickness');
const colorPicker = document.getElementById('color');
const clearButton = document.getElementById('clear');
const penButton = document.getElementById('pen');
const eraserButton = document.getElementById('eraser');

const socket = io();

canvas.width = 375;
canvas.height = 500;

let drawing = false;
let prevPos = null;
let lastColor = getRandomColor();
let currentColor = lastColor;
colorPicker.value = lastColor;
ctx.strokeStyle = lastColor;
let eraseColor = 'rgba(250,250,250,1)';

ctx.lineWidth = lineWidthSlider.value;
ctx.lineCap = 'round';


function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}
function getTouchPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.touches[0].clientX - rect.left,
    y: event.touches[0].clientY - rect.top
  };
}

function draw(x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}


function sendDrawEvent(x, y, isDrawing) {
    socket.emit('draw', {
        x1: prevPos.x,
        y1: prevPos.y,
        x2: currentPos.x,
        y2: currentPos.y,
        color: ctx.strokeStyle,
        width: ctx.lineWidth,
        from: socket.id,
      });
      
}


function handleMouseEvent(event) {
  const currentPos = getMousePos(canvas, event);

  if (event.type === 'mousedown' || event.type === 'mousemove' && event.buttons === 1) {
    if (prevPos === null) {
      prevPos = currentPos;
      // return;
    }

    draw(prevPos.x, prevPos.y, currentPos.x, currentPos.y, currentColor, ctx.lineWidth);

    // サーバーに描画データを送信
    socket.emit('draw', {
      x1: prevPos.x,
      y1: prevPos.y,
      x2: currentPos.x,
      y2: currentPos.y,
      color: currentColor,
      width: ctx.lineWidth,
      from: socket.id,
    });

    prevPos = currentPos;

  } else if (event.type === 'mouseup') {
    prevPos = null;
  }

  
}

function handleTouchEvent(event) {
  event.preventDefault();

  const currentPos = getTouchPos(canvas, event);

  if (event.type === 'touchstart' || event.type === 'touchmove') {
    if (prevPos === null) {
      prevPos = currentPos;
      // return;
    }

    draw(prevPos.x, prevPos.y, currentPos.x, currentPos.y, currentColor, ctx.lineWidth);

    // サーバーに描画データを送信
    socket.emit('draw', {
      x1: prevPos.x,
      y1: prevPos.y,
      x2: currentPos.x,
      y2: currentPos.y,
      color: currentColor,
      width: ctx.lineWidth,
      from: socket.id,
    });

    prevPos = currentPos;
    
  } else if (event.type === 'touchend') {
    prevPos = null;
  }

  
}



canvas.addEventListener('mousedown', (e) => {
  handleMouseEvent(e);
});

canvas.addEventListener('mousemove', (e) => {
  handleMouseEvent(e);
});

canvas.addEventListener('mouseup', () => {
  prevPos = null;
});

canvas.addEventListener('mouseout', (e) => {
  handleMouseEvent(e, false);
});

canvas.addEventListener('touchstart', (e) => {
  handleTouchEvent(e);
});

canvas.addEventListener('touchmove', (e) => {
  handleTouchEvent(e);
});

canvas.addEventListener('touchend', (e) => {
  prevPos = null;
});

socket.on('draw', ({ x1, y1, x2, y2, color, width, from }) => {

  if (from === socket.id) return; // 自分が送信したイベントはスキップ
  draw(x1, y1, x2, y2, color, width);
});

lineWidthSlider.addEventListener('input', () => {
  ctx.lineWidth = lineWidthSlider.value;
});

colorPicker.addEventListener('input', () => {
  ctx.strokeStyle = colorPicker.value;
  lastColor = colorPicker.value;
  currentColor = colorPicker.value;
});

penButton.addEventListener('click', () => {
  // ctx.globalCompositeOperation = 'source-over';
  currentColor = lastColor
  eraserButton.classList.remove('active');
  penButton.classList.add('active');
});

eraserButton.addEventListener('click', () => {
  // ctx.globalCompositeOperation = 'destination-out';
  currentColor = eraseColor;
  penButton.classList.remove('active');
  eraserButton.classList.add('active');
});

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
});
  
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});