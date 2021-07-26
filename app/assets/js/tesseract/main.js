import config from '../config/config.js';

let worker, map, language;

export async function predictModel(canvas, callback) {
  worker = Tesseract.createWorker();

  const allowedChars = map.join('');

  await worker.load();
  await worker.loadLanguage(config.model.tsr[language].code);
  await worker.initialize(config.model.tsr[language].code);
  await worker.setParameters({
    tessedit_pageseg_mode: 10, // PSM_SINGLE_CHAR
    tessedit_char_whitelist: allowedChars,
  });
  const {
    data: { text },
  } = await worker.recognize(canvas);
  await worker.terminate();

  const predictedResult = text.trim();
  const predictedScore = 1;

  callback({ predictedScore, predictedResult });
}

export function loadModel(l) {
  language = l;

  map = config.model.tsr[language].labels;
}

export function getRandomChar() {
  return map[Math.floor(Math.random() * map.length)];
}
