const images = [
    // '../assets/images/a.jpg',
    // '../assets/images/b.png',
    // '../assets/images/c.png',
    // '../assets/images/d.png',
    // '../assets/images/e.png',
    // '../assets/images/f.png',
    // '../assets/images/g.png',
    // '../assets/images/h.png',
    // '../assets/images/i.png',
    // '../assets/images/j.png',
    // '../assets/images/k.png',
    // '../assets/images/l.jpg',
    '../assets/images/test.png',
    
];

const imagesContainer = document.querySelector('.images');

images.forEach(function (src) {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.className = 'gallery-img';
    imagesContainer.appendChild(img);
});