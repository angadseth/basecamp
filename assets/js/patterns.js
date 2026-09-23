/* English 2 — the clause patterns, weeks 1 to 3.
   "Patterns in Sentences" runs for three weeks, and the whole of it is seven
   shapes. Pick a shape and the sentence beneath it is labelled element by
   element, because the exam asks you to label, not to rewrite. */

(function () {
  "use strict";

  var tabs = document.getElementById("e2-tabs");
  if (!tabs) return;

  var stage = document.getElementById("e2-sent");
  var why = document.getElementById("e2-why");

  /* S subject · V verb · O object · Oi indirect object · C complement · A adverbial */
  var P = [
    {
      k: "SV",
      parts: [["The audience", "S"], ["applauded", "V"]],
      why: "The simplest complete clause. The verb is <b>intransitive</b> — it takes no object, and the sentence is finished without one."
    },
    {
      k: "SVO",
      parts: [["The committee", "S"], ["approved", "V"], ["the proposal", "O"]],
      why: "A <b>transitive</b> verb with one direct object. This is the pattern most English sentences use."
    },
    {
      k: "SVC",
      parts: [["Her argument", "S"], ["was", "V"], ["convincing", "C"]],
      why: "The verb is a <b>linking verb</b> and what follows describes the subject, not a separate thing. Test: the complement and the subject refer to the same entity."
    },
    {
      k: "SVOO",
      parts: [["The office", "S"], ["sent", "V"], ["her", "Oi"], ["a reminder", "O"]],
      why: "Two objects: the <b>indirect</b> one (who receives) comes first, the <b>direct</b> one (what is given) second. It can be rewritten with <em>to</em> or <em>for</em>."
    },
    {
      k: "SVOC",
      parts: [["The panel", "S"], ["declared", "V"], ["the result", "O"], ["final", "C"]],
      why: "One object plus a complement that describes <b>that object</b>. Compare with SVC, where the complement described the subject."
    },
    {
      k: "SVA",
      parts: [["The meeting", "S"], ["is", "V"], ["in the north wing", "A"]],
      why: "The <b>adverbial is obligatory</b> — remove it and the sentence is incomplete. That is what separates SVA from SV plus an optional adverbial."
    },
    {
      k: "SVOA",
      parts: [["She", "S"], ["placed", "V"], ["the folder", "O"], ["on the desk", "A"]],
      why: "An object and an obligatory adverbial. <em>She placed the folder</em> on its own is not a complete sentence, which is the test."
    }
  ];

  var NAMES = { S: "subject", V: "verb", O: "object", Oi: "indirect obj", C: "complement", A: "adverbial" };

  function show(i) {
    var p = P[i];
    Array.prototype.forEach.call(tabs.children, function (b, n) {
      b.setAttribute("aria-pressed", n === i ? "true" : "false");
    });
    stage.innerHTML = p.parts.map(function (part) {
      return '<span class="el">' + part[0] +
        '<span class="el__tag">' + NAMES[part[1]] + "</span></span>";
    }).join(" ") + ".";
    why.innerHTML = p.why;
  }

  P.forEach(function (p, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pat__tab";
    b.textContent = p.k;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { show(i); });
    tabs.appendChild(b);
  });

  show(1);
})();
