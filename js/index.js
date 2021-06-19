import config from '../config.js';

import canvasInstance from "./canvas.js";

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

let predContainer,
  task = '',
  currentTaskCharacter = '';

async function init() {
  try {
    await loadConfig();

    predContainer = document.getElementById('pred-container')

    if (!showDebugInfo) canvasInstance.hideCanvasResized();

    const canvas = canvasInstance.getCanvas();

    canvas.addEventListener(
      'mousemove',
      function (e) {
        canvasInstance.findxy('move', e);
      },
      false
    );
    canvas.addEventListener(
      'mousedown',
      function (e) {
        canvasInstance.findxy('down', e);
      },
      false
    );
    canvas.addEventListener(
      'mouseup',
      function (e) {
        canvasInstance.findxy('up', e);
      },
      false
    );
    canvas.addEventListener(
      'mouseout',
      function (e) {
        canvasInstance.findxy('out', e);
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
        canvasInstance.erase();
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
        canvasInstance.erase();
        newTask();
      },
      false
    );
    document.getElementById('s').addEventListener(
      'click',
      function (e) {
        canvasInstance.save();
      },
      false
    );
  } catch (error) {
    console.error(error);

    // TODO DISPLAY ERROR MESSAGE
  }

  predContainer.style.display = 'none';
}

function onSubmit() {
  predContainer.style.display = 'inline-flex';
  predContainer.style.margin = '1rem';

  predict();
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

function predict() {
  getPrediction(canvasInstance.getCanvas(),
    ({ predictedScore, predictedResult }) => {
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
    });
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

    loadModel(canvasInstance.getCanvas());
  }

  if (config.debug) {
    console.log('DEBUG MODE ACTIVE');
    showDebugInfo = config.debug;
  }
}

init();
