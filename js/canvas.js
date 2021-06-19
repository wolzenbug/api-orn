const x = 'black',
  y = 10,
  l = 'round';

let canvas,
  canvasResized,
  ctx,
  ctxResized,
  w = 0,
  h = 0,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  currPath = new Path2D();

canvas = document.getElementById('can');
ctx = canvas.getContext('2d');
w = canvas.width;
h = canvas.height;

canvasResized = document.getElementById('can-resized');
ctxResized = canvasResized.getContext('2d');

function draw() {
  currPath.moveTo(prevX, prevY);
  currPath.lineTo(currX, currY);
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.lineCap = l;
  ctx.stroke(currPath);
}

export default {
  getCanvas() {
    return canvas;
  },
  getScaledData(scaleFactor) {
    // https://stackoverflow.com/a/51348478/6783713
    const copy = document.createElement('canvas');
    const copyContext = copy.getContext('2d');

    const m = document
      .createElementNS('http://www.w3.org/2000/svg', 'svg')
      .createSVGMatrix();
    const p = new Path2D();
    const t = m.scale(scaleFactor);

    p.addPath(currPath, t);

    copy.width = canvas.width * scaleFactor;
    copy.height = canvas.height * scaleFactor;

    ctxResized.lineCap = l;
    ctxResized.lineWidth = 2;
    ctxResized.stroke(p);

    copyContext.lineCap = l;
    copyContext.lineWidth = 2;
    copyContext.stroke(p);

    return copyContext.getImageData(
      0,
      0,
      28,
      28
    );
  },
  save() {
    var link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  },
  hideCanvasResized() {
    canvasResized.style.display = 'none';
  },
  findxy(res, e) {
    if (res == 'down') {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;

      flag = true;
      ctx.beginPath();
      ctx.fillStyle = x;
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
    }
    if (res == 'up' || res == 'out') {
      flag = false;
    }
    if (res == 'move') {
      if (flag) {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        draw();
      }
    }
  },
  erase() {
    ctx.clearRect(0, 0, w, h);
    ctxResized.clearRect(0, 0, w, h);
    currPath = new Path2D();
    // document.getElementById('canvasimg').style.display = 'none';
  }
}