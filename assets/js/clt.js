/* Statistics 2 — the central limit theorem, run rather than stated.
   Week 5's "limit theorems" is the load-bearing idea of the second half: the
   distribution of the sample mean goes normal even when the thing you sampled
   is nothing like normal. Pick an ugly source, raise n, and watch the purple
   theoretical curve land on the green histogram. */

(function () {
  "use strict";

  var plot = document.getElementById("s2-plot");
  if (!plot) return;

  var pick = document.getElementById("s2-pick");
  var nIn = document.getElementById("s2-n");
  var nOut = document.getElementById("s2-n-out");
  var read = document.getElementById("s2-read");

  /* Each source: a sampler, its true mean and variance, and a short label. */
  var SOURCES = {
    uniform: {
      name: "Uniform(0, 1)",
      draw: function () { return Math.random(); },
      mu: 0.5, sigma2: 1 / 12,
      note: "flat — every value equally likely"
    },
    bernoulli: {
      name: "Bernoulli(0.3)",
      draw: function () { return Math.random() < 0.3 ? 1 : 0; },
      mu: 0.3, sigma2: 0.3 * 0.7,
      note: "only two values, and not even symmetric"
    },
    exponential: {
      name: "Exponential(1)",
      draw: function () { return -Math.log(1 - Math.random()); },
      mu: 1, sigma2: 1,
      note: "heavily skewed, with a long right tail"
    },
    bimodal: {
      name: "Bimodal",
      draw: function () {
        return Math.random() < 0.5 ? Math.random() * 0.2 : 0.8 + Math.random() * 0.2;
      },
      mu: 0.5, sigma2: 0.16 + 1 / 300,
      note: "two humps with a hole in the middle"
    }
  };

  var current = "exponential";
  var TRIALS = 4000, BINS = 38;

  function run(src, n) {
    var means = new Array(TRIALS), i, j, s;
    for (i = 0; i < TRIALS; i++) {
      s = 0;
      for (j = 0; j < n; j++) s += src.draw();
      means[i] = s / n;
    }
    return means;
  }

  function normalPdf(x, mu, sd) {
    var z = (x - mu) / sd;
    return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  }

  function render() {
    var src = SOURCES[current];
    var n = Number(nIn.value);
    if (nOut) nOut.textContent = n;

    var sd = Math.sqrt(src.sigma2 / n);
    /* Frame the plot on the theory, so raising n visibly narrows the spread
       against a fixed idea of "wide" rather than silently rescaling. */
    var baseSd = Math.sqrt(src.sigma2);
    var lo = src.mu - 3.2 * baseSd, hi = src.mu + 3.2 * baseSd;

    var means = run(src, n);
    var counts = new Array(BINS).fill(0);
    var step = (hi - lo) / BINS;
    var outside = 0;
    means.forEach(function (m) {
      var b = Math.floor((m - lo) / step);
      if (b < 0 || b >= BINS) { outside++; return; }
      counts[b]++;
    });

    /* Density scale, so the histogram and the pdf are directly comparable. */
    var dens = counts.map(function (c) { return c / (TRIALS * step); });
    var peak = Math.max(
      Math.max.apply(null, dens),
      normalPdf(src.mu, src.mu, sd)
    );

    var W = 440, H = 220, padL = 30, padB = 26, padT = 12;
    var pw = W - padL - 10, ph = H - padB - padT;
    function X(v) { return padL + ((v - lo) / (hi - lo)) * pw; }
    function Y(d) { return padT + ph - (d / peak) * ph; }

    var bw = pw / BINS;
    var bars = dens.map(function (d, i) {
      var h = padT + ph - Y(d);
      return '<rect class="clt__bar" x="' + (padL + i * bw).toFixed(1) + '" y="' + Y(d).toFixed(1) +
        '" width="' + Math.max(0.6, bw - 0.8).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '"/>';
    }).join("");

    var pts = [], k;
    for (k = 0; k <= 160; k++) {
      var x = lo + (k / 160) * (hi - lo);
      pts.push(X(x).toFixed(1) + "," + Y(normalPdf(x, src.mu, sd)).toFixed(1));
    }

    plot.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Histogram of ' + TRIALS +
      " sample means, with the normal curve the central limit theorem predicts.\">" +
      bars +
      '<polyline class="clt__theory" points="' + pts.join(" ") + '"/>' +
      '<line class="clt__axis" x1="' + padL + '" y1="' + (padT + ph) + '" x2="' + (padL + pw) +
      '" y2="' + (padT + ph) + '"/>' +
      '<line class="clt__axis" x1="' + X(src.mu) + '" y1="' + padT + '" x2="' + X(src.mu) +
      '" y2="' + (padT + ph) + '" stroke-dasharray="3 3"/>' +
      '<text class="clt__lab" x="' + padL + '" y="' + (H - 8) + '">' + lo.toFixed(2) + "</text>" +
      '<text class="clt__lab" x="' + X(src.mu) + '" y="' + (H - 8) + '" text-anchor="middle">μ = ' +
        src.mu.toFixed(2) + "</text>" +
      '<text class="clt__lab" x="' + (padL + pw) + '" y="' + (H - 8) + '" text-anchor="end">' +
        hi.toFixed(2) + "</text>" +
      "</svg>";

    read.innerHTML =
      "Source: <b>" + src.name + "</b> — " + src.note + ". Taking the mean of <b>n = " + n +
      "</b> draws, four thousand times over.<br>" +
      "The theorem says that mean is close to <i>Normal(μ = " + src.mu.toFixed(2) +
      ", σ/√n = " + sd.toFixed(3) + ")</i>" +
      (n === 1 ? " — but at n = 1 you are just looking at the source itself, so it does not fit yet."
               : ", and that is the purple curve.") +
      (outside > TRIALS * 0.005 ? " (" + outside + " means fell outside the frame.)" : "");
  }

  if (pick) {
    Object.keys(SOURCES).forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = SOURCES[k].name;
      b.setAttribute("aria-pressed", k === current ? "true" : "false");
      b.addEventListener("click", function () {
        current = k;
        Array.prototype.forEach.call(pick.children, function (c) {
          c.setAttribute("aria-pressed", c === b ? "true" : "false");
        });
        render();
      });
      pick.appendChild(b);
    });
  }

  if (nIn) nIn.addEventListener("input", render);
  render();
})();
