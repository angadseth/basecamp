/* Statistics 1 — week 3 in one box.
   Type numbers, get the whole of "describing numerical data": centre, spread,
   the five-number summary, a histogram and a boxplot. It shows the sample and
   the population standard deviation side by side on purpose, because which one
   a question wants is the thing people get wrong. */

(function () {
  "use strict";

  var input = document.getElementById("s1-data");
  if (!input) return;

  var statsEl = document.getElementById("s1-stats");
  var histEl = document.getElementById("s1-hist");
  var boxEl = document.getElementById("s1-box");
  var noteEl = document.getElementById("s1-note");
  var resetBtn = document.getElementById("s1-reset");

  var SAMPLE = "12 15 15 18 21 22 24 24 24 27 30 31 35 38 44 52 61 78";

  function parse(text) {
    return text
      .split(/[^0-9.\-]+/)
      .filter(function (s) { return s !== "" && s !== "-" && s !== "."; })
      .map(Number)
      .filter(function (n) { return isFinite(n); });
  }

  /* Median of a sorted slice. */
  function med(a, lo, hi) {
    var n = hi - lo;
    if (n <= 0) return NaN;
    var m = lo + Math.floor(n / 2);
    return n % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  function summarise(v) {
    var a = v.slice().sort(function (x, y) { return x - y; });
    var n = a.length;
    var sum = a.reduce(function (s, x) { return s + x; }, 0);
    var mean = sum / n;

    var ss = a.reduce(function (s, x) { return s + (x - mean) * (x - mean); }, 0);
    var popVar = ss / n;
    var sampVar = n > 1 ? ss / (n - 1) : NaN;

    /* Quartiles by the median-of-halves rule: with an odd count the overall
       median belongs to neither half. This is the convention in the prescribed
       Weiss text; some books split differently, so check yours. */
    var half = Math.floor(n / 2);
    var median = med(a, 0, n);
    var q1 = med(a, 0, half);
    var q3 = med(a, n % 2 ? half + 1 : half, n);

    /* Mode: every value tied for the highest count. */
    var counts = {}, best = 0;
    a.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; best = Math.max(best, counts[x]); });
    var modes = Object.keys(counts)
      .filter(function (k) { return counts[k] === best; })
      .map(Number);

    return {
      a: a, n: n, mean: mean, median: median, q1: q1, q3: q3,
      min: a[0], max: a[n - 1], iqr: q3 - q1, range: a[n - 1] - a[0],
      popSd: Math.sqrt(popVar), sampSd: Math.sqrt(sampVar),
      modes: modes, modeCount: best
    };
  }

  function f(x) {
    if (!isFinite(x)) return "—";
    return (Math.round(x * 100) / 100).toString();
  }

  function cell(label, value, lead) {
    return '<div' + (lead ? ' class="is-lead"' : "") + "><dt>" + label + "</dt><dd>" + value + "</dd></div>";
  }

  function drawHist(s) {
    var W = 420, H = 150, pad = 18;
    var bins = Math.max(4, Math.min(10, Math.ceil(Math.sqrt(s.n))));
    var lo = s.min, hi = s.max;
    var width = (hi - lo) || 1;
    var step = width / bins;
    var counts = new Array(bins).fill(0);
    s.a.forEach(function (x) {
      var b = Math.min(bins - 1, Math.floor((x - lo) / step));
      counts[b]++;
    });
    var peak = Math.max.apply(null, counts);
    var bw = (W - pad * 2) / bins;

    var bars = counts.map(function (c, i) {
      var h = peak ? (c / peak) * (H - pad * 2) : 0;
      return '<rect class="bar' + (c === peak ? " bar--lead" : "") + '" x="' +
        (pad + i * bw + 1).toFixed(1) + '" y="' + (H - pad - h).toFixed(1) +
        '" width="' + (bw - 2).toFixed(1) + '" height="' + h.toFixed(1) + '"/>';
    }).join("");

    histEl.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Histogram of the values you typed.">' +
      bars +
      '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) +
      '" stroke="var(--ink-3)" stroke-width="1"/>' +
      '<text class="box__lab" x="' + pad + '" y="' + (H - 5) + '" text-anchor="start">' + f(lo) + "</text>" +
      '<text class="box__lab" x="' + (W - pad) + '" y="' + (H - 5) + '" text-anchor="end">' + f(hi) + "</text>" +
      "</svg>";
  }

  function drawBox(s) {
    var W = 420, H = 110, pad = 26, y = 44, bh = 30;
    var lo = s.min, hi = s.max, span = (hi - lo) || 1;
    function X(v) { return pad + ((v - lo) / span) * (W - pad * 2); }

    boxEl.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Boxplot of the values you typed.">' +
      '<line class="box__whisker" x1="' + X(s.min) + '" y1="' + (y + bh / 2) + '" x2="' + X(s.q1) + '" y2="' + (y + bh / 2) + '"/>' +
      '<line class="box__whisker" x1="' + X(s.q3) + '" y1="' + (y + bh / 2) + '" x2="' + X(s.max) + '" y2="' + (y + bh / 2) + '"/>' +
      '<line class="box__whisker" x1="' + X(s.min) + '" y1="' + y + '" x2="' + X(s.min) + '" y2="' + (y + bh) + '"/>' +
      '<line class="box__whisker" x1="' + X(s.max) + '" y1="' + y + '" x2="' + X(s.max) + '" y2="' + (y + bh) + '"/>' +
      '<rect class="box__box" x="' + X(s.q1) + '" y="' + y + '" width="' + Math.max(1, X(s.q3) - X(s.q1)) + '" height="' + bh + '"/>' +
      '<line class="box__med" x1="' + X(s.median) + '" y1="' + y + '" x2="' + X(s.median) + '" y2="' + (y + bh) + '"/>' +
      '<text class="box__lab" x="' + X(s.min) + '" y="' + (y - 8) + '">min</text>' +
      '<text class="box__lab" x="' + X(s.q1) + '" y="' + (y + bh + 16) + '">Q1</text>' +
      '<text class="box__lab" x="' + X(s.median) + '" y="' + (y - 8) + '">med</text>' +
      '<text class="box__lab" x="' + X(s.q3) + '" y="' + (y + bh + 16) + '">Q3</text>' +
      '<text class="box__lab" x="' + X(s.max) + '" y="' + (y - 8) + '">max</text>' +
      "</svg>";
  }

  function render() {
    var v = parse(input.value);
    if (v.length < 2) {
      statsEl.innerHTML = "";
      histEl.innerHTML = "";
      boxEl.innerHTML = "";
      noteEl.textContent = "Type at least two numbers, separated by spaces or commas.";
      return;
    }

    var s = summarise(v);

    statsEl.innerHTML =
      cell("n", s.n) +
      cell("mean", f(s.mean), true) +
      cell("median", f(s.median), true) +
      cell("mode", s.modeCount > 1 ? s.modes.map(f).join(", ") : "none", false) +
      cell("min", f(s.min)) +
      cell("Q1", f(s.q1)) +
      cell("Q3", f(s.q3)) +
      cell("max", f(s.max)) +
      cell("range", f(s.range)) +
      cell("IQR", f(s.iqr), true) +
      cell("sd (sample)", f(s.sampSd)) +
      cell("sd (population)", f(s.popSd));

    drawHist(s);
    drawBox(s);

    var skew = s.mean > s.median ? "mean above median — the tail runs right"
             : s.mean < s.median ? "mean below median — the tail runs left"
             : "mean equals median — symmetric";
    noteEl.innerHTML =
      "Five-number summary: <b>" + f(s.min) + " · " + f(s.q1) + " · " + f(s.median) +
      " · " + f(s.q3) + " · " + f(s.max) + "</b>. " + skew + ".";
  }

  input.addEventListener("input", render);
  if (resetBtn) resetBtn.addEventListener("click", function () { input.value = SAMPLE; render(); });
  input.value = SAMPLE;
  render();
})();
