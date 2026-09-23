/* Basecamp hero — a topographic contour field, drawn as SVG.
   Not decoration for its own sake: the hills are the eight courses, and the
   rings get tighter as you climb. Deterministic, so it never flickers between
   loads, and it redraws only on resize. */

(function () {
  "use strict";

  var svg = document.getElementById("contours");
  if (!svg) return;

  var NS = "http://www.w3.org/2000/svg";

  /* A tiny seeded PRNG so the field is identical on every visit. */
  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* One closed ring: a circle pushed around by a few harmonics. The same
     harmonics are shared by every ring of a hill, so the rings nest like a
     real contour map instead of crossing each other. */
  function ring(cx, cy, r, squash, harmonics) {
    var steps = 128, d = "", i, a, k, rr, x, y;
    for (i = 0; i <= steps; i++) {
      a = (i / steps) * Math.PI * 2;
      rr = r;
      for (k = 0; k < harmonics.length; k++) {
        rr += harmonics[k].amp * r * Math.sin(harmonics[k].n * a + harmonics[k].phase);
      }
      x = cx + Math.cos(a) * rr;
      y = cy + Math.sin(a) * rr * squash;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + "Z";
  }

  function hill(rand, cx, cy, maxR, rings, squash) {
    var harmonics = [], i;
    for (i = 0; i < 3; i++) {
      harmonics.push({
        n: 2 + Math.floor(rand() * 4),
        amp: 0.05 + rand() * 0.07,
        phase: rand() * Math.PI * 2
      });
    }
    var out = [];
    for (i = 0; i < rings; i++) {
      /* Rings crowd together near the summit, the way a steep slope reads. */
      var t = (i + 1) / rings;
      out.push({ d: ring(cx, cy, maxR * Math.pow(t, 1.35), squash, harmonics), t: t });
    }
    return out;
  }

  function draw() {
    var w = 1200, h = 520;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var rand = mulberry(20260923);
    var g = document.createElementNS(NS, "g");
    g.setAttribute("fill", "none");
    g.setAttribute("stroke", "currentColor");
    g.setAttribute("stroke-width", "1");

    var hills = [
      hill(rand, w * 0.18, h * 0.62, 300, 11, 0.62),
      hill(rand, w * 0.78, h * 0.38, 360, 13, 0.58),
      hill(rand, w * 0.52, h * 0.88, 210, 8, 0.55)
    ];

    hills.forEach(function (rings) {
      rings.forEach(function (r) {
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", r.d);
        /* Outer rings fade out, summit rings hold — reads as depth. */
        p.setAttribute("opacity", (0.10 + r.t * 0.34).toFixed(3));
        g.appendChild(p);
      });
    });

    svg.appendChild(g);
  }

  draw();
})();
