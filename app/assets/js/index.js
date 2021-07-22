import canvasInstance from './canvas.js';
import { isString } from './helpers.js';
import localeLangMaps from './languagemaps.js';
import config from './config.js';

const locale = 'de-DE';
const TESSERACT = 'tsr';
const TENSORFLOW = 'tf';

let getPrediction,
  getNewChar,
  currentTaskCharacter,
  taskText,
  numTasks,
  curNumTasks,
  correctTasks,
  progressText,
  progressBar;

async function init() {
  try {
    await loadConfig();

    const canvas = canvasInstance.getCanvas();
    let autoRead = false;

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

    /* TOUCH DEVICES */
    canvas.addEventListener(
      'touchmove',
      function (e) {
        var touch = e.touches[0];

        var mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
      },
      false
    );
    canvas.addEventListener(
      'touchstart',
      function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
      },
      false
    );
    canvas.addEventListener(
      'touchend',
      function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mouseup', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
      },
      false
    );
    const readButton = document.getElementById('r');
    readButton.addEventListener(
      'click',
      function (e) {
        speak(taskText);
      },
      false
    );

    document.getElementById('btn').addEventListener(
      'click',
      function (e) {
        if (e.target.innerText === 'Starten') {
          // Removing canvas overlay and setting initial state
          document.getElementById('canvas-overlay').remove();
          document
            .getElementById('canvas-wrapper')
            .classList.remove('relative');
          setUIStateBasedOnModes(canvasInstance.getModes());
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

        curNumTasks++;

        if (numTasks != null) {
          if (curNumTasks < numTasks) {
            updateProgress();
            newTask();
          } else if (curNumTasks === numTasks) {
            showModalWithEndResult();
            updateProgress();
          } else {
            modalPrimaryButton.classList.remove(
              `bg-indigo-600`,
              `hover:bg-indigo-500`
            );

            modalPrimaryButton.innerText = 'Weiter';
            document.getElementById('modalSecondaryButton').style.display =
              'block';

            curNumTasks = 0;
            correctTasks = 0;

            updateProgress();
            newTask();
          }
        } else {
          newTask();
        }
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

function hasDesiredMode(modes, desiredMode) {
  return modes.find((m) => m === desiredMode) !== undefined;
}

function setUIStateBasedOnModes(modes) {
  const readButton = document.getElementById('r');
  const taskField = document.getElementById('taskField');
  console.log(`modes`, modes);
  const textMode = hasDesiredMode(modes, config.modes.TEXT);
  const readMode = hasDesiredMode(modes, config.modes.READ);

  // if no mode specified -> fall back to text mode
  if (textMode || (!readMode && !textMode)) {
    document.getElementById('speaker-icon').remove();
    taskField.classList.remove('hidden');
  }
  if (readMode) {
    readButton.classList.remove('cursor-default');
    readButton.classList.add(
      'hover:bg-indigo-500',
      'hover:text-white',
      'speaker-button'
    );
    readButton.disabled = false;
    taskField.classList.remove('hidden');
    taskField.innerHTML = 'Vorlesen';
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

function showModalWithResult(success, prediction, predictionAccuracy) {
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

function showModalWithEndResult() {
  const modalTitle = document.getElementById('modal-title');
  const pred = document.getElementById('prediction');
  const taskChar = document.getElementById('taskchar');
  const primaryBtn = document.getElementById('modalPrimaryButton');
  const secondaryBtn = document.getElementById('modalSecondaryButton');

  // Setup modal content
  primaryBtn.classList.add(`bg-indigo-600`, `hover:bg-indigo-500`);

  primaryBtn.innerText = 'Neuer Versuch';
  secondaryBtn.style.display = 'none';

  let modalTitleText = 'Endergebnis';

  pred.innerHTML = `Richtig: ${correctTasks}`;
  taskChar.innerHTML = `Falsch: ${numTasks - correctTasks}`;
  modalTitle.innerHTML = modalTitleText;

  // Show modal
  toggleModalVisibility();
}

function onSubmit() {
  predict();
}

function newTask() {
  currentTaskCharacter = getNewChar();
  taskText = `Zeichnen Sie ${localizeAndMapCharacter(currentTaskCharacter)}`;

  const modes = canvasInstance.getModes();
  const isRead = hasDesiredMode(modes, config.modes.READ);

  if (isRead) {
    speak(taskText);
  } else {
    document.getElementById('taskField').innerHTML = taskText;
  }
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
      showModalWithResult(isResultCorrect, predictedResult, predictedScore);

      if (isResultCorrect) correctTasks++;
    }
  );
}

function updateProgress() {
  progressBar.style.width = `${(curNumTasks / numTasks) * 100}%`;
  progressText.innerHTML = `${curNumTasks}/${numTasks}`;
}

async function loadConfig() {
  const lang = canvasInstance.getLanguage();
  const t = canvasInstance.getTech();
  const r = canvasInstance.getNumberRounds();

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

  if (r) {
    numTasks = r;
    curNumTasks = 0;
    correctTasks = 0;

    progressText = document.getElementById('progress-text');
    progressBar = document.getElementById('progress-bar');

    updateProgress();

    document.getElementById('q').style.display = 'none';
    document.getElementById('progress-container').classList.remove('hidden');
  }
}

init();
