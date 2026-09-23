/* Basecamp — the "what do I need?" calculator.
   Two shapes: the six standard Foundation courses, and Programming in Python.
   Both formulas come from the May 2026 grading document; see docs/sources. */

(function () {
  "use strict";

  var pick = document.getElementById("calc-course");
  var fields = document.getElementById("calc-fields");
  var scoreEl = document.getElementById("calc-score");
  var gradeEl = document.getElementById("calc-grade");
  var noteEl = document.getElementById("calc-note");
  if (!fields || !scoreEl) return;

  var SHAPES = {
    std: {
      inputs: [
        { id: "qz1", label: "Quiz 1", v: 60 },
        { id: "qz2", label: "Quiz 2", v: 60 },
        { id: "f", label: "End term", v: 60 }
      ],
      score: function (v) {
        var a = 0.6 * v.f + 0.3 * Math.max(v.qz1, v.qz2);
        var b = 0.45 * v.f + 0.25 * v.qz1 + 0.3 * v.qz2;
        return { t: Math.max(a, b), branch: a >= b ? "one-quiz branch" : "both-quiz branch" };
      }
    },
    py: {
      inputs: [
        { id: "qz1", label: "Quiz 1", v: 60 },
        { id: "pe1", label: "OPPE 1", v: 60 },
        { id: "pe2", label: "OPPE 2", v: 60 },
        { id: "f", label: "End term", v: 60 }
      ],
      score: function (v) {
        var t = 0.15 * v.qz1 + 0.4 * v.f +
                0.25 * Math.max(v.pe1, v.pe2) + 0.2 * Math.min(v.pe1, v.pe2);
        return {
          t: t,
          branch: Math.max(v.pe1, v.pe2) >= 40
            ? "one OPPE is above 40 — you get a grade"
            : "no OPPE reaches 40 — this is a U, whatever T says"
        };
      }
    }
  };

  /* The programme's usual scale. The site says out loud that it is not from
     the grading document, so nobody plans a term around it. */
  var BANDS = [[90, "S"], [80, "A"], [70, "B"], [60, "C"], [50, "D"], [40, "E"]];

  function grade(t) {
    for (var i = 0; i < BANDS.length; i++) if (t >= BANDS[i][0]) return BANDS[i][1];
    return "U";
  }

  var state = {};

  function render() {
    var shape = SHAPES[pick && pick.value === "py" ? "py" : "std"];
    fields.innerHTML = "";
    state = {};

    shape.inputs.forEach(function (inp) {
      state[inp.id] = inp.v;

      var wrap = document.createElement("div");
      wrap.className = "calc__field";

      var lab = document.createElement("label");
      lab.setAttribute("for", "calc-" + inp.id);
      lab.textContent = inp.label;

      var out = document.createElement("output");
      out.textContent = inp.v;

      var range = document.createElement("input");
      range.type = "range";
      range.min = "0";
      range.max = "100";
      range.step = "1";
      range.value = String(inp.v);
      range.id = "calc-" + inp.id;

      range.addEventListener("input", function () {
        state[inp.id] = Number(range.value);
        out.textContent = range.value;
        compute(shape);
      });

      lab.appendChild(document.createTextNode(" "));
      lab.appendChild(out);
      wrap.appendChild(lab);
      wrap.appendChild(range);
      fields.appendChild(wrap);
    });

    compute(shape);
  }

  function compute(shape) {
    var r = shape.score(state);
    var t = Math.round(r.t * 10) / 10;
    scoreEl.textContent = t.toFixed(1);
    gradeEl.textContent = grade(t);
    if (noteEl) {
      noteEl.textContent = r.branch +
        ". Grade bands are the programme's usual scale — confirm them on your course page.";
    }
  }

  if (pick) pick.addEventListener("change", render);
  render();
})();
