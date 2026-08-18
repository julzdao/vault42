


function cleanContextText(input) {
  return input
    .trim()
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*]\s+/, "")
    .replace(/^>\s?/, "")
    .replace(/^#{1,6}\s+/, "")
    .replace(/\s+/g, " ");
}

function clipAround(text, index, maxLen = 220) {
  if (text.length <= maxLen) {
    return text;
  }

  const half = Math.floor(maxLen / 2);
  const start = Math.max(0, index - half);
  const end = Math.min(text.length, start + maxLen);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function contextSnippet(markdown, startIndex) {
  if (!markdown) {
    return "";
  }

  const lineStart = markdown.lastIndexOf("\n", Math.max(0, startIndex - 1)) + 1;
  const rawLineEnd = markdown.indexOf("\n", startIndex);
  const lineEnd = rawLineEnd === -1 ? markdown.length : rawLineEnd;
  const line = markdown.slice(lineStart, lineEnd);
  const cleanedLine = cleanContextText(line);

  if (!cleanedLine) {
    return "";
  }

  const relativeIndex = Math.max(0, Math.min(cleanedLine.length - 1, startIndex - lineStart));

  const sentenceBoundary = /[.!?]/;
  let sentenceStart = 0;
  for (let i = relativeIndex; i >= 0; i -= 1) {
    if (sentenceBoundary.test(cleanedLine[i])) {
      sentenceStart = i + 1;
      break;
    }
  }

  let sentenceEnd = cleanedLine.length;
  for (let i = relativeIndex; i < cleanedLine.length; i += 1) {
    if (sentenceBoundary.test(cleanedLine[i])) {
      sentenceEnd = i + 1;
      break;
    }
  }

  const sentence = cleanContextText(cleanedLine.slice(sentenceStart, sentenceEnd));
  if (sentence.length >= 40 && sentence.length <= 260) {
    return sentence;
  }

  return clipAround(cleanedLine, relativeIndex, 220);
}

function sentenceStart(text, index) {
  for (let i = Math.max(0, index); i >= 0; i -= 1) {
    if (/[.!?\n]/.test(text[i])) {
      return i + 1;
    }
  }
  return 0;
}

function sentenceEnd(text, index) {
  for (let i = Math.max(0, index); i < text.length; i += 1) {
    if (/[.!?\n]/.test(text[i])) {
      return i + 1;
    }
  }
  return text.length;
}

function sentenceAt(text, index) {
  const start = sentenceStart(text, index);
  const end = sentenceEnd(text, index);
  return cleanContextText(text.slice(start, end));
}

export function expandedContext(markdown, startIndex) {
  if (!markdown) {
    return "";
  }

  const paragraphStartMarker = markdown.lastIndexOf("\n\n", Math.max(0, startIndex - 1));
  const paragraphStart = paragraphStartMarker === -1 ? 0 : paragraphStartMarker + 2;
  const paragraphEndMarker = markdown.indexOf("\n\n", startIndex);
  const paragraphEnd = paragraphEndMarker === -1 ? markdown.length : paragraphEndMarker;

  const rawParagraph = markdown.slice(paragraphStart, paragraphEnd);
  const paragraph = cleanContextText(rawParagraph);

  if (paragraph.length >= 80) {
    const paragraphRelativeIndex = Math.max(
      0,
      Math.min(paragraph.length - 1, startIndex - paragraphStart),
    );
    return clipAround(paragraph, paragraphRelativeIndex, 560);
  }

  const currentStart = sentenceStart(markdown, startIndex);
  const currentEnd = sentenceEnd(markdown, startIndex);

  const previousTwo = sentenceAt(markdown, sentenceStart(markdown, currentStart - 1));
  const previousOne = sentenceAt(markdown, currentStart - 1);
  const current = sentenceAt(markdown, startIndex);
  const nextOne = sentenceAt(markdown, currentEnd + 1);
  const nextTwo = sentenceAt(markdown, sentenceEnd(markdown, currentEnd + 1) + 1);

  const joined = [previousTwo, previousOne, current, nextOne, nextTwo].filter(Boolean).join(" ");
  return clipAround(cleanContextText(joined), Math.floor(joined.length / 2), 560);
}