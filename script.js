/* ═══════════════════════════════════════════════════════════
   Дзен · студия груминга — концепт сайта
   Анкета → резюме → WhatsApp. Без сборки, без зависимостей.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA_PHONE = '79233580738';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ── Шапка: фон при скролле ─────────────────────────── */

  var header = $('.site-header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ── Мобильное меню ─────────────────────────────────── */

  var navToggle = $('.nav-toggle');
  var mainNav = $('#main-nav');

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mainNav.classList.toggle('is-open', open);
  }
  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  mainNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (mainNav.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
  });

  /* ── Активный пункт навигации ───────────────────────── */

  var navLinks = $$('.nav-link');
  var sectionIds = ['podhod', 'process', 'anketa', 'faq', 'kontakty'];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ── Появление секций при скролле ───────────────────── */

  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', (i % 3) * 0.08 + 's');
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Фото: аккуратный фолбэк, если 2ГИС недоступен ──── */

  $$('.hero-photo-frame img, .care-photo-frame img').forEach(function (img) {
    function showFallback() {
      img.style.display = 'none';
      var fb = img.parentElement.querySelector('.photo-fallback');
      if (fb) fb.hidden = false;
    }
    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  /* ── Мобильная нижняя панель ────────────────────────── */

  var mobileBar = $('#mobile-bar');
  var heroSection = $('.hero');
  var anketaSection = $('#anketa');
  var footerEl = $('.site-footer');
  var pastHero = false, inAnketa = false, inFooter = false;

  function updateMobileBar() {
    mobileBar.classList.toggle('is-visible', pastHero && !inAnketa && !inFooter);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      updateMobileBar();
    }, { threshold: 0.05 }).observe(heroSection);
    new IntersectionObserver(function (entries) {
      inAnketa = entries[0].isIntersecting;
      updateMobileBar();
    }, { threshold: 0.04 }).observe(anketaSection);
    new IntersectionObserver(function (entries) {
      inFooter = entries[0].isIntersecting;
      updateMobileBar();
    }, { threshold: 0.05 }).observe(footerEl);
  }

  /* ═══════════════ АНКЕТА ═══════════════ */

  var form = $('#pet-form');
  var dateInput = $('#visit-date');
  var ageInput = $('#age-value');
  var speciesOtherWrap = $('#species-other-wrap');
  var speciesOtherInput = $('#species-other');
  var flexibleCheck = $('#date-flexible');
  var statusEl = $('#form-status');
  var progressBar = $('#progress-bar');
  var progressLabel = $('#progress-label');
  var summaryBadge = $('#summary-badge');
  var summaryPreview = $('#summary-preview');
  var copyBtn = $('#copy-btn');
  var resetBtn = $('#reset-btn');

  // Минимальная дата — сегодня (локальная, без сдвига UTC)
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  dateInput.min = todayISO();

  /* ── Сбор данных ────────────────────────────────────── */

  function radioValue(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function checkedValues(name) {
    return $$('input[name="' + name + '"]:checked', form).map(function (el) { return el.value; });
  }
  function clean(str) {
    return String(str || '').replace(/\s+/g, ' ').trim();
  }

  function collect() {
    var species = radioValue('species');
    var speciesOther = clean(speciesOtherInput.value);
    var breed = clean($('#breed').value);
    var size = radioValue('size');
    var ageRaw = ageInput.value.trim();
    var ageNum = ageRaw === '' ? NaN : Number(ageRaw);
    var ageUnit = radioValue('ageUnit');
    var care = checkedValues('care');
    var careComment = clean($('#care-comment').value);
    var behavior = checkedValues('behavior');
    var behaviorComment = clean($('#behavior-comment').value);
    var date = dateInput.value;
    var flexible = flexibleCheck.checked;
    var daytime = radioValue('daytime');
    var clientName = clean($('#client-name').value);
    var petName = clean($('#pet-name').value);

    return {
      species: species,
      speciesLabel: species === 'Другой вид' ? (speciesOther ? 'Другой вид: ' + speciesOther : 'Другой вид') : species,
      speciesOther: speciesOther,
      breed: breed,
      size: size,
      ageNum: ageNum,
      ageUnit: ageUnit,
      ageValid: !isNaN(ageNum) && isFinite(ageNum) && ageNum >= 0 && ageNum <= (ageUnit === 'месяцев' ? 360 : 30) && Math.floor(ageNum) === ageNum,
      ageLabel: !isNaN(ageNum) && ageRaw !== '' ? ageNum + ' ' + ageUnit : '',
      care: care,
      careComment: careComment,
      behavior: behavior,
      behaviorComment: behaviorComment,
      date: date,
      flexible: flexible,
      daytime: daytime,
      clientName: clientName,
      petName: petName
    };
  }

  /* ── Валидация ──────────────────────────────────────── */

  function validateField(key, d) {
    switch (key) {
      case 'species':
        if (!d.species) return 'Выберите вид питомца.';
        if (d.species === 'Другой вид' && !d.speciesOther) return 'Уточните, какой это вид — так мы честно ответим, сможем ли помочь.';
        return '';
      case 'breed':
        if (!d.breed && !d.size) return 'Укажите породу или выберите размер — этого достаточно, если породу не знаете.';
        return '';
      case 'age':
        if (ageInput.value.trim() === '') return 'Укажите возраст питомца (можно примерно).';
        if (!d.ageValid) return d.ageUnit === 'месяцев'
          ? 'Возраст в месяцах — целое число от 0 до 360.'
          : 'Возраст в годах — целое число от 0 до 30.';
        return '';
      case 'care':
        if (!d.care.length) return 'Отметьте хотя бы один пункт — или «Нужен совет мастера».';
        return '';
      case 'behavior':
        if (!d.behavior.length && !d.behaviorComment) return 'Отметьте подходящее или напишите пару слов о характере питомца.';
        return '';
      case 'date':
        if (!d.date && !d.flexible) return 'Выберите желаемую дату или отметьте, что она ориентировочная.';
        if (d.date && d.date < todayISO()) return 'Эта дата уже прошла — выберите сегодняшний день или позже.';
        return '';
    }
    return '';
  }

  var FIELD_ORDER = ['species', 'breed', 'age', 'care', 'behavior', 'date'];

  function fieldGroup(key) { return form.querySelector('[data-field="' + key + '"]'); }

  function showError(key, msg) {
    var group = fieldGroup(key);
    var errEl = $('#error-' + key);
    if (!group || !errEl) return;
    if (msg) {
      errEl.textContent = msg;
      errEl.hidden = false;
      group.classList.add('has-error');
    } else {
      errEl.textContent = '';
      errEl.hidden = true;
      group.classList.remove('has-error');
    }
  }

  function validateAll(showErrors) {
    var d = collect();
    var firstBad = null;
    FIELD_ORDER.forEach(function (key) {
      var msg = validateField(key, d);
      if (showErrors) showError(key, msg);
      if (msg && !firstBad) firstBad = key;
    });
    return { data: d, firstBad: firstBad };
  }

  /* ── Форматирование даты и возраста ─────────────────── */

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    var y = Number(parts[0]), m = Number(parts[1]), day = Number(parts[2]);
    if (!y || !m || !day) return iso;
    return day + ' ' + MONTHS[m - 1] + ' ' + y;
  }

  function pluralYears(n) {
    var abs = Math.abs(n) % 100, last = abs % 10;
    if (abs > 10 && abs < 20) return 'лет';
    if (last === 1) return 'год';
    if (last >= 2 && last <= 4) return 'года';
    return 'лет';
  }
  function pluralMonths(n) {
    var abs = Math.abs(n) % 100, last = abs % 10;
    if (abs > 10 && abs < 20) return 'месяцев';
    if (last === 1) return 'месяц';
    if (last >= 2 && last <= 4) return 'месяца';
    return 'месяцев';
  }
  function ageText(d) {
    if (!d.ageValid || ageInput.value.trim() === '') return '';
    return d.ageNum + ' ' + (d.ageUnit === 'месяцев' ? pluralMonths(d.ageNum) : pluralYears(d.ageNum));
  }

  /* ── Текст сообщения для WhatsApp ───────────────────── */

  function buildMessage(d) {
    var lines = [];
    lines.push('Здравствуйте! Хочу обсудить визит в студию «Дзен». Заполнил(а) анкету на сайте:');
    lines.push('');
    lines.push('🐾 Питомец: ' + (d.speciesLabel || '—'));
    if (d.petName) lines.push('Кличка: ' + d.petName);
    var breedLine = [d.breed, d.size].filter(Boolean).join(', ');
    lines.push('Порода/размер: ' + (breedLine || '—'));
    lines.push('Возраст: ' + (ageText(d) || '—'));
    lines.push('');
    lines.push('Пожелания к уходу: ' + (d.care.length ? d.care.join(', ') : '—'));
    if (d.careComment) lines.push('Комментарий к уходу: ' + d.careComment);
    lines.push('');
    var behaviorParts = d.behavior.slice();
    if (d.behaviorComment) behaviorParts.push(d.behaviorComment);
    lines.push('Особенности поведения: ' + (behaviorParts.length ? behaviorParts.join('; ') : '—'));
    lines.push('');
    var dateLine = d.date ? formatDate(d.date) : 'дату обсудим';
    if (d.flexible) dateLine += ' (ориентировочно, готов(а) к ближайшим дням)';
    if (d.daytime && d.daytime !== 'Гибко') dateLine += ', удобнее: ' + d.daytime.toLowerCase();
    lines.push('Желаемая дата: ' + dateLine);
    if (d.clientName) {
      lines.push('');
      lines.push('Меня зовут ' + d.clientName + '.');
    }
    lines.push('');
    lines.push('Подскажите, пожалуйста, возможное время и стоимость. Спасибо!');
    return lines.join('\n');
  }

  function waLink(message) {
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(message);
  }

  /* ── Живое резюме ───────────────────────────────────── */

  var summaryEls = {};
  $$('[data-summary]').forEach(function (el) { summaryEls[el.getAttribute('data-summary')] = el; });

  function setSummary(key, value) {
    var el = summaryEls[key];
    if (!el) return;
    var text = value || '—';
    if (el.textContent !== text) {
      el.textContent = text;
      el.classList.remove('is-filled');
      if (value) {
        void el.offsetWidth; // перезапуск анимации подсветки
        el.classList.add('is-filled');
      }
    }
    el.classList.toggle('is-empty', !value);
  }

  function fieldFilled(key, d) {
    switch (key) {
      case 'species': return !!d.species && (d.species !== 'Другой вид' || !!d.speciesOther);
      case 'breed': return !!d.breed || !!d.size;
      case 'age': return d.ageValid && ageInput.value.trim() !== '';
      case 'care': return d.care.length > 0;
      case 'behavior': return d.behavior.length > 0 || !!d.behaviorComment;
      case 'date': return (!!d.date && d.date >= todayISO()) || d.flexible;
    }
    return false;
  }

  function refresh() {
    var d = collect();

    // Вид «другой» — показать уточняющее поле
    var isOther = d.species === 'Другой вид';
    speciesOtherWrap.hidden = !isOther;
    speciesOtherInput.required = isOther;

    setSummary('species', d.species ? d.speciesLabel + (d.petName ? ' · ' + d.petName : '') : '');
    setSummary('breed', [d.breed, d.size].filter(Boolean).join(' · '));
    setSummary('age', ageText(d));
    var careParts = d.care.slice();
    if (d.careComment) careParts.push('«' + d.careComment + '»');
    setSummary('care', careParts.join(', '));
    var behaviorParts = d.behavior.slice();
    if (d.behaviorComment) behaviorParts.push('«' + d.behaviorComment + '»');
    setSummary('behavior', behaviorParts.join('; '));
    var dateSummary = d.date ? formatDate(d.date) : (d.flexible ? 'Обсудим ближайшие дни' : '');
    if (dateSummary && d.daytime && d.daytime !== 'Гибко') dateSummary += ' · ' + d.daytime.toLowerCase();
    if (d.date && d.flexible) dateSummary += ' (ориентировочно)';
    setSummary('date', dateSummary);
    setSummary('who', d.clientName || '');

    // Прогресс
    var filled = FIELD_ORDER.filter(function (k) { return fieldFilled(k, d); }).length;
    progressBar.style.width = (filled / FIELD_ORDER.length * 100) + '%';
    progressLabel.textContent = filled === FIELD_ORDER.length
      ? 'Анкета заполнена — можно отправлять'
      : 'Заполнено ' + filled + ' из ' + FIELD_ORDER.length + ' обязательных пунктов';

    // Сообщение
    var ready = filled === FIELD_ORDER.length;
    var message = buildMessage(d);
    summaryBadge.textContent = ready ? 'готово к отправке' : 'черновик';
    summaryBadge.classList.toggle('is-ready', ready);
    summaryPreview.textContent = ready || filled > 0
      ? message
      : 'Заполните анкету — здесь появится текст сообщения, который откроется в WhatsApp.';
    copyBtn.disabled = filled === 0;

    // Снять ошибку с поля, которое стало валидным
    FIELD_ORDER.forEach(function (key) {
      var group = fieldGroup(key);
      if (group.classList.contains('has-error') && !validateField(key, d)) showError(key, '');
    });

    return d;
  }

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  /* ── Степпер возраста ───────────────────────────────── */

  function stepAge(delta) {
    var max = radioValue('ageUnit') === 'месяцев' ? 360 : 30;
    var current = ageInput.value.trim() === '' ? (delta > 0 ? -1 : 1) : Number(ageInput.value);
    if (isNaN(current)) current = 0;
    var next = Math.min(max, Math.max(0, Math.round(current) + delta));
    ageInput.value = String(next);
    refresh();
  }
  $('#age-minus').addEventListener('click', function () { stepAge(-1); });
  $('#age-plus').addEventListener('click', function () { stepAge(1); });

  // При смене единиц подрезаем значение до допустимого
  $$('input[name="ageUnit"]', form).forEach(function (radio) {
    radio.addEventListener('change', function () {
      var max = radioValue('ageUnit') === 'месяцев' ? 360 : 30;
      if (ageInput.value !== '' && Number(ageInput.value) > max) ageInput.value = String(max);
      refresh();
    });
  });

  /* ── Взаимоисключающие чекбоксы ─────────────────────── */

  var calmBox = $('#behavior-calm');
  $$('input[name="behavior"]', form).forEach(function (box) {
    box.addEventListener('change', function () {
      if (box === calmBox && box.checked) {
        $$('input[name="behavior"]', form).forEach(function (other) {
          if (other !== calmBox) other.checked = false;
        });
      } else if (box !== calmBox && box.checked) {
        calmBox.checked = false;
      }
    });
  });

  var adviceBox = $('#care-advice');
  $$('input[name="care"]', form).forEach(function (box) {
    box.addEventListener('change', function () {
      if (box !== adviceBox && box.checked) adviceBox.checked = false;
      if (box === adviceBox && box.checked) {
        $$('input[name="care"]', form).forEach(function (other) {
          if (other !== adviceBox) other.checked = false;
        });
      }
    });
  });

  /* ── Отправка: валидация → диалог → WhatsApp ────────── */

  var dialog = $('#confirm-dialog');
  var dialogMessage = $('#dialog-message');
  var dialogWaLink = $('#dialog-wa-link');
  var dialogStatus = $('#dialog-status');
  var lastMessage = '';

  function openDialog(message) {
    lastMessage = message;
    dialogMessage.textContent = message;
    dialogWaLink.href = waLink(message);
    dialogStatus.textContent = '';
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      // Старые браузеры: сразу открываем WhatsApp
      window.open(waLink(message), '_blank', 'noopener');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var result = validateAll(true);
    if (result.firstBad) {
      var group = fieldGroup(result.firstBad);
      statusEl.textContent = 'Проверьте отмеченные поля — осталось совсем немного.';
      statusEl.classList.remove('is-ok');
      group.classList.add('just-flagged');
      setTimeout(function () { group.classList.remove('just-flagged'); }, 400);
      group.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var focusable = group.querySelector('input:not([type="hidden"]), textarea, button');
      if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 350);
      return;
    }
    statusEl.textContent = '';
    openDialog(buildMessage(result.data));
  });

  $('#dialog-close').addEventListener('click', function () { dialog.close(); });
  $('#dialog-edit').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close(); // клик по затемнению
  });
  dialogWaLink.addEventListener('click', function () {
    dialogStatus.textContent = 'WhatsApp открыт в новой вкладке. Отправьте сообщение — и мы ответим в рабочее время.';
  });

  /* ── Копирование текста ─────────────────────────────── */

  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }

  copyBtn.addEventListener('click', function () {
    var d = collect();
    copyText(buildMessage(d), function (ok) {
      var original = copyBtn.innerHTML;
      copyBtn.textContent = ok ? 'Скопировано ✓' : 'Не удалось скопировать';
      setTimeout(function () { copyBtn.innerHTML = original; }, 2200);
    });
  });

  $('#dialog-copy').addEventListener('click', function () {
    copyText(lastMessage, function (ok) {
      dialogStatus.textContent = ok
        ? 'Текст скопирован — можно вставить его в любой мессенджер.'
        : 'Не удалось скопировать автоматически — выделите текст выше вручную.';
    });
  });

  /* ── Очистка формы ──────────────────────────────────── */

  resetBtn.addEventListener('click', function () {
    form.reset();
    FIELD_ORDER.forEach(function (key) { showError(key, ''); });
    statusEl.textContent = '';
    dateInput.min = todayISO();
    refresh();
    var first = form.querySelector('input[name="species"]');
    if (first) first.focus({ preventScroll: true });
  });

  /* ── FAQ: открыт только один вопрос ─────────────────── */

  var faqItems = $$('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* ── Первый рендер ──────────────────────────────────── */

  refresh();
})();