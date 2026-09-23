/* English 1 — the twelve tenses as a grid.
   Week 5 is "Tenses and Agreement in English Sentences", and the thing that
   actually helps is seeing that the twelve are three times four, not twelve
   separate facts to memorise. Click a cell and you get the structure. */

(function () {
  "use strict";

  var grid = document.getElementById("e1-tenses");
  if (!grid) return;

  var TIMES = ["Past", "Present", "Future"];
  var ASPECTS = ["Simple", "Continuous", "Perfect", "Perfect continuous"];

  /* structure, example, and the one thing each is actually for */
  var T = {
    "Past|Simple": ["subject + V2", "She wrote the report.", "A finished action at a finished time."],
    "Past|Continuous": ["was/were + V-ing", "She was writing when I called.", "The longer action that another action interrupts."],
    "Past|Perfect": ["had + V3", "She had written it before the meeting.", "The earlier of two past events."],
    "Past|Perfect continuous": ["had been + V-ing", "She had been writing for an hour.", "How long something had gone on before a past point."],

    "Present|Simple": ["subject + V1 (+s)", "She writes reports.", "Habits, general truths, and timetables."],
    "Present|Continuous": ["am/is/are + V-ing", "She is writing the report.", "Right now, or a temporary stretch of time."],
    "Present|Perfect": ["have/has + V3", "She has written the report.", "A past action whose result matters now. No specific past time allowed."],
    "Present|Perfect continuous": ["have/has been + V-ing", "She has been writing since morning.", "An action that started in the past and is still going."],

    "Future|Simple": ["will + V1", "She will write the report.", "A decision made now, a prediction, or a promise."],
    "Future|Continuous": ["will be + V-ing", "She will be writing at nine.", "Something in progress at a future moment."],
    "Future|Perfect": ["will have + V3", "She will have written it by Friday.", "Finished before a future deadline."],
    "Future|Perfect continuous": ["will have been + V-ing", "She will have been writing for six hours.", "Duration measured up to a future point."]
  };

  var out = document.getElementById("e1-tense-read");
  var cells = [];

  function show(time, aspect) {
    var k = time + "|" + aspect;
    var d = T[k];
    if (!d || !out) return;
    cells.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.k === k ? "true" : "false");
    });
    out.innerHTML =
      '<p class="tense__name">' + time + " " + aspect.toLowerCase() + "</p>" +
      '<p class="tense__form">' + d[0] + "</p>" +
      '<p class="tense__eg">&ldquo;' + d[1] + "&rdquo;</p>" +
      "<p>" + d[2] + "</p>";
  }

  /* header row */
  var head = document.createElement("div");
  head.className = "tense__cell tense__cell--corner";
  grid.appendChild(head);
  TIMES.forEach(function (t) {
    var h = document.createElement("div");
    h.className = "tense__cell tense__head";
    h.textContent = t;
    grid.appendChild(h);
  });

  ASPECTS.forEach(function (a) {
    var rh = document.createElement("div");
    rh.className = "tense__cell tense__head tense__head--row";
    rh.textContent = a;
    grid.appendChild(rh);

    TIMES.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tense__cell tense__btn";
      b.dataset.k = t + "|" + a;
      b.setAttribute("aria-pressed", "false");
      b.textContent = T[t + "|" + a][0];
      b.addEventListener("click", function () { show(t, a); });
      grid.appendChild(b);
      cells.push(b);
    });
  });

  show("Present", "Perfect");
})();
