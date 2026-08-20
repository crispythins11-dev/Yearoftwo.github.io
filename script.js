/*

    Tooplate 2167 Orbital

    https://www.tooplate.com/view/2167-orbital

    Free HTML CSS Template

*/
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Position the orbital ring panels (markup lives in index.html) */
  var ring = document.getElementById('ring');
  var panels = ring.querySelectorAll('.panel');
  var count = panels.length;

  var spacingLevels = [0.74, 0.92, 1.08];   /* tight, default, wide */
  var spacingIndex = 1;

  function baseRadius() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--ring-radius');
    return parseFloat(raw) || 360;
  }
  function effectiveRadius() {
    return baseRadius() * spacingLevels[spacingIndex];
  }

  function positionPanels() {
    var r = effectiveRadius();
    panels.forEach(function (panel, i) {
      var angle = (360 / count) * i;
      var tilt = Math.sin((i / count) * Math.PI * 2) * 8;
      panel.style.setProperty('--ry', angle + 'deg');
      panel.style.setProperty('--tz', r + 'px');
      panel.style.setProperty('--rz', tilt.toFixed(2) + 'deg');
      panel.style.setProperty('--i', i);
    });
  }
  positionPanels();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionPanels, 200);
  });

  /* 3 step spacing updates panel translateZ, the existing transform transition animates it */
  var spacingSteps = document.querySelectorAll('.spacing-step');
  function setSpacing(idx) {
    spacingIndex = idx;
    var r = effectiveRadius();
    ring.querySelectorAll('.panel').forEach(function (p) {
      p.style.setProperty('--tz', r + 'px');
    });
    spacingSteps.forEach(function (b) {
      b.classList.toggle('is-active', parseInt(b.getAttribute('data-space'), 10) === idx);
    });
  }
  spacingSteps.forEach(function (b) {
    b.addEventListener('click', function () {
      setSpacing(parseInt(b.getAttribute('data-space'), 10));
    });
  });

  /* Ring rotation driven by drag and horizontal scroll, with momentum */
  var stage = document.querySelector('.stage');
  var parallax = document.querySelector('.parallax');

  var rotation = 0;
  var velocity = 0;
  var baseDrift = reduceMotion ? 0 : 0.12;   /* gentle auto rotation per frame */
  var friction = 0.94;                        /* momentum decay after a flick */
  var MAX_VELOCITY = 7;
  var DRAG_SENS = 0.32;                        /* degrees of spin per pixel dragged */
  var WHEEL_SENS = 0.05;                       /* spin from horizontal scroll or trackpad */

  var dragging = false;
  var lastX = 0;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* Parallax tilt target */
  var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  var rangeY = 28;   /* horizontal pan */
  var rangeX = 30;   /* vertical tilt swing */
  var biasX = 10;    /* lean the ring upward at rest, flip to negative to lean down */
  if (!reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      var mx = (e.clientX / window.innerWidth) - 0.5;
      var my = (e.clientY / window.innerHeight) - 0.5;
      targetY = mx * rangeY;
      targetX = (-my * rangeX) + biasX;
    });
  }

  /* Pointer drag spins the ring and carries momentum on release */
  if (stage) {
    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      stage.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      var step = dx * DRAG_SENS;
      rotation += step;
      velocity = clamp(step, -MAX_VELOCITY, MAX_VELOCITY);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    /* Horizontal scroll or trackpad swipe spins, vertical scroll passes through to the page */
    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        velocity = clamp(velocity + e.deltaX * WHEEL_SENS, -MAX_VELOCITY, MAX_VELOCITY);
      }
    }, { passive: false });
  }

  /* Single animation loop for rotation and parallax */
  function frame() {
    if (!dragging) {
      rotation += baseDrift + velocity;
      velocity *= friction;
      if (Math.abs(velocity) < 0.0015) velocity = 0;
    }
    ring.style.transform = 'rotateY(' + rotation.toFixed(3) + 'deg)';

    if (!reduceMotion && parallax) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      parallax.style.transform = 'rotateX(' + currentX.toFixed(2) + 'deg) rotateY(' + currentY.toFixed(2) + 'deg)';
    }
    requestAnimationFrame(frame);
  }
  frame();

  /* Scroll reveal with 3 second fallback for iframe contexts */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }
  setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }, 3000);

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    
  }
  /* Visuals toggle: crossfade panels between text and images */
  var switchBtn = document.getElementById('visualsSwitch');
  if (switchBtn) {
    switchBtn.addEventListener('click', function () {
      var on = switchBtn.getAttribute('aria-checked') !== 'true';
      switchBtn.setAttribute('aria-checked', on ? 'true' : 'false');
      document.body.classList.toggle('visuals-on', on);
    });
  }

  /* Zoom toggle: scale the whole ring 20 percent larger */
  var zoomSwitch = document.getElementById('zoomSwitch');
  var ringTilt = document.querySelector('.ring-tilt');
  if (zoomSwitch && ringTilt) {
    zoomSwitch.addEventListener('click', function () {
      var on = zoomSwitch.getAttribute('aria-checked') !== 'true';
      zoomSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
      ringTilt.style.setProperty('--zoom', on ? '1.24' : '1');
    });
  }

  /* ============================================================
     PHOTO FOLDERS + POLAROID OVERLAY
     ============================================================ */
  (function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Photo data per year */
    var folderData = {
      '2024': {
        title: '2024 Memories',
        photos: [
          { src: 'images/img1.jpeg', caption: '08-31-2024' },
          { src: 'images/img2.jpeg', caption: '09-07-2024' },
          { src: 'images/img3.jpg',  caption: '09-22-2024' },
          { src: 'images/img4.jpg',  caption: '09-28-2024' },
          { src: 'images/img5.jpg',  caption: '09-15-2024' },
          { src: 'images/img6.jpg',  caption: '09-28-2024' }
        ]
      },
      '2025': {
        title: '2025 Memories',
        photos: [
          { src: 'images/img7.jpg',  caption: '02-01-2025' },
          { src: 'images/img8.jpg',  caption: '02-15-2025' },
          { src: 'images/img9.jpg',  caption: '03-17-2025' },
          { src: 'images/img10.jpg',  caption: '04-20-2025' },
          { src: 'images/img11.jpg', caption: '12-06-2025' },
          { src: 'images/img12.jpg', caption: '12-06-2025' }
        ]
      },
      '2026': {
        title: '2026 Memories',
        photos: [
          { src: 'images/img13.jpg',  caption: '03-16-2026' },
          { src: 'images/img14.jpg',  caption: '04-19-2026' },
          { src: 'images/img15.jpg',  caption: '05-01-2026' },
          { src: 'images/img16.jpeg',  caption: '06-07-2026' },
          { src: 'images/img17.jpg',  caption: '06-14-2026' },
          { src: 'images/img18.jpeg',  caption: '07-08-2026' }
        ]
      }
    };

    /* Random rotation angles for a scattered scrapbook feel */
    var rotations = [-4, 3, -2, 4, -3, 2];

    var overlay = document.getElementById('polaroidOverlay');
    var heading = document.getElementById('polaroidHeading');
    var grid = document.getElementById('polaroidGrid');
    var closeBtn = document.getElementById('polaroidClose');
    var folderButtons = document.querySelectorAll('.folder-card .folder');
    var lastFocusedFolder = null;
    var overlayOpen = false;

    function openFolder(year) {
      var data = folderData[year];
      if (!data) return;

      lastFocusedFolder = document.activeElement;

      /* Set heading */
      heading.textContent = data.title;

      /* Clear grid */
      grid.innerHTML = '';

      /* Build polaroids */
      data.photos.forEach(function (photo, i) {
        var polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.style.setProperty('--i', i);
        polaroid.style.setProperty('--rot', rotations[i % rotations.length] + 'deg');

        var img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.caption;
        img.loading = 'lazy';

        var caption = document.createElement('span');
        caption.className = 'polaroid-caption';
        caption.textContent = photo.caption;

        polaroid.appendChild(img);
        polaroid.appendChild(caption);
        grid.appendChild(polaroid);
      });

      /* Open overlay */
      overlayOpen = true;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      if (!reduceMotion) {
        setTimeout(function () { closeBtn.focus(); }, 400);
      } else {
        closeBtn.focus();
      }
    }

    function closeFolder() {
      if (!overlayOpen) return;
      overlayOpen = false;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      if (lastFocusedFolder) lastFocusedFolder.focus();
    }

    /* Folder click handlers */
    folderButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.folder-card');
        var year = card ? card.getAttribute('data-folder') : null;
        if (year) openFolder(year);
      });
    });

    /* Close button */
    if (closeBtn) {
      closeBtn.addEventListener('click', closeFolder);
    }

    /* Click outside panel closes */
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeFolder();
      });
    }

    /* Escape key closes */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayOpen) closeFolder();
    });

  })();

})();
