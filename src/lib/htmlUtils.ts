/**
 * HTML escape utility functions for preventing XSS attacks
 * when using document.write() or similar methods
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param text - The text to escape
 * @returns The escaped text safe for HTML insertion
 */
export const escapeHtml = (text: string | null | undefined): string => {
  if (text == null) return '';
  
  const str = String(text);
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return str.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char);
};

/**
 * Escapes an array of strings for HTML insertion
 * @param lines - Array of text lines to escape
 * @returns Array of escaped strings
 */
export const escapeHtmlArray = (lines: string[] | null | undefined): string[] => {
  if (!lines || !Array.isArray(lines)) return [];
  return lines.map(line => escapeHtml(line));
};
