const images = [
    new URL('../assets/images/m.png', import.meta.url).href,
]

const randomIndex = Math.floor(Math.random() * images.length);
const selectedImage = images[randomIndex];


function rgbToSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function getDominantColor(imgSrc, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imgSrc;

  img.onload = function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size).data;
    const colorCount = {};

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        if (alpha < 125) continue;

        // skip warna yang terlalu dekat putih atau hitam (biasanya highlight/shadow, bukan warna "asli")
        const brightness = (r + g + b) / 3;
        if (brightness > 235 || brightness < 20) continue;

        const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
    }

    let maxCount = 0;
    let dominant = '128,128,128';

    for (const key in colorCount) {
      if (colorCount[key] > maxCount) {
        maxCount = colorCount[key];
        dominant = key;
      }
    }

    callback(`rgb(${dominant})`);
  };
}


function getVibrantDominantColor(imgSrc, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imgSrc;

  img.onload = function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size).data;
    const colorCount = {};

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      if (alpha < 125) continue;

      const brightness = (r + g + b) / 3;
      if (brightness > 235 || brightness < 20) continue;

      const saturation = rgbToSaturation(r, g, b);
      const weight = saturation > 0.5 ? 3 : 1; // pixel warna tajam dihitung 3x lipat

      const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
      colorCount[key] = (colorCount[key] || 0) + weight;
    }

    let maxCount = 0;
    let dominant = '128,128,128';

    for (const key in colorCount) {
      if (colorCount[key] > maxCount) {
        maxCount = colorCount[key];
        dominant = key;
      }
    }

    callback(`rgb(${dominant})`);
  };
}

function getComplementaryColor(rgbString) {
  const match = rgbString.match(/\d+/g); // ambil semua angka dari string "rgb(r, g, b)"
  const [r, g, b] = match.map(Number);

  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;

  return `rgb(${compR}, ${compG}, ${compB})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body.index');
    if (bodyElement) {
        bodyElement.style.backgroundImage = `url("${selectedImage}")`;

        // getDominantColor(selectedImage, function (dominantColor) {
            

        //     document.querySelectorAll('.menu-item').forEach(function (item) {
        //         item.style.setProperty('--menu-color', dominantColor);
        //     });
        // });

        // document.documentElement.style.setProperty('--menu-color', dominantColor);

        getVibrantDominantColor(selectedImage, function (dominantColor) {
          const complementColor = getComplementaryColor(dominantColor);

            document.querySelectorAll('.menu-item').forEach(function (item) {
                item.style.setProperty('--menu-color', dominantColor);
            });

            // document.querySelectorAll('body.index').forEach(function (item) {
            //     item.style.setProperty('--menu-color-complement', complementColor);
            // });
            // document.documentElement.style.setProperty('--menu-color', dominantColor);

        });

    }
});