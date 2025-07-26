document.addEventListener("dblclick", async (e) => {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText || selectedText.split(/\s+/).length > 1) return;

  removeExistingTooltip();

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`);
    const data = await res.json();

    const entry = data[0];
    const defs = entry?.meanings?.flatMap(m =>
      m.definitions.map(d => ({
        partOfSpeech: m.partOfSpeech,
        definition: d.definition,
        example: d.example || ""
      }))
    ) || [];

    const audio = entry?.phonetics?.find(p => p.audio)?.audio;
    if (!defs.length) return;

    const tooltip = document.createElement("div");
    tooltip.id = "dictionary-tooltip";
    tooltip.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:16px;">${selectedText}</strong>
        ${audio ? `<button id="play-audio" style="border:none;background:none;cursor:pointer;font-size:16px;">🔊</button>` : ""}
      </div>
      <div style="margin-top:6px;">
        ${defs.slice(0, 2).map(d => `
          <div style="margin-bottom:6px;">
            <em>${d.partOfSpeech}</em>: ${d.definition}<br/>
            <small style="color:#555;"><i>${d.example}</i></small>
          </div>
        `).join("")}
      </div>
    `;

    Object.assign(tooltip.style, {
      position: "absolute",
      top: `${e.pageY + 10}px`,
      left: `${e.pageX + 10}px`,
      maxWidth: "300px",
      background: "#fff",
      color: "#000",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      zIndex: 9999,
      fontSize: "14px",
      fontFamily: "sans-serif"
    });

    document.body.appendChild(tooltip);

    if (audio) {
      document.getElementById("play-audio").addEventListener("click", () => {
        new Audio(audio).play();
      });
    }
  } catch (err) {
    console.error("Definition fetch error:", err);
  }
});

document.addEventListener("click", () => {
  removeExistingTooltip();
});

function removeExistingTooltip() {
  const oldTooltip = document.getElementById("dictionary-tooltip");
  if (oldTooltip) oldTooltip.remove();
}
