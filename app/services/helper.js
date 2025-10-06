export const getHighlightedSnippet = (text, query, contextLength = 50) => {
  
  
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapeRegex(query), 'gi');
  const match = regex.exec(text);

  
  if (!match) {
    // If no match found, return first part of text
    return text.substring(0, contextLength * 2) + '...';
  }
  
  const matchIndex = match.index;
  const matchLength = match[0].length;
  
  // Calculate start and end positions for the snippet
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + matchLength + contextLength);
  
  // Extract snippet
  let snippet = text.substring(start, end);
  
  // Add ellipsis
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  
  // Highlight the match
  snippet = snippet.replace(regex, (match) => `<span class='bg-yellow-200 text-black'>${match}</span>`);
  
  return prefix + snippet + suffix;
};