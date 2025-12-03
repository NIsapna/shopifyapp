
(function () {
  const cardStyles = `
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f4f6f8;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-top: 20px;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
  `;

  function createTextElement(tag, text, style = "") {
    const el = document.createElement(tag);
    el.textContent = text || "";
    if (style) {
      el.style.cssText = style;
    }
    return el;
  }

  function createLink(url, label) {
    if (!url) return null;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    link.style.cssText = "margin-right:10px;color:#2b20bb;text-decoration:none;font-size:14px;";
    return link;
  }

  function capitalizeName(name) {
    if (!name || typeof name !== "string") return name || "";
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function createAuthorCardFromDataset(dataset) {
    const card = document.createElement("div");
    card.className = "seojog-author-card";
    card.style.cssText = cardStyles;

    const capitalizedAuthorName = capitalizeName(dataset.authorName || "Author");

    if (dataset.authorImage) {
      const img = document.createElement("img");
      img.src = dataset.authorImage;
      img.alt = capitalizedAuthorName;
      img.style.cssText = "width:60px; height:60px; border-radius:50%; object-fit:cover;";
      card.appendChild(img);
    }

    const info = document.createElement("div");
    info.style.cssText = "display:flex; flex-direction:column;";
    info.appendChild(
      createTextElement("h4", capitalizedAuthorName, "margin:0 0 4px 0; color:#111213; font-size:16px;")
    );
    if (dataset.authorBio) {
      info.appendChild(
        createTextElement("p", dataset.authorBio, "margin:0; font-size:14px; color:#4a4f55;")
      );
    }

    const linksWrapper = document.createElement("div");
    linksWrapper.style.cssText = "margin-top:6px;";
    ["Linkedin", "Twitter", "Instagram"].forEach((network) => {
      const key = `author${network}`;
      const link = createLink(dataset[key], network);
      if (link) {
        linksWrapper.appendChild(link);
      }
    });

    if (linksWrapper.childNodes.length > 0) {
      info.appendChild(linksWrapper);
    }

    card.appendChild(info);
    return card;
  }

  function renderAuthors() {
    const placeholders = document.querySelectorAll(".bloggle-author");
    if (!placeholders.length) return;

    placeholders.forEach((placeholder) => {
      const dataset = placeholder.dataset;
      const card = createAuthorCardFromDataset(dataset);
      placeholder.replaceWith(card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAuthors);
  } else {
    renderAuthors();
  }
})();