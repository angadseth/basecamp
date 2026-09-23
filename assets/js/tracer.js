/* Computational Thinking — a pseudocode tracer.
   Week 2 asks you to find the max and the min of a list, and the exam asks you
   to say what the variables hold after k iterations. The only reliable way to
   answer that is to trace by hand, so this does the same thing slowly and lets
   you check yourself. The trace is computed up front, so stepping backwards
   costs nothing. */

(function () {
  "use strict";

  var codeEl = document.getElementById("ct-code");
  if (!codeEl) return;

  var LINES = [
    "Procedure MaxMin(L)",
    "    max = L[0]",
    "    min = L[0]",
    "    i = 1",
    "    while i < length(L):",
    "        if L[i] > max:",
    "            max = L[i]",
    "        if L[i] < min:",
    "            min = L[i]",
    "        i = i + 1",
    "    return (max, min)",
    "End MaxMin"
  ];

  var listEl = document.getElementById("ct-list");
  var varsEl = document.getElementById("ct-vars");
  var stepEl = document.getElementById("ct-step");
  var prevBtn = document.getElementById("ct-prev");
  var nextBtn = document.getElementById("ct-next");
  var playBtn = document.getElementById("ct-play");
  var newBtn = document.getElementById("ct-new");

  var L = [], steps = [], at = 0, timer = null;

  function randomList() {
    var n = 6, out = [], i;
    for (i = 0; i < n; i++) out.push(Math.floor(Math.random() * 90) + 5);
    return out;
  }

  /* Run the procedure, recording one snapshot per executed line. */
  function build(list) {
    var s = [];
    var max, min, i;
    function snap(line, note) {
      s.push({
        line: line,
        vars: { i: i, max: max, min: min },
        at: (line >= 5 && line <= 9 && i !== undefined && i < list.length) ? i : -1,
        note: note || ""
      });
    }

    snap(0, "the procedure is called with the list");
    max = list[0]; snap(1, "max starts at the first element, not at zero");
    min = list[0]; snap(2, "min starts there too");
    i = 1; snap(3, "start from the second element — the first is already used");

    while (true) {
      snap(4, i < list.length ? "i = " + i + " is still inside the list" : "i = " + i + " is past the end, so the loop stops");
      if (i >= list.length) break;

      snap(5, "is L[" + i + "] = " + list[i] + " bigger than max = " + max + "?");
      if (list[i] > max) { max = list[i]; snap(6, "yes — max becomes " + max); }

      snap(7, "is L[" + i + "] = " + list[i] + " smaller than min = " + min + "?");
      if (list[i] < min) { min = list[i]; snap(8, "yes — min becomes " + min); }

      i = i + 1; snap(9, "move to the next element");
    }

    snap(10, "answer: max = " + max + ", min = " + min);
    return s;
  }

  function renderCode() {
    codeEl.innerHTML = "";
    LINES.forEach(function (text, n) {
      var d = document.createElement("div");
      d.className = "trace__ln";
      d.dataset.n = String(n + 1);
      d.textContent = text;
      codeEl.appendChild(d);
    });
  }

  function render() {
    var s = steps[at];

    Array.prototype.forEach.call(codeEl.children, function (el, n) {
      el.classList.toggle("trace__ln--on", n === s.line);
    });

    listEl.innerHTML = "";
    L.forEach(function (v, n) {
      var li = document.createElement("li");
      li.textContent = v;
      if (n === s.at) li.className = "is-at";
      else if (s.vars.i !== undefined && n < s.vars.i) li.className = "is-done";
      listEl.appendChild(li);
    });

    var prev = at > 0 ? steps[at - 1].vars : {};
    varsEl.innerHTML = "";
    [["i", s.vars.i], ["max", s.vars.max], ["min", s.vars.min]].forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "trace__row" + (prev[pair[0]] !== pair[1] ? " trace__row--changed" : "");
      row.innerHTML = "<b>" + pair[0] + "</b><span>" +
        (pair[1] === undefined ? "—" : pair[1]) + "</span>";
      varsEl.appendChild(row);
    });

    stepEl.textContent = "step " + (at + 1) + " of " + steps.length + " · " + s.note;
    prevBtn.disabled = at === 0;
    nextBtn.disabled = at === steps.length - 1;
  }

  function go(d) {
    at = Math.max(0, Math.min(steps.length - 1, at + d));
    render();
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    playBtn.textContent = "Play";
  }

  function reset(list) {
    stop();
    L = list;
    steps = build(L);
    at = 0;
    render();
  }

  renderCode();
  reset([42, 17, 63, 8, 55, 29]);

  prevBtn.addEventListener("click", function () { stop(); go(-1); });
  nextBtn.addEventListener("click", function () { stop(); go(1); });
  newBtn.addEventListener("click", function () { reset(randomList()); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (at === steps.length - 1) at = 0;
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (at >= steps.length - 1) { stop(); return; }
      go(1);
    }, 700);
  });
})();
