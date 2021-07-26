
import canvasInstance from "../canvas.js";
import config from "../config/config.js";

let map = [];
let language;

let worker;

function employWorker(data, callback) {
  if (window.Worker) {
    if (!worker) {
      worker = new Worker('./static/js/tensorflow/worker.js');
    }

    worker.onmessage = function (e) {
      callback(e.data);
    }

    worker.postMessage({ data, map, path: config.model.tf[canvasInstance.getLanguage()].path });
  }
}

export async function loadModel(l) {

  language = l;

  map = config.model.tf[canvasInstance.getLanguage()].labels;
  
  let initPredict = [];

  const N = 784;
  for (let i = 1; i <= N; i++) {
    initPredict.push(0);
  }
  const callback = (e) => console.log("Initialized Model.")

  employWorker(initPredict, callback);
}

export function predictModel(canvas, callback) {
  const imgData = canvasInstance.getScaledData(config.model.tf[language].fitInput);

  employWorker(imgData, callback);
}

export function getRandomChar() {
  return map[Math.floor((Math.random() * map.length))]
}