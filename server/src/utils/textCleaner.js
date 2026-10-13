import {
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
} from './textNormalizer.js';

/**
 * Backward-compatible wrapper for cleanExtractedText using the new high-fidelity normalizer.
 */
export const cleanExtractedText = (rawText) => {
  return normalizeText(rawText);
};

export {
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
};

export default {
  cleanExtractedText,
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
};
