import { normalize } from './helpers.js';

// JavaScript
// source: https://www.kaggle.com/crawford/emnist?select=emnist-byclass-mapping.txt
const emnistMap = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73,
  74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98,
  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
  115, 116, 117, 118, 119, 120, 121, 122,
];
// import * as tf from '@tensorflow/tfjs';

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
  predContainer,
  currPath = new Path2D();

const x = 'black',
  y = 10,
  l = 'round';

let model;

let task = '',
  currentTaskCharacter = '';

function init() {
  canvas = document.getElementById('can');
  predContainer = document.getElementById('pred-container');
  ctx = canvas.getContext('2d'); // CanvasRenderingContext2D
  w = canvas.width;
  h = canvas.height;

  canvasResized = document.getElementById('can-resized');
  ctxResized = canvasResized.getContext('2d');

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

  document.getElementById('btn').addEventListener(
    'click',
    function (e) {
      onSubmit();
    },
    false
  );
  document.getElementById('clr').addEventListener(
    'click',
    function (e) {
      erase();
    },
    false
  );
  document.getElementById('r').addEventListener(
    'click',
    function (e) {
      speak();
    },
    false
  );
  document.getElementById('q').addEventListener(
    'click',
    function (e) {
      newTask();
    },
    false
  );

  loadModel();

  predContainer.style.display = 'none';
}

function execTesseract() {
  const worker = Tesseract.createWorker({
    logger: (m) => console.log(m),
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage('grc');
    await worker.initialize('grc');
    await worker.setParameters({
      tessedit_pageseg_mode: 10, //  PSM_SINGLE_CHAR
      tessedit_char_whitelist:
        'ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτΥυΦφΧχΨψΩω',
    });
    const {
      data: { text },
    } = await worker.recognize(canvas);
    console.log(text);
    await worker.terminate();
  })();
}

function onSubmit() {
  predContainer.style.display = 'inline-flex';
  predContainer.style.margin = '1rem';

  execTesseract();

  predict();
}

async function loadModel() {
  model = await tf.loadLayersModel('./model/model.json');

  console.log(model);
}

function draw() {
  currPath.moveTo(prevX, prevY);
  currPath.lineTo(currX, currY);
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.lineCap = l;
  ctx.stroke(currPath);
}

function erase() {
  ctx.clearRect(0, 0, w, h);
  ctxResized.clearRect(0, 0, w, h);
  currPath = new Path2D();
  // document.getElementById('canvasimg').style.display = 'none';
}

function scale() {
  // https://stackoverflow.com/a/51348478/6783713
  const m = document
    .createElementNS('http://www.w3.org/2000/svg', 'svg')
    .createSVGMatrix();
  const p = new Path2D();
  const t = m.scale(0.1);
  p.addPath(currPath, t);
  ctxResized.lineCap = l;
  ctxResized.lineWidth = 2;
  ctxResized.stroke(p);
}

function newTask() {
  const randomCharIndex = Math.floor(Math.random() * emnistMap.length);
  const character = String.fromCharCode(emnistMap[randomCharIndex]);
  let charInfo = '';
  if (!isNaN(character * 1)) {
    charInfo += 'eine';
  } else {
    if (character == character.toUpperCase()) {
      charInfo += 'ein großes';
    } else if (character == character.toLowerCase()) {
      charInfo += 'ein kleines';
    }
  }
  currentTaskCharacter = character;
  task = `Zeichnen Sie ${charInfo} ${character}`;
  document.getElementById('taskField').innerHTML = task;
  console.log(`task`, task);
}

function speak() {
  let msg = new SpeechSynthesisUtterance();
  msg.text = task;
  msg.lang = 'de-DE';
  msg.volume = 0.5; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2

  // msg.onend = function (e) {
  //   document.querySelector('#output').innerText =
  //     event.elapsedTime / 1000 + ' Sek';
  // };

  speechSynthesis.speak(msg);
}

function predict() {
  scale();

  const imgData = ctxResized.getImageData(
    0,
    0,
    canvasResized.width,
    canvasResized.height
  );

  const alphaFilteredData = imgData.data.filter((d, i) => (i + 1) % 4 === 0);

  const values = normalize(Uint8Array.from(alphaFilteredData));
  // console.log('values', values);
  const x = tf.tensor(values);
  // console.log('x', x);

  const example = tf.reshape(x, [-1, 28, 28, 1]);
  // console.log(`example`, example);

  const prediction = model.predict(example);
  // console.log(`prediction`, prediction);

  prediction.print();

  const flattenedPrediction = prediction.dataSync();
  console.log(flattenedPrediction);

  const i = flattenedPrediction.indexOf(Math.max(...flattenedPrediction));
  const predictedResult = String.fromCharCode(emnistMap[i]);
  const isResultCorrect = predictedResult === currentTaskCharacter;
  // console.log(`i`, i);
  // console.log(`flattenedPrediction[i]`, flattenedPrediction[i]);

  // Append new DOM object
  const tag = document.createElement('p');
  const text = document.createTextNode(
    `Erkannt: '${predictedResult}' Wahrscheinlichkeit: ${(
      flattenedPrediction[i] * 100
    ).toFixed(2)}%`
  );
  const color = isResultCorrect ? 'bg-green-500' : 'bg-red-500';
  tag.classList.add(
    color,
    'p-1.5',
    'inline-block',
    'px-2',
    'rounded-sm',
    'shadow-sm'
  );

  tag.appendChild(text);
  const element = document.getElementById('pred-container');
  element.appendChild(tag);
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

init();
