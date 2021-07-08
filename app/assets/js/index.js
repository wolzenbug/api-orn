import canvasInstance from './canvas.js';
import { isString } from './helpers.js';
import localeLangMaps from './languagemaps.js';
import config from './config.js';

const locale = 'de-DE';
const TESSERACT = 'tsr';
const TENSORFLOW = 'tf';

let getPrediction;
let getNewChar;
let currentTaskCharacter, taskText;

async function init() {
  try {
    await loadConfig();

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
          // Removing shade and adding white background
          canvas.classList.remove('bg-gray-200');
          canvas.classList.add('bg-white');

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
        speak(taskText);
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
    const modalPrimaryButton = document.getElementById('modalPrimaryButton');
    modalPrimaryButton.addEventListener(
      'click',
      function (e) {
        toggleModalVisibility();
        canvasInstance.erase();

        modalPrimaryButton.classList.remove(
          'bg-green-600',
          'hover:bg-green-700'
        );
        modalPrimaryButton.classList.remove('bg-red-600', 'hover:bg-red-700');
        newTask();
      },
      false
    );
    document.getElementById('modalSecondaryButton').addEventListener(
      'click',
      function (e) {
        canvasInstance.save();
      },
      false
    );

    const taskField = document.getElementById('taskField');
    switch (config.kState) {
      case 'r':
        taskField.classList.add(`hidden`);
        break;
      case 't':
        break;
      case 'rt':
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);

    // TODO DISPLAY ERROR MESSAGE
  }
}

function localizeAndMapCharacter(char) {
  const lang = canvasInstance.getLanguage();
  const localizedChar = localeLangMaps[locale][lang].find(
    (charMap) => charMap[char]
  )[char];
  return localizedChar;
}

function toggleModalVisibility() {
  document.getElementById('dialog').classList.toggle('hidden');
}

function showModal(success, prediction, predictionAccuracy) {
  const modalTitle = document.getElementById('modal-title');
  const pred = document.getElementById('prediction');
  const taskChar = document.getElementById('taskchar');
  const primaryBtn = document.getElementById('modalPrimaryButton');

  // Setup modal content
  const successColor = success ? 'green' : 'red';
  primaryBtn.classList.add(
    `bg-${successColor}-600`,
    `hover:bg-${successColor}-700`
  );
  let modalTitleText = success ? 'Richtig' : 'Falsch';
  pred.innerText = prediction ? `Erkanntes Zeichen: ${prediction}` : '';
  taskChar.innerText = `Verlangtes Zeichen: ${currentTaskCharacter}`;
  const t = canvasInstance.getTech();
  if (t !== TESSERACT) {
    modalTitleText += predictionAccuracy
      ? ` (${(predictionAccuracy * 100).toFixed(2)}%)`
      : '';
  }
  modalTitle.innerText = modalTitleText;

  // Show modal
  toggleModalVisibility();
}

function onSubmit() {
  predict();
}

function newTask() {
  currentTaskCharacter = getNewChar();
  taskText = `Zeichnen Sie ${localizeAndMapCharacter(currentTaskCharacter)}`;
  document.getElementById('taskField').innerHTML = taskText;
}

function speak(text) {
  let msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.lang = locale;
  msg.volume = 0.5; // 0 to 1
  msg.rate = 1; // 0.1 to 10
  msg.pitch = 1; //0 to 2

  speechSynthesis.speak(msg);
}

function predict() {
  getPrediction(
    canvasInstance.getCanvas(),
    ({ predictedScore, predictedResult }) => {
      console.log(`currentTaskCharacter`, currentTaskCharacter);
      const isResultCorrect = predictedResult === currentTaskCharacter;

      console.log(`predictedResult`, predictedResult);
      showModal(isResultCorrect, predictedResult, predictedScore);
    }
  );
}

async function loadConfig() {
  const lang = canvasInstance.getLanguage();
  const t = canvasInstance.getTech();

  if (isString(lang) && isString(t)) {
    {
      if (t == TESSERACT) {
        console.log('LOAD TESSERACT');

        const { loadModel, predictModel, getRandomChar } = await import(
          './tesseract/main.js'
        );
        getPrediction = predictModel;
        getNewChar = getRandomChar;

        loadModel(lang);
      } else if (t == TENSORFLOW) {
        console.log('LOAD TENSORFLOW');

        const { loadModel, predictModel, getRandomChar } = await import(
          './tensorflow/main.js'
        );
        getPrediction = predictModel;
        getNewChar = getRandomChar;

        loadModel(lang);
      }
    }
  }
}

init();
