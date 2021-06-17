let worker;

const greek_map = [
  'Α', 'α', 'Β', 'β', 'Γ', 'γ', 'Δ', 'δ', 'Ε', 'ε', 'Ζ', 'ζ', 'Η', 'η', 'Θ', 'θ', 'Ι', 'ι', 'Κ', 'κ', 'Λ', 'λ', 'Μ', 'μ', 'Ν', 'ν', 'Ξ', 'ξ', 'Ο', 'ο', 'Π', 'π', 'Ρ', 'ρ', 'Σ', 'σ', 'Τ', 'τ', 'Υ', 'υ', 'Φ', 'φ', 'Χ', 'χ', 'Ψ', 'ψ', 'Ω', 'ω'
]

export async function predictModel(canvas, callback) {
  worker = Tesseract.createWorker({
    logger: (m) => console.log(m),
  });

  const allowedChars = greek_map.join('');

  await worker.load();
  await worker.loadLanguage('grc');
  await worker.initialize('grc');
  await worker.setParameters({
    tessedit_pageseg_mode: 10, // PSM_SINGLE_CHAR
    tessedit_char_whitelist: allowedChars
  });
  const {
    data: { text },
  } = await worker.recognize(canvas);
  console.log(text);
  await worker.terminate();

  const predictedResult = text.trim();
  const predictedScore = 1;

  callback({ predictedScore, predictedResult });
}

export function loadModel() { }

export function getRandomChar() {
  return greek_map[Math.floor((Math.random() * greek_map.length))];
}