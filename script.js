/* =========================================================
   REDLINE GARAGE — script.js
   Funcionalidades: menú hamburguesa, scroll suave, animaciones
   al hacer scroll, validación de formulario, botón "volver arriba"
   y modo oscuro/claro.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. AÑO ACTUAL EN EL FOOTER
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     2. MENÚ HAMBURGUESA (responsive)
  --------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('mainNav');

  function closeMenu(){
    hamburger.classList.remove('active');
    mainNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(){
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  if (hamburger && mainNav){
    hamburger.addEventListener('click', toggleMenu);

    // Cierra el menú al elegir un link (mejora UX en móvil)
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Cierra el menú si se agranda la ventana (evita quedar "abierto" en desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. DESPLAZAMIENTO SUAVE ENTRE SECCIONES
     (scroll-behavior:smooth ya lo cubre en CSS, pero se
     refuerza en JS para compensar la altura del header fijo)
  --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const headerOffset = () => header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length < 2) return; // ignora "#" vacío
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     4. RESALTAR LINK ACTIVO SEGÚN LA SECCIÓN VISIBLE
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= headerOffset() + 80) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', highlightNav);
  highlightNav();

  /* ---------------------------------------------------------
     5. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window){
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // se anima una sola vez
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback para navegadores sin soporte: mostrar todo directamente
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------
     6. BOTÓN "VOLVER ARRIBA"
  --------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     7. MODO OSCURO / CLARO
     El sitio nace en modo oscuro ("Night Touge"); el interruptor
     alterna a un modo claro ("Day Circuit"). La preferencia se
     guarda en localStorage para futuras visitas.
  --------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'redline-garage-theme';

  const applyTheme = (theme) => {
    document.body.classList.toggle('light-theme', theme === 'light');
  };

  // Carga la preferencia guardada (si existe)
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
  });

  /* ---------------------------------------------------------
     8. VALIDACIÓN DEL FORMULARIO DE CONTACTO
  --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name:    { el: document.getElementById('name'),    error: document.getElementById('nameError') },
    email:   { el: document.getElementById('email'),   error: document.getElementById('emailError') },
    phone:   { el: document.getElementById('phone'),   error: document.getElementById('phoneError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') }
  };

  // Expresiones regulares para validar formato
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Acepta números, espacios, guiones, paréntesis y un "+" opcional al inicio (mínimo 8 dígitos)
  const PHONE_RE = /^\+?[\d\s().-]{8,20}$/;

  function setError(fieldKey, message){
    const { el, error } = fields[fieldKey];
    error.textContent = message;
    el.closest('.form-group').classList.toggle('invalid', Boolean(message));
    return !message; // true si es válido (sin mensaje de error)
  }

  function validateName(){
    const value = fields.name.el.value.trim();
    if (!value) return setError('name', 'Por favor ingresá tu nombre.');
    if (value.length < 3) return setError('name', 'El nombre debe tener al menos 3 caracteres.');
    return setError('name', '');
  }

  function validateEmail(){
    const value = fields.email.el.value.trim();
    if (!value) return setError('email', 'Por favor ingresá tu correo electrónico.');
    if (!EMAIL_RE.test(value)) return setError('email', 'Ingresá un correo electrónico válido.');
    return setError('email', '');
  }

  function validatePhone(){
    const value = fields.phone.el.value.trim();
    if (!value) return setError('phone', 'Por favor ingresá tu teléfono.');
    if (!PHONE_RE.test(value)) return setError('phone', 'Ingresá un teléfono válido (mínimo 8 dígitos).');
    return setError('phone', '');
  }

  function validateMessage(){
    const value = fields.message.el.value.trim();
    if (!value) return setError('message', 'Contanos brevemente qué necesitás.');
    if (value.length < 10) return setError('message', 'El mensaje debe tener al menos 10 caracteres.');
    return setError('message', '');
  }

  // Validación en tiempo real al salir de cada campo (blur)
  fields.name.el.addEventListener('blur', validateName);
  fields.email.el.addEventListener('blur', validateEmail);
  fields.phone.el.addEventListener('blur', validatePhone);
  fields.message.el.addEventListener('blur', validateMessage);

  // Limpia el error apenas el usuario empieza a corregir
  Object.values(fields).forEach(({ el }) => {
    el.addEventListener('input', () => {
      el.closest('.form-group').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.textContent = '';

    const isNameValid    = validateName();
    const isEmailValid   = validateEmail();
    const isPhoneValid   = validatePhone();
    const isMessageValid = validateMessage();

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && isMessageValid;

    if (!isFormValid){
      // Lleva el foco al primer campo con error para accesibilidad
      const firstInvalid = form.querySelector('.form-group.invalid input, .form-group.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Aquí normalmente se enviarían los datos a un servidor (fetch/AJAX).
    // Como este es un sitio de ejemplo, solo simulamos el envío:
    formSuccess.textContent = '¡Gracias! Tu solicitud fue enviada. Te contactaremos a la brevedad.';
    form.reset();
  });

});
