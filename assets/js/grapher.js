/* Maths 1 — a small plotter, used twice on the page.
   Once for the hero figure, and once for the quadratic widget in the chapter
   on week 3. It reads its colours from the page's custom properties, so it
   follows the theme toggle without being told. */

(function () {
  "use strict";

  function css(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* A canvas that knows its own world coordinates. */
  function Plot(canvas, world) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.world = world; // {x0,x1,y0,y1}
    this.resize();
  }

  Plot.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = this.c.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width));
    var h = Math.max(1, Math.round(r.height || w * 0.72));
    this.w = w; this.h = h;
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  Plot.prototype.px = function (x) {
    var W = this.world;
    return ((x - W.x0) / (W.x1 - W.x0)) * this.w;
  };
  Plot.prototype.py = function (y) {
    var W = this.world;
    return this.h - ((y - W.y0) / (W.y1 - W.y0)) * this.h;
  };

  Plot.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.w, this.h);
  };

  Plot.prototype.grid = function (step, colour) {
    var ctx = this.ctx, W = this.world, x, y;
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (x = Math.ceil(W.x0 / step) * step; x <= W.x1; x += step) {
      ctx.moveTo(Math.round(this.px(x)) + 0.5, 0);
      ctx.lineTo(Math.round(this.px(x)) + 0.5, this.h);
    }
    for (y = Math.ceil(W.y0 / step) * step; y <= W.y1; y += step) {
      ctx.moveTo(0, Math.round(this.py(y)) + 0.5);
      ctx.lineTo(this.w, Math.round(this.py(y)) + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  };

  Plot.prototype.axes = function (colour) {
    var ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(this.py(0)) + 0.5);
    ctx.lineTo(this.w, Math.round(this.py(0)) + 0.5);
    ctx.moveTo(Math.round(this.px(0)) + 0.5, 0);
    ctx.lineTo(Math.round(this.px(0)) + 0.5, this.h);
    ctx.stroke();
    ctx.restore();
  };

  Plot.prototype.curve = function (f, colour, width) {
    var ctx = this.ctx, W = this.world, i, x, y, py, started = false;
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = width || 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (i = 0; i <= this.w; i++) {
      x = W.x0 + (i / this.w) * (W.x1 - W.x0);
      y = f(x);
      if (!isFinite(y)) { started = false; continue; }
      py = this.py(y);
      /* Do not draw the near-vertical join when a curve leaves the frame. */
      if (py < -this.h || py > this.h * 2) { started = false; continue; }
      if (!started) { ctx.moveTo(i, py); started = true; } else { ctx.lineTo(i, py); }
    }
    ctx.stroke();
    ctx.restore();
  };

  Plot.prototype.dot = function (x, y, colour, label, labelColour) {
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(this.px(x), this.py(y), 4.5, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = labelColour || colour;
      ctx.font = "500 12px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, this.px(x) + 8, this.py(y) - 8);
    }
    ctx.restore();
  };

  /* ---- The hero: one quadratic, breathing ------------------------------ */

  var heroCanvas = document.getElementById("m1-hero");
  if (heroCanvas) {
    var hero = new Plot(heroCanvas, { x0: -5.2, x1: 5.2, y0: -4.6, y1: 6.2 });
    var t0 = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function drawHero(ts) {
      if (t0 === null) t0 = ts || 0;
      var t = ((ts || 0) - t0) / 1000;
      var a = reduce ? 0.65 : 0.55 + 0.22 * Math.sin(t * 0.42);
      var b = reduce ? -0.4 : 0.5 * Math.sin(t * 0.31);
      var cq = -2.1;

      var grid = css(heroCanvas, "--grid-bold", "rgba(0,0,0,.08)");
      var axis = css(heroCanvas, "--ink-3", "#777");
      var accent = css(heroCanvas, "--accent", "#4b46c4");
      var second = css(heroCanvas, "--curve-2", "#c81d6a");

      hero.clear();
      hero.grid(1, grid);
      hero.axes(axis);

      var f = function (x) { return a * x * x + b * x + cq; };
      hero.curve(f, accent, 2.8);

      /* The vertex and the roots — the three things week 3 asks you to find. */
      var vx = -b / (2 * a);
      hero.dot(vx, f(vx), accent);

      var disc = b * b - 4 * a * cq;
      if (disc >= 0) {
        var r = Math.sqrt(disc) / (2 * a);
        hero.dot(vx - r, 0, second);
        hero.dot(vx + r, 0, second);
      }

      /* The tangent at the vertex is flat — week 8's whole point, one page early. */
      hero.curve(function () { return f(vx); }, second, 1.2);

      if (!reduce) requestAnimationFrame(drawHero);
    }

    requestAnimationFrame(drawHero);
    var ro = new ResizeObserver(function () { hero.resize(); if (reduce) drawHero(0); });
    ro.observe(heroCanvas);
  }

  /* ---- The widget: a quadratic you control ----------------------------- */

  var wCanvas = document.getElementById("m1-quad");
  if (!wCanvas) return;

  var plot = new Plot(wCanvas, { x0: -8, x1: 8, y0: -8, y1: 8 });
  var out = document.getElementById("m1-read");
  var inputs = {
    a: document.getElementById("m1-a"),
    b: document.getElementById("m1-b"),
    c: document.getElementById("m1-c")
  };

  function fmt(n) {
    return (Math.round(n * 100) / 100).toString();
  }

  function render() {
    var a = Number(inputs.a.value) / 10;
    var b = Number(inputs.b.value) / 10;
    var c = Number(inputs.c.value) / 10;

    var oa = document.getElementById("m1-a-out");
    var ob = document.getElementById("m1-b-out");
    var oc = document.getElementById("m1-c-out");
    if (oa) oa.textContent = fmt(a);
    if (ob) ob.textContent = fmt(b);
    if (oc) oc.textContent = fmt(c);

    var grid = css(wCanvas, "--grid-bold", "rgba(0,0,0,.08)");
    var axis = css(wCanvas, "--ink-3", "#777");
    var accent = css(wCanvas, "--accent", "#4b46c4");
    var second = css(wCanvas, "--curve-2", "#c81d6a");
    var inkc = css(wCanvas, "--ink-2", "#444");

    plot.clear();
    plot.grid(1, grid);
    plot.axes(axis);

    if (a === 0) {
      /* Not a quadratic any more — say so rather than drawing a lie. */
      plot.curve(function (x) { return b * x + c; }, accent, 2.6);
      if (out) {
        out.innerHTML = "With <b>a = 0</b> this is not a quadratic at all — it is the " +
          "straight line from week 2. That is exactly the case the exam likes to hide " +
          "inside a word problem.";
      }
      return;
    }

    plot.curve(function (x) { return a * x * x + b * x + c; }, accent, 2.6);

    var vx = -b / (2 * a);
    var vy = a * vx * vx + b * vx + c;
    plot.dot(vx, vy, accent, "vertex", inkc);

    var disc = b * b - 4 * a * c;
    var roots = "";
    if (disc > 0) {
      var r = Math.sqrt(disc) / (2 * a);
      plot.dot(vx - Math.abs(r), 0, second);
      plot.dot(vx + Math.abs(r), 0, second);
      roots = "two real roots at x = <b>" + fmt(vx - Math.abs(r)) + "</b> and <b>" +
              fmt(vx + Math.abs(r)) + "</b>";
    } else if (Math.abs(disc) < 1e-9) {
      plot.dot(vx, 0, second);
      roots = "one repeated root at x = <b>" + fmt(vx) + "</b> — the curve just touches the axis";
    } else {
      roots = "<b>no real roots</b>: the curve never meets the x-axis";
    }

    if (out) {
      out.innerHTML =
        "Discriminant b² − 4ac = <b>" + fmt(disc) + "</b> → " + roots + ".<br>" +
        "Vertex at (<b>" + fmt(vx) + "</b>, <b>" + fmt(vy) + "</b>), which is a " +
        (a > 0 ? "<b>minimum</b> (a > 0, opens upward)" : "<b>maximum</b> (a < 0, opens downward)") + ".";
    }
  }

  Object.keys(inputs).forEach(function (k) {
    if (inputs[k]) inputs[k].addEventListener("input", render);
  });
  new ResizeObserver(function () { plot.resize(); render(); }).observe(wCanvas);
  render();
})();
