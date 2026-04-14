const ACCEL_SERVICE = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
const ACCEL_DATA_CHAR = 'e95dca4b-251d-470a-a062-fa1922dfa9a8';

const $ = id => document.getElementById(id);

let device, server, accelChar;

let recording = false;
let data = [];
let startTime = 0;

// UI
const labelEl = $("label");
const movementEl = $("movement");

const xEl = $("x");
const yEl = $("y");
const zEl = $("z");

// Connessione
async function connect() {
  device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'BBC micro:bit' }],
    optionalServices: [ACCEL_SERVICE]
  });

  server = await device.gatt.connect();

  const service = await server.getPrimaryService(ACCEL_SERVICE);
  accelChar = await service.getCharacteristic(ACCEL_DATA_CHAR);

  await accelChar.startNotifications();
  accelChar.addEventListener('characteristicvaluechanged', onData);
}

// Ricezione dati
function onData(event) {
  const dv = event.target.value;

  const x = dv.getInt16(0, true);
  const y = dv.getInt16(2, true);
  const z = dv.getInt16(4, true);

  xEl.textContent = x;
  yEl.textContent = y;
  zEl.textContent = z;

  movementEl.textContent = labelEl.value;

  if (recording) {
    const time = ((performance.now() - startTime) / 1000).toFixed(2);

    data.push({
      time,
      x,
      y,
      z,
      label: labelEl.value
    });
  }
}

// Start registrazione
$("start").onclick = () => {
  data = [];
  recording = true;
  startTime = performance.now();
};

// Stop registrazione
$("stop").onclick = () => {
  recording = false;
};

// Download CSV
$("download").onclick = () => {
  let csv = "time,x,y,z,label\n";

  data.forEach(d => {
    csv += `${d.time},${d.x},${d.y},${d.z},${d.label}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "microbit_data.csv";
  a.click();
};

// Bottone connect
$("connect").onclick = connect;
