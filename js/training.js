import canvasInstance from "./canvas.js";

let input,
  select,
  selectLabel,
  currentCountContainer,
  table,
  data = {},
  chars = [];

function init() {
  input = document.getElementById("csv");
  currentCountContainer = document.getElementById("current-count-container");
  selectLabel = document.getElementById("select-label");
  select = document.getElementById("current-char");
  table = document.getElementById("data");

  const reader = new FileReader();
  reader.onload = () => {
    chars = reader.result.split(',');

    console.log(chars);

    initDataObject(chars);
    populateSelect(chars);

    populateTableWithData();
  }

  input.addEventListener(
    'change',
    function (e) {
      currentCountContainer.style.display = 'block';
      selectLabel.innerHTML = input.files[0].name;

      reader.readAsBinaryString(input.files[0]);
    });

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

  document.getElementById('clr').addEventListener(
    'click',
    function (e) {
      canvasInstance.erase();
    },
    false
  );
  document.getElementById('btn').addEventListener(
    'click',
    function (e) {
      data[select.value].push(canvasInstance.getScaledData(0.1))
      canvasInstance.erase();

      populateTableWithData();

      console.log(data);
    },
    false
  );
  document.getElementById('s').addEventListener(
    'click',
    function (e) {
      exportDataAsCSV();
    },
    false
  );
}

function exportDataAsCSV() {
  let content = "data:text/csv;charset=utf-8,";

  content += `${Object.keys(data).join(",")}\n`

  let numberRows = 0;
  for (const key in data) {
    if(numberRows < data[key].length) numberRows = data[key].length;
  }

  for (let i = 0; i < numberRows; i++) {
    for (const key in data) {
      const values = data[key];

      if(i < values.length) {
        content += `${values[i].join(';')}`
      } 
      
      if (key != chars[chars.length - 1]) {
        content += ',';
      }
    }

    content += '\n'
  }

  // console.log(content);

  const encodedUri = encodeURI(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);

  link.click();
}

function populateSelect(options) {
  for (const o of options) {
    let option = document.createElement('option')
    option.value = o;
    option.innerHTML = o;

    select.appendChild(option);
  }
}

function populateTableWithData() {
  table.innerHTML = '';

  const tableHeaderRow = document.createElement('tr'),
    tableCountRow = document.createElement('tr');

  for (const c in data) {
    const headerColumn = document.createElement('th');
    headerColumn.innerHTML = c;

    const countColumn = document.createElement('td');
    countColumn.innerHTML = data[c].length;

    tableHeaderRow.appendChild(headerColumn);
    tableCountRow.appendChild(countColumn);
  }

  table.appendChild(tableHeaderRow);
  table.appendChild(tableCountRow);
}

function initDataObject(keys) {
  for (const k of keys) {
    data[k] = [];
  }
}

init();