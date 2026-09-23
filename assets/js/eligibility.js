/* Programming in Python — the eligibility checker.
   This course fails people on rules, not on difficulty. There are four separate
   gates and they use different weeks, so put your eight weekly GrPA averages in
   and see all four at once. Rules are from the May 2026 grading document. */

(function () {
  "use strict";

  var grid = document.getElementById("py-weeks");
  if (!grid) return;

  var out = document.getElementById("py-verdicts");
  var sct = document.getElementById("py-sct");
  var inputs = [];

  for (var i = 1; i <= 8; i++) {
    var wrap = document.createElement("div");
    wrap.className = "elig__w";

    var lab = document.createElement("label");
    lab.setAttribute("for", "py-a" + i);
    lab.textContent = "A" + i;

    var inp = document.createElement("input");
    inp.type = "number";
    inp.min = "0";
    inp.max = "100";
    inp.id = "py-a" + i;
    inp.value = "70";
    inp.setAttribute("aria-label", "Week " + i + " programming assignment average");
    inp.addEventListener("input", render);

    wrap.appendChild(lab);
    wrap.appendChild(inp);
    grid.appendChild(wrap);
    inputs.push({ wrap: wrap, inp: inp });
  }

  function vals() {
    return inputs.map(function (o) {
      var n = Number(o.inp.value);
      return isFinite(n) ? n : 0;
    });
  }

  function best5of7(a) {
    var first7 = a.slice(0, 7).slice().sort(function (x, y) { return y - x; });
    var top5 = first7.slice(0, 5);
    return top5.reduce(function (s, x) { return s + x; }, 0) / 5;
  }

  function card(cls, title, body) {
    return '<div class="verdict verdict--' + cls + '"><h4>' + title + "</h4><p>" + body + "</p></div>";
  }

  function f(n) { return (Math.round(n * 10) / 10).toString(); }

  function render() {
    var a = vals();
    var hasSct = sct ? sct.checked : true;

    /* OPPE 1: SCT, and each of A1..A4 at or above 40. */
    var w14 = a.slice(0, 4);
    var fail14 = w14.map(function (v, n) { return v < 40 ? "A" + (n + 1) : null; }).filter(Boolean);

    /* OPPE 2: SCT, each of A5..A8 at or above 40, and the best-5-of-7 gate. */
    var w58 = a.slice(4, 8);
    var fail58 = w58.map(function (v, n) { return v < 40 ? "A" + (n + 5) : null; }).filter(Boolean);
    var avg = best5of7(a);

    inputs.forEach(function (o, n) {
      o.wrap.classList.toggle("elig__w--fail", a[n] < 40);
    });

    var html = "";

    if (!hasSct) {
      html += card("no", "System Compatibility Test",
        "You have not done the <b>SCT</b>. Neither OPPE will be scheduled for you, " +
        "whatever your assignment scores are — and without an OPPE there is no grade.");
    } else {
      html += card("ok", "System Compatibility Test", "Done. Both OPPEs can be scheduled.");
    }

    html += fail14.length
      ? card("no", "OPPE 1", "Not eligible. <b>" + fail14.join(", ") +
          "</b> " + (fail14.length > 1 ? "are" : "is") + " below 40. " +
          "Every one of A1 to A4 must reach <b>40/100</b> — there is no best-of here.")
      : card("ok", "OPPE 1", "Eligible. A1 to A4 are all at or above <b>40</b>. Syllabus is weeks <b>1&nbsp;to&nbsp;5</b>.");

    var o2 = [];
    if (fail58.length) o2.push("<b>" + fail58.join(", ") + "</b> below 40");
    if (avg < 40) o2.push("best-5-of-7 average is <b>" + f(avg) + "</b>, under 40");
    html += o2.length
      ? card("no", "OPPE 2", "Not eligible: " + o2.join("; ") +
          ". A5 to A8 must each reach 40 <em>and</em> the best-5-of-7 gate must be cleared.")
      : card("ok", "OPPE 2", "Eligible. A5 to A8 are all at or above 40 and the best-5-of-7 average is <b>" +
          f(avg) + "</b>. Syllabus is weeks <b>1&nbsp;to&nbsp;8</b>.");

    var canOppe = hasSct && (!fail14.length || !fail58.length);
    var endOk = avg >= 40 && canOppe;
    html += endOk
      ? card("ok", "End term", "Eligible. Best-5-of-7 average is <b>" + f(avg) +
          "</b> and you can sit at least one OPPE.")
      : card("no", "End term",
          avg < 40
            ? "Not eligible: best-5-of-7 average is <b>" + f(avg) + "</b>, under 40."
            : "Not eligible: you must be able to sit <b>at least one</b> OPPE. " +
              "Ineligible for both means repeating the whole course.");

    html += card(endOk && canOppe ? "ok" : "no", "And then the grade rule",
      "Even after all of that, you only get a grade if you attend the end term " +
      "<em>and</em> score <b>40 or more in at least one OPPE</b>. Otherwise the result is " +
      "<b>I_OP</b> or <b>U</b>, no matter how good your total is.");

    out.innerHTML = html;
  }

  if (sct) sct.addEventListener("change", render);
  render();
})();
