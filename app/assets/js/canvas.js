const SAMPLE_IMG_WIDTH = 28;
const SAMPLE_IMG_HEIGHT = 28;

const x = 'black',
  y = 10,
  l = 'round';

let canvas,
  container,
  ctx,
  w = 0,
  h = 0,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  currPath = new Path2D();

container = document.getElementById('container');
canvas = document.getElementById('can');
ctx = canvas.getContext('2d');
w = canvas.width;
h = canvas.height;

let boundingMinX = w,
  boundingMaxX = 0,
  boundingMinY = h,
  boundingMaxY = 0;

function normalize(array) {
  const normalizedArray = [];
  for (let i = 0; i < array.length; i++) {
    normalizedArray.push(array[i] / 255);
  }
  return normalizedArray;
}

function getScaledCanvasFittedData() {
  const copy = document.createElement('canvas');
  const copyContext = copy.getContext('2d');
  const copyTranslated = document.createElement('canvas');
  const copyTranslatedContext = copy.getContext('2d');

  const m = document
    .createElementNS('http://www.w3.org/2000/svg', 'svg')
    .createSVGMatrix();
  const p = new Path2D();

  const bW = boundingMaxX - boundingMinX;
  const bH = boundingMaxY - boundingMinY;

  let pathScaleFactor = bW > bH ? SAMPLE_IMG_WIDTH / bW : SAMPLE_IMG_HEIGHT / bH;

  let t = m.scale(pathScaleFactor);

  p.addPath(currPath, t);

  copy.width = canvas.width;
  copy.height = canvas.height;

  copyTranslated.width = SAMPLE_IMG_WIDTH;
  copyTranslated.height = SAMPLE_IMG_HEIGHT;

  copyContext.lineCap = l;
  copyContext.lineWidth = 2;
  copyContext.stroke(p);

  const imgData = copyContext.getImageData(0, 0, w, h);

  const fX = bW > bH ? 0 : (SAMPLE_IMG_WIDTH - (bW * pathScaleFactor)) / 2;
  const fY = bW > bH ? (SAMPLE_IMG_HEIGHT - (bH * pathScaleFactor)) / 2 : 0;
  const shiftX = -boundingMinX * pathScaleFactor + fX;
  const shiftY = -boundingMinY * pathScaleFactor + fY;

  copyTranslatedContext.putImageData(imgData, shiftX, shiftY);

  const imgDataTranslated = copyTranslatedContext.getImageData(0, 0, SAMPLE_IMG_WIDTH, SAMPLE_IMG_HEIGHT);
  
  const alphaFilteredData = imgDataTranslated.data.filter((d, i) => (i + 1) % 4 === 0);
  const values = normalize(Uint8Array.from(alphaFilteredData));

  return values;
}

function getScaledCanvasData() {
  const copy = document.createElement('canvas');
  const copyContext = copy.getContext('2d');

  const scaleFactor = 0.1;

  const m = document
    .createElementNS('http://www.w3.org/2000/svg', 'svg')
    .createSVGMatrix();
  const p = new Path2D();
  const t = m.scale(scaleFactor);

  p.addPath(currPath, t);

  copy.width = canvas.width * scaleFactor;
  copy.height = canvas.height * scaleFactor;

  copyContext.lineCap = l;
  copyContext.lineWidth = 2;
  copyContext.stroke(p);

  const imgData = copyContext.getImageData(0, 0, 28, 28);

  const alphaFilteredData = imgData.data.filter((d, i) => (i + 1) % 4 === 0);
  const values = normalize(Uint8Array.from(alphaFilteredData));

  return values;
}

function reset() {
  prevX = 0;
  currX = 0;
  prevY = 0;
  currY = 0;
  boundingMinX = w;
  boundingMaxX = 0;
  boundingMinY = h;
  boundingMaxY = 0;
}

function draw() {
  currPath.moveTo(prevX, prevY);
  currPath.lineTo(currX, currY);
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.lineCap = l;
  ctx.stroke(currPath);


  let minX = currX - y;
  let minY = currY - y;
  let maxX = currX + y;
  let maxY = currY + y;

  if (minX < boundingMinX) boundingMinX = minX > 0 ? minX : 0;
  if (minY < boundingMinY) boundingMinY = minY > 0 ? minY : 0;
  if (maxX > boundingMaxX) boundingMaxX = maxX < w ? maxX : w;
  if (maxY > boundingMaxY) boundingMaxY = maxY < h ? maxY : h;
}

export default {
  getCanvas() {
    return canvas;
  },
  getScaledData(fit = true) {
    return fit ? getScaledCanvasFittedData() : getScaledCanvasData();
  },
  save() {
    var link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  },
  findxy(res, e) {
    if (res == 'down') {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - container.offsetLeft - canvas.offsetLeft;
      currY = e.clientY - container.offsetTop - canvas.offsetTop;

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
        currX = e.clientX - container.offsetLeft - canvas.offsetLeft;
        currY = e.clientY - container.offsetTop - canvas.offsetTop;

        draw();
      }
    }
  },
  erase() {
    ctx.clearRect(0, 0, w, h);
    currPath = new Path2D();
    reset();
  },
  getLanguage() {
    return canvas.getAttribute('lang');
  },
  getTech() {
    return canvas.getAttribute('t');
  },
  getModes() {
    return canvas.getAttribute('m')?.split(',');
  },
  getNumberRounds() {
    const num = parseInt(canvas.getAttribute('r'));

    return isNaN(num) ? null : num;
  },
};
