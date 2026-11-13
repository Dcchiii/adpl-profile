const allWindows = document.querySelectorAll('.window');

function getOverlapArea(left, top, width, height, w) {
  const overlapLeft = Math.max(left, w.left);
  const overlapRight = Math.min(left + width, w.left + w.width);
  const overlapTop = Math.max(top, w.top);
  const overlapBottom = Math.min(top + height, w.top + w.height);

  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);

  return overlapWidth * overlapHeight;
}

function isTooMuchOverlap(left, top, width, height, placedWindows, maxOverlapPercent) {
  const ownArea = width * height;

  return placedWindows.some(function (w) {
    const overlap = getOverlapArea(left, top, width, height, w);
    const overlapPercent = overlap / ownArea;
    return overlapPercent > maxOverlapPercent;
  });
}

function getRandomPosition(windowEl, options = {}, placedWindows = []) {
  const margin = {
    top: options.marginTop || 0,
    left: options.marginLeft || 0,
    right: options.marginRight || 0,
    bottom: options.marginBottom || 0,
  };

  const minLeft = margin.left;
  const minTop = margin.top;
  const maxLeft = window.innerWidth - windowEl.offsetWidth - margin.right;
  const maxTop = window.innerHeight - windowEl.offsetHeight - margin.bottom;

  const maxOverlapPercent = options.maxOverlapPercent ?? 0;

  let left, top, attempts = 0;

  do {
    left = minLeft + Math.random() * (maxLeft - minLeft);
    top = minTop + Math.random() * (maxTop - minTop);
    attempts++;
  } while (
    isTooMuchOverlap(left, top, windowEl.offsetWidth, windowEl.offsetHeight, placedWindows, maxOverlapPercent) &&
    attempts < 50
  );

  return { left, top };
}

let topZIndex = allWindows.length;

const placedWindows = [];

allWindows.forEach(function (windowEl, index) {
  const pos = getRandomPosition(windowEl, {
    marginTop: 100,
    marginBottom: 50,
    marginLeft: 350,
    marginRight: 10,
    maxOverlapPercent: 0.75,
  }, placedWindows);

  windowEl.style.left = (pos.left / window.innerWidth * 100) + '%';
  windowEl.style.top = (pos.top / window.innerHeight * 100) + '%';
  windowEl.style.zIndex = allWindows.length - index;

  placedWindows.push({
    left: pos.left,
    top: pos.top,
    width: windowEl.offsetWidth,
    height: windowEl.offsetHeight,
  });

  setTimeout(function () {
    windowEl.style.animationPlayState = 'running';
  }, index * 150);
});

function initWindow(windowEl) {
  const titlebar = windowEl.querySelector('.titlebar');
  const minimizeBtn = windowEl.querySelector('.minimize');
  const closeBtn = windowEl.querySelector('.close')

  let isDragging = false;
  let offsetX, offsetY;

  function bringToFront() {
    topZIndex++;
    windowEl.style.zIndex = topZIndex;
  }
  
  if(minimizeBtn){
    minimizeBtn.addEventListener('click', function () {
      windowEl.classList.toggle('minimized');
    });
  }
  if(closeBtn){
    closeBtn.addEventListener('click', function() {
      // windowEl.remove();
      windowEl.style.display = 'none';
    });
  }

  windowEl.addEventListener('mousedown', function (e) {
    bringToFront();
    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    const maxLeft = window.innerWidth - windowEl.offsetWidth;
    const maxTop = window.innerHeight - windowEl.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    windowEl.style.left = (newLeft / window.innerWidth * 100) + '%';
    windowEl.style.top = (newTop / window.innerHeight * 100) + '%';
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });
}

allWindows.forEach(initWindow);

