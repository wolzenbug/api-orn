import canvasInstance from './canvas.js';

let getPrediction;
let getNewChar;
let showDebugInfo = false;

let currentTaskCharacter, task;

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
  } catch (error) {
    console.error(error);

    // TODO DISPLAY ERROR MESSAGE
  }
}

function toggleModalVisibility() {
  document.getElementById('dialog').classList.toggle('hidden');
}

function showModal(success, prediction, predictionAccuracy) {
  const modalTitle = document.getElementById('modal-title');
  const pred = document.getElementById('prediction');
  const acc = document.getElementById('accuracy');
  const primaryBtn = document.getElementById('modalPrimaryButton');

  // Setup modal content
  const successColor = success ? 'green' : 'red';
  primaryBtn.classList.add(
    `bg-${successColor}-600`,
    `hover:bg-${successColor}-700`
  );
  modalTitle.innerText = success ? 'Richtig' : 'Falsch';
  pred.innerText = prediction && `Erkanntes Zeichen: ${prediction}`;
  acc.innerText =
    predictionAccuracy &&
    `Sicherheit: ${(predictionAccuracy * 100).toFixed(2)}%`;

  // Show modal
  toggleModalVisibility();
}

function onSubmit() {
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
  getPrediction(
    canvasInstance.getCanvas(),
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

      showModal(isResultCorrect, predictedResult, predictedScore);
    }
  );
}

async function loadConfig() {
  if (lang == 'greek') {
    console.log('LOAD TESSERACT');

    const { loadModel, predictModel, getRandomChar } = await import(
      './tesseract/main.js'
    );
    getPrediction = predictModel;
    getNewChar = getRandomChar;

    loadModel();
  } else {
    console.log('LOAD TENSORFLOW');

    const { loadModel, predictModel, getRandomChar } = await import(
      './tensorflow/main.js'
    );
    getPrediction = predictModel;
    getNewChar = getRandomChar;

    loadModel(canvasInstance.getCanvas());
  }
}

init();
