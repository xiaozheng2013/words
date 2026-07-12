// Celebration_Module — "good job" rain animation effect
// Dependencies: none (uses DOM API)

window.showGoodJob = function () {
  const cars = [
    'https://www.carlogos.org/car-logos/tesla-logo.png',
    'https://www.carlogos.org/car-logos/bmw-logo.png',
    'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
    'https://www.carlogos.org/car-logos/audi-logo.png',
    'https://www.carlogos.org/car-logos/porsche-logo.png',
    'https://www.carlogos.org/car-logos/ferrari-logo.png',
    'https://www.carlogos.org/car-logos/lamborghini-logo.png',
    'https://www.carlogos.org/car-logos/toyota-logo.png',
    'https://www.carlogos.org/car-logos/honda-logo.png',
    'https://www.carlogos.org/car-logos/ford-logo.png'
  ];
  const faces = ['🤪','😜','🥴','😝','🤡','👻','🙃','😵','🤣','😂','🥳','😎','🤓','👽','🫠'];
  for (let i = 0; i < 15; i++) {
    const useFace = Math.random() < 0.5;
    const dur = 2 + Math.random() * 2;
    const delay = Math.random() * 1.5;
    let el;
    if (useFace) {
      el = document.createElement('div');
      el.className = 'rain-word';
      el.textContent = faces[Math.floor(Math.random() * faces.length)];
      el.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
    } else {
      el = document.createElement('img');
      el.className = 'rain-word';
      el.src = cars[Math.floor(Math.random() * cars.length)];
      const size = 40 + Math.random() * 60;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.objectFit = 'contain';
    }
    el.style.left = Math.random() * 90 + 5 + 'vw';
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = delay + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay + 0.5) * 1000);
  }
};
