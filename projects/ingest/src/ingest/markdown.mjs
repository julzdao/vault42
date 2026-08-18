
import { removeSquareBrackets, parseCoverProperty } from "./parser.mjs";
import { isExternalHref, resolveNoteSlug, makeNoteHref } from "./links.mjs";

export function sanitizeSegment(input) {
  return input.replace(/[^a-zA-Z0-9 ._-]/g, "").trim();
}

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdownToHtml(input, fromRelativePath) {
  return input
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const trimmedHref = href.trim();
      if (!trimmedHref || trimmedHref.startsWith("#")) {
        return `<a href="${trimmedHref}" class="underline">${label}</a>`;
      }
      if (isExternalHref(trimmedHref)) {
        return `<a href="${trimmedHref}" class="underline">${label}</a>`;
      }

      const targetSlug = resolveNoteSlug(trimmedHref, fromRelativePath);
      if (!targetSlug) {
        return `<a href="${trimmedHref}" class="underline">${label}</a>`;
      }

      return `<a href="${makeNoteHref(targetSlug)}" class="underline decoration-2 underline-offset-2">${label}</a>`;
    })
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_m, p1, _p2, p3) => {
      const label = p3 || p1;
      const targetSlug = resolveNoteSlug(p1, fromRelativePath);
      if (!targetSlug) {
        return `<span class="rounded bg-[var(--muted)] px-1">${label}</span>`;
      }
      return `<a href="${makeNoteHref(targetSlug)}" class="rounded bg-[var(--muted)] px-1 underline decoration-2 underline-offset-2">${label}</a>`;
    });
}

function renderQuoteLines(lines, fromRelativePath) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      continue;
    }
    current.push(line.trim());
  }

  if (current.length) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs
    .map((text) => `<p>${inlineMarkdownToHtml(escapeHtml(text), fromRelativePath)}</p>`)
    .join("");
}

function renderQuoteBlock(rawLines, fromRelativePath) {
  const lines = rawLines.map((line) => line.replace(/^\s*>\s?/, ""));
  const firstLine = lines[0]?.trim() || "";
  const calloutMatch = firstLine.match(/^\[!([a-z0-9_-]+)([+-])?\]\s*(.*)$/i);

  if (!calloutMatch) {
    return `<blockquote class="dg-quote">${renderQuoteLines(lines, fromRelativePath)}</blockquote>`;
  }

  const calloutType = calloutMatch[1].toLowerCase();
  const calloutTitle = calloutMatch[3]?.trim() || calloutType[0].toUpperCase() + calloutType.slice(1);
  const contentLines = [...lines];
  contentLines[0] = "";

  return `<aside class="dg-callout dg-callout-${calloutType}">
    <p class="dg-callout-title">${inlineMarkdownToHtml(escapeHtml(calloutTitle), fromRelativePath)}</p>
    <div class="dg-callout-content">${renderQuoteLines(contentLines, fromRelativePath)}</div>
  </aside>`;
}

function renderCodeBlock(lines, language) {
  const lang = (language || "").toLowerCase();
  const escapedCode = escapeHtml(lines.join("\n"));
  const langClass = lang ? ` class="language-${lang}"` : "";
  const langAttr = lang ? ` data-language="${escapeHtml(lang)}"` : "";
  return `<pre class="dg-code-block"${langAttr}><code${langClass}>${escapedCode}</code></pre>`;
}

export function markdownToHtml(markdown, fromRelativePath) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inList = false;
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockLines = [];
  
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        html.push(renderCodeBlock(codeBlockLines, codeBlockLanguage));
        inCodeBlock = false;
        codeBlockLanguage = "";
        codeBlockLines = [];
        continue;
      }

      codeBlockLines.push(line);
      continue;
    }

    if (trimmed.startsWith("```")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      inCodeBlock = true;
      codeBlockLanguage = trimmed.slice(3).trim();
      codeBlockLines = [];
      continue;
    }

    if (!trimmed) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      } else {
        html.push('<div class="dg-paragraph-break" aria-hidden="true"></div>');
      }
      continue;
    }

    if (trimmed === "---") {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push('<hr class="dg-divider" />');
      continue;
    }

    if (trimmed.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(4)), fromRelativePath)}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(3)), fromRelativePath)}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h1>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(2)), fromRelativePath)}</h1>`);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdownToHtml(escapeHtml(trimmed.slice(2)), fromRelativePath)}</li>`);
      continue;
    }

    if(trimmed.startsWith("![[")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      const imgLinkWithoutBrackets = removeSquareBrackets(trimmed.slice(1));
      const segments = fromRelativePath.split("/").map(sanitizeSegment).filter(Boolean);

      html.push(`<img class="note-attachment" src="${parseCoverProperty(imgLinkWithoutBrackets, segments)}">`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }

      const quoteLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        quoteLines.push(lines[j]);
        j += 1;
      }

      html.push(renderQuoteBlock(quoteLines, fromRelativePath));
      i = j - 1;
      continue;
    }

    html.push(`<p>${inlineMarkdownToHtml(escapeHtml(trimmed), fromRelativePath)}</p>`);
  }

  if (inList) {
    html.push("</ul>");
  }

  if (inCodeBlock) {
    html.push(renderCodeBlock(codeBlockLines, codeBlockLanguage));
  }

  return html.join("\n");
}