_API Web Application for an orthographic recognising neural network disguised as a quiz_

_Currently available languages: German_

# Using the API application

## Query parameter

#### `lang`: Selects an alphabet to pick:
- `latin` (available in: `tf, tsr`)
- `greek` (available in: `tf, tsr`)
- `arithmetic` (available in: `tf`)

#### `t`: Selects a recognition technology:
- `tsr`: Tesseract OCR
- `tf`: [TensorFlow CNN model based EMNIST data sets](https://colab.research.google.com/drive/1CJMWZMhKRwx_2-a7GfLPSMmUPRjifQSO?usp=sharing)

#### `r`: Limits the number of characters quizzed (optional):
- `positive number`: Any number you wish for

#### `m`: Selects the mode of the quiz (optional):
- `r`: **read** Audio instructions only (instruction text is hidden)
- `t`: **text** Text instructions only (speaker button is disabled) (_default mode_)
- `r,t`: Text and audio instruction (instruction text & voice)

#### Example query:`?lang=latin&t=tf&m=r`

## Development

### Start and run the node.js server

1. Navigate into the app source folder `cd app`
2. Start the nodejs server `node app.js`
