(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const canvas = document.getElementById("neural-network-canvas");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
  });

  const mouse = {
    x: width / 2,
    y: height / 2,
    radius: 120,
  };

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const baseHue = 200; // Teal/blue base
  const PARTICLE_COUNT = Math.floor((width * height) / 15000);
  const CONNECTION_RADIUS = 100;

  let particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.color = `hsl(${baseHue}, 100%, 50%)`;
    }

    update() {
      if (this.x > width || this.x < 0) this.speedX *= -1;
      if (this.y > height || this.y < 0) this.speedY *= -1;

      this.x += this.speedX;
      this.y += this.speedY;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      const dxMouse = particles[i].x - mouse.x;
      const dyMouse = particles[i].y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (distMouse < mouse.radius) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${baseHue}, 100%, 70%, ${
          1 - distMouse / mouse.radius
        })`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CONNECTION_RADIUS) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${baseHue}, 100%, 50%, ${
            1 - distance / CONNECTION_RADIUS
          })`;
          ctx.lineWidth = 0.2;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    handleParticles();
    requestAnimationFrame(animate);
  }

  init();
  animate();

  /**
   * Intersection Observer for section highlighting
   */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".site-nav a");

  const headerHeight = document.querySelector(".site-header").offsetHeight;
  const observerOptions = {
    root: null,
    rootMargin: `-${headerHeight}px 0px 0px 0px`,
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const link = document.querySelector(`.site-nav a[href="#${id}"]`);

      if (link) {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  /**
   * Text Scramble Effect
   */
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = "!<>-_\\/[]{}—=+*^?#________";
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 80);
        const end = start + Math.floor(Math.random() * 80);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = "";
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  const heroTitle = document.querySelector(".hero-title");
  const fx = new TextScramble(heroTitle);
  const textToAnimate = "Architecting the intelligent backend.";
  heroTitle.innerText = "";

  const heroLede = document.querySelector(".hero-lede");
  const ledeText = heroLede.innerText;
  heroLede.setAttribute("data-text", ledeText);

  setTimeout(() => {
    heroLede.classList.add("glitching");
    fx.setText(textToAnimate).then(() => {
      heroLede.classList.remove("glitching");
    });
  }, 1000);
})();
