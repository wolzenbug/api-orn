
// JavaScript
// source: https://www.kaggle.com/crawford/emnist?select=emnist-byclass-mapping.txt
const emnistMap = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72,
  73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
  97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
  112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
];
// import * as tf from '@tensorflow/tfjs';

let canvas,
  ctx,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  predContainer;

const x = 'black',
  y = 2;

let model;

function init() {
  canvas = document.getElementById('can');
  predContainer = document.getElementById('pred-container');
  ctx = canvas.getContext('2d');
  w = canvas.width;
  h = canvas.height;

  canvas.addEventListener(
    'mousemove',
    function (e) {
      findxy('move', e);
    },
    false
  );
  canvas.addEventListener(
    'mousedown',
    function (e) {
      findxy('down', e);
    },
    false
  );
  canvas.addEventListener(
    'mouseup',
    function (e) {
      findxy('up', e);
    },
    false
  );
  canvas.addEventListener(
    'mouseout',
    function (e) {
      findxy('out', e);
    },
    false
  );

  loadModel();
  predContainer.style.display = "none";
}

function onSubmit() {
  predContainer.style.display = "block";
  predict();
}

async function loadModel() {
  model = await tf.loadLayersModel('./model/model.json');

  console.log(model);
}

function draw() {
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.stroke();
  ctx.closePath();
}

function erase() {
  ctx.clearRect(0, 0, w, h);
  document.getElementById('canvasimg').style.display = 'none';
}

function predict() {
  //   document.getElementById('canvasimg').style.border = '2px solid';
  //   const dataURL = canvas.toDataURL();
  //   document.getElementById('canvasimg').src = dataURL;
  //   document.getElementById('canvasimg').style.display = 'inline';

  // red=imgData.data[0];
  // green=imgData.data[1];
  // blue=imgData.data[2];
  // alpha=imgData.data[3];
  // -> [redpx0,greenpx0,bluepx0,alphapx0,…]

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  console.log(`imgData`, imgData);
  alphaFilteredData = imgData.data.filter((d, i) => (i + 1) % 4 === 0);
  blackValuesOnly = alphaFilteredData.filter((d) => d > 0);

  // console.log(`alphaFilteredData`, alphaFilteredData);
  // console.log(`alphaFilteredData string [${alphaFilteredData.toString()}]`);
  // console.log(`blackValuesOnly`, blackValuesOnly);

  const x = tf.tensor(Uint8Array.from(alphaFilteredData));
  console.log(`x`, x);
  const example = tf.reshape(x, [1, 28, 28]);
  console.log(`example`, example);
  const prediction = model.predict(example); // <- this is a tensor larri :-)
  console.log(`prediction`, prediction);
  prediction.print();
  const flattenedPrediction = prediction.dataSync();
  console.log(flattenedPrediction);
  const i = flattenedPrediction.indexOf(Math.max(...flattenedPrediction));
  console.log(`i`, i);
  console.log(`flattenedPrediction[i]`, flattenedPrediction[i]);
  document.getElementById(
    'predictionOutput'
  ).innerHTML = `Ergebnis: ${String.fromCharCode(
    emnistMap[i]
  )}; Wahrscheinlichkeit: ${(flattenedPrediction[i] * 100).toFixed(4)}%`;
}

function findxy(res, e) {
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
}