import config from '../config.js';

let getPrediction;
let getNewChar;
let showDebugInfo = false;

const successResultVoiceLines = [
  'Hammer, alter voll geil.',
  'Mega gut!',
  'Sie sind einfach ultra cool.',
  'Wie kann man nur so genial sein?',
  'Sehr professionell!',
  'Gut gemacht, weiter so!',
];

const failResultVoiceLines = [
  'Oh scheiße, das war nix.',
  'Nicht ganz korrekt, versuchs noch einmal.',
  "Geht's noch?",
  'Noch einmal, jetzt!',
  'Diesmal vielleicht richtig?',
  'Jetzt gib dir doch mal Mühe!',
];

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

let task = '',
  currentTaskCharacter = '';

async function init() {
  await loadConfig();

  canvas = document.getElementById('can');
  predContainer = document.getElementById('pred-container');
  ctx = canvas.getContext('2d'); // CanvasRenderingContext2D
  w = canvas.width;
  h = canvas.height;

  canvasResized = document.getElementById('can-resized');
  ctxResized = canvasResized.getContext('2d');

  if (!showDebugInfo) canvasResized.style.display = 'none';

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
      if (e.target.innerText === 'Starten') {
        newTask();
        e.target.innerText = 'Fertig';
        return;
      }
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
      speak(task);
    },
    false
  );
  document.getElementById('q').addEventListener(
    'click',
    function (e) {
      erase();
      newTask();
    },
    false
  );
  document.getElementById('s').addEventListener(
    'click',
    function (e) {
      onSave();
    },
    false
  );

  predContainer.style.display = 'none';
}

function onSubmit() {
  predContainer.style.display = 'inline-flex';
  predContainer.style.margin = '1rem';

  predict();
}

function onSave() {
  var link = document.createElement('a');
  link.download = 'canvas.png';
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
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

function newTask() {
  const character = getNewChar();
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

function speak(text) {
  let msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = 'de-DE';
  msg.volume = 0.5; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2

  speechSynthesis.speak(msg);
}

async function predict() {
  const { predictedScore, predictedResult } = await getPrediction(canvas);

  const isResultCorrect = predictedResult === currentTaskCharacter;

  if (showDebugInfo) {
    speak(
      isResultCorrect
        ? successResultVoiceLines[
            Math.floor(Math.random() * successResultVoiceLines.length)
          ]
        : failResultVoiceLines[
            Math.floor(Math.random() * failResultVoiceLines.length)
          ]
    );
  }

  // Append new DOM object
  if (showDebugInfo) {
    const tag = document.createElement('p');
    const text = document.createTextNode(
      `Erkannt: '${predictedResult}' Wahrscheinlichkeit: ${(
        predictedScore * 100
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

async function loadConfig() {
  if (config.alphabet == 'greek') {
    console.log('LOAD GREEK');

    const { loadModel, predictModel, getRandomChar } = await import(
      './tesseract/main.js'
    );
    getPrediction = predictModel;
    getNewChar = getRandomChar;

    loadModel();
  } else {
    console.log('LOAD LATIN');

    const { loadModel, predictModel, getRandomChar } = await import(
      './tensorflow/main.js'
    );
    getPrediction = predictModel;
    getNewChar = getRandomChar;

    loadModel();
  }

  if (config.debug) {
    console.log('DEBUG MODE ACTIVE');
    showDebugInfo = config.debug;
  }
}

init();
