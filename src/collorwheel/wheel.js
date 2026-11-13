const colorwheel = document.querySelector('#colorwheel');

['.wheel', '.maincolor', '.secondcolor', '.thirdcolor', '.orbit'].forEach(function (selector) {
  colorwheel.querySelector(selector).addEventListener('mousedown', function (e) {
    e.stopPropagation();
  });
});

function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r, g, b;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

function getCurrentPickedColor() {
  const rect = colorpicker.getBoundingClientRect();
  const x = pickerDot.offsetLeft;
  const y = pickerDot.offsetTop;
  const s = (x / rect.width) * 100;
  const v = (1 - y / rect.height) * 100;
  return hsvToRgb(currentHue, s, v);
}


const mainColor = document.querySelector('.maincolor');
const secondColor = document.querySelector('.secondcolor');
const thirdColor = document.querySelector('.thirdcolor');

let activeSwatch = null;

function updateActiveSwatchColor() {
  if (!activeSwatch) return;
  activeSwatch.style.backgroundColor = getCurrentPickedColor();
}

mainColor.addEventListener('click', function () {
  mainColor.classList.add('selected');
  secondColor.classList.remove('selected');
  thirdColor.classList.remove('selected');
  activeSwatch = mainColor;
  
});

secondColor.addEventListener('click', function () {
  secondColor.classList.add('selected');
  mainColor.classList.remove('selected');
  thirdColor.classList.remove('selected');
  activeSwatch = secondColor;
  
});

thirdColor.addEventListener('click', function () {
  thirdColor.classList.add('selected');
  mainColor.classList.remove('selected');
  secondColor.classList.remove('selected');
  activeSwatch = thirdColor;
  
});

const orbit = document.querySelector('.orbit');
const colorpicker = document.querySelector('.colorpicker');
let currentHue = 0;

function updateColorFromOrbit() {
  const style = getComputedStyle(orbit);
  const matrix = style.transform;
  let angle = 0;

  if (matrix && matrix !== 'none') {
    const values = matrix.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    if (angle < 0) angle += 360;
  }

  const hue = (angle - 300 + 360) % 360;
  currentHue = hue;

  colorpicker.style.background = `
    linear-gradient(to top, black, transparent),
    linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
  `;

  const rect = colorpicker.getBoundingClientRect();
  const dotX = pickerDot.offsetLeft;
  const dotY = pickerDot.offsetTop;
  requestAnimationFrame(updateColorFromOrbit);
}

const orbitDot = document.querySelector('.orbit-dot');
let isOrbitDragging = false;

function updateOrbitFromMouse(e) {
  const rect = orbit.getBoundingClientRect();
  const centerX = rect.left;
  const centerY = rect.top;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;

  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  orbit.style.transform = `rotate(${angle}deg)`;

  const hue = (angle - 300 + 360) % 360;
  currentHue = hue;

  colorpicker.style.background = `
    linear-gradient(to top, black, transparent),
    linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
  `;

  const cpRect = colorpicker.getBoundingClientRect();
  const dotX = pickerDot.offsetLeft;
  const dotY = pickerDot.offsetTop;
  updateHSVDisplay(dotX, dotY, cpRect);
  updateActiveSwatchColor()
}

orbitDot.addEventListener('mousedown', function (e) {
  isOrbitDragging = true;
  e.preventDefault();
});

document.addEventListener('mousemove', function (e) {
  if (!isOrbitDragging) return;
  updateOrbitFromMouse(e);
  
});

document.addEventListener('mouseup', function () {
  isOrbitDragging = false;
});

const hValue = document.querySelector('.h-value');
const sValue = document.querySelector('.s-value');
const vValue = document.querySelector('.v-value');

function updateHSVDisplay(x, y, rect) {
  const s = Math.round((x / rect.width) * 100);
  const v = Math.round((1 - y / rect.height) * 100);

  hValue.textContent = Math.round(currentHue);
  sValue.textContent = s;
  vValue.textContent = v;
}

const pickerDot = document.querySelector('.picker-dot');
let isPickerDragging = false;
updateColorFromOrbit();

function movePickerDot(e) {
    const rect = colorpicker.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    pickerDot.style.left = x + 'px';
    pickerDot.style.top = y + 'px';

    updateHSVDisplay(x, y, rect);
    updateActiveSwatchColor()
}

colorpicker.addEventListener('mousedown', function (e) {
    isPickerDragging = true;
    movePickerDot(e);
});

document.addEventListener('mousemove', function (e) {
    if (!isPickerDragging) return;
    movePickerDot(e);
});

document.addEventListener('mouseup', function () {
    isPickerDragging = false;
});
