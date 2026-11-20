// Skreytum Hús – forsíða: síur, sjónvarpsþættir og valmynd í síma.
(function () {
  'use strict';

  // Valmynd í síma
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.querySelector('.mobile-menu');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Loka valmynd' : 'Opna valmynd');
  }
  setMenu(false);
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  // Sía nýjustu færslur eftir flokki
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('.grid4 [data-cat]');
  function setFilter(name) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.filter === name ? 'true' : 'false'); });
    cards.forEach(function (card) { card.hidden = !(name === 'Allt' || card.dataset.cat === name); });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { setFilter(c.dataset.filter); }); });
  document.querySelectorAll('.tile[data-filter]').forEach(function (t) {
    t.addEventListener('click', function () { setFilter(t.dataset.filter); });
  });

  // Skreytum Hús TV: velja þátt
  var eps = window.SH_EPISODES || [];
  var feature = document.getElementById('tv-feature');
  var epBtns = document.querySelectorAll('button.ep[data-ep]');
  function setEp(i) {
    var e = eps[i];
    if (!e || !feature) return;
    feature.href = e.href;
    var img = feature.querySelector('img');
    img.src = e.img;
    img.alt = e.title;
    var label = feature.querySelector('.ph > span:last-child');
    if (label) label.textContent = 'Þáttur ' + e.n + ' · Horfa á Vísi';
    feature.querySelector('h3').textContent = e.title;
    feature.querySelector('p').textContent = e.ex;
    epBtns.forEach(function (b, j) {
      b.className = j === i ? 'ep ep-on' : 'ep ep-off';
      b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
  }
  epBtns.forEach(function (b) { b.addEventListener('click', function () { setEp(Number(b.dataset.ep)); }); });
})();
