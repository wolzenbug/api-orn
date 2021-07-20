import canvasInstance from "./canvas.js";

let input,
  select,
  selectLabel,
  currentCountContainer,
  tableContainer,
  data = {},
  chars = [];

function init() {
  input = document.getElementById("csv");
  currentCountContainer = document.getElementById("current-count-container");
  selectLabel = document.getElementById("select-label");
  select = document.getElementById("current-char");
  tableContainer = document.getElementById("table-container");

  const clr = document.getElementById('clr');
  const btn = document.getElementById('btn');
  const s = document.getElementById('s');

  select.setAttribute('disabled', true);
  select.setAttribute('disabled', true);
  btn.setAttribute('disabled', true);
  clr.setAttribute('disabled', true);
  s.setAttribute('disabled', true);

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('canvas-overlay').remove();
    document
      .getElementById('canvas-wrapper')
      .classList.remove('relative');

    const rows = reader.result.split('\n');

    chars = [];
    chars = rows[0].split(',');

    const existingData = rows.length > 1 ? rows.slice(1).filter(r => r.length > 0) : [];

    initDataObject(chars, existingData);
    populateSelect(chars);

    populateTables();
  }

  input.addEventListener(
    'change',
    function (e) {
      const file = input.files[0];

      if (file.name.split('.')[1] === 'csv') {
        currentCountContainer.style.display = 'block';
        selectLabel.innerHTML = input.files[0].name;

        select.removeAttribute('disabled');
        btn.removeAttribute('disabled');
        clr.removeAttribute('disabled');
        s.removeAttribute('disabled');

        reader.readAsBinaryString(input.files[0]);
      }
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

  /* TOUCH DEVICES */
  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];

    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchstart", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchend", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mouseup", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);

  clr.addEventListener(
    'click',
    function (e) {
      canvasInstance.erase();
    },
    false
  );
  btn.addEventListener(
    'click',
    function (e) {
      data[select.value].push(canvasInstance.getScaledData(0.1))
      canvasInstance.erase();

      populateTables();

      console.log(data);
    },
    false
  );
  s.addEventListener(
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
    if (numberRows < data[key].length) numberRows = data[key].length;
  }

  for (let i = 0; i < numberRows; i++) {
    for (const key in data) {
      const values = data[key];

      if (i < values.length) {
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
  select.innerHTML = '';

  for (const o of options) {
    let option = document.createElement('option')
    option.value = o;
    option.innerHTML = o;

    select.appendChild(option);
  }
}

function populateTables() {
  const chunks = [];
  const chunkSize = 10;

  for (let i = 0; i < chars.length; i += chunkSize) {
    chunks.push(chars.slice(i, i + chunkSize));
  }

  tableContainer.innerHTML = '';
  for (let chunk of chunks) {
    const table = document.createElement('table');
    table.className = 'data';

    tableContainer.appendChild(table);

    populateTableWithChunk(chunk, table);
  }
}

function populateTableWithChunk(chunk, table) {
  table.innerHTML = '';

  const tableHeaderRow = document.createElement('tr'),
    tableCountRow = document.createElement('tr');

  for (const c of chunk) {
    console.log("C", c);
    console.log("DATA AT C", data[c]);

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

function initDataObject(keys, rows) {
  data = {};

  for (const k of keys) {
    data[k] = [];
  }

  for (const row of rows) {
    const r = row.split(',');

    for (const index in r) {
      if (r[index].length > 0) data[keys[index]].push(r[index].split(';'));
    }
  }
}

init();