import { extractText } from 'unpdf';
import pdfParse from 'pdf-parse';
import zlib from 'zlib';
import { normalizeText } from '../../utils/textNormalizer.js';

/**
 * Direct stream-level text extractor that parses PDF content streams directly.
 * Bypasses XRef tables entirely - resilient to corrupt or malformed XRef entries.
 *
 * @param {Buffer} buffer
 * @returns {string}
 */
const extractRawPdfStreamText = (buffer) => {
  let fullText = '';
  const rawString = buffer.toString('latin1');

  // Match all PDF streams: stream ... endstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamData = Buffer.from(match[1], 'latin1');
    let decompressed = null;

    try {
      decompressed = zlib.inflateSync(streamData);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(streamData);
      } catch {
        decompressed = streamData;
      }
    }

    if (decompressed) {
      const content = decompressed.toString('latin1');
      // Extract text inside parentheses from Tj or ' or " operators
      const tjMatches = content.match(/\(([^)]+)\)\s*(?:Tj|'|")/g);
      if (tjMatches) {
        tjMatches.forEach((m) => {
          const text = m.replace(/\)\s*(?:Tj|'|")$/, '').replace(/^\(/, '').trim();
          if (text) fullText += text + ' ';
        });
        fullText += '\n';
      }

      // Extract array strings from TJ operator: [(Hello) 10 (World)] TJ
      const arrayTjMatches = content.match(/\[([\s\S]*?)\]\s*TJ/g);
      if (arrayTjMatches) {
        arrayTjMatches.forEach((m) => {
          const innerStrings = m.match(/\(([^)]*)\)/g);
          if (innerStrings) {
            const joined = innerStrings
              .map((s) => s.slice(1, -1))
              .join('')
              .trim();
            if (joined) fullText += joined + ' ';
          }
        });
        fullText += '\n';
      }
    }
  }

  if (fullText.trim().length >= 25) {
    return fullText;
  }

  // Printable ASCII fallback for uncompressed blocks
  const printableBlocks = rawString.match(/[\x20-\x7E\s]{15,}/g);
  if (printableBlocks && printableBlocks.length > 0) {
    return printableBlocks
      .filter((b) => !b.includes('/Filter') && !b.includes('/Length') && !b.includes('endobj') && !b.includes('xref'))
      .join('\n');
  }

  return '';
};

/**
 * Multi-strategy robust PDF parser.
 * Handles modern PDF versions (1.7/2.0), complex XRef streams, incremental updates,
 * and recovers gracefully without crashing on "bad XRef entry".
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, rawText: string, normalizedText: string, numPages: number }>}
 */
export const parsePdf = async (buffer) => {
  let extractedText = '';
  let numPages = 1;

  // Tier 1: Modern unpdf engine (uses modern pdf.js v4+ with automatic XRef repair)
  try {
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const unpdfResult = await extractText(uint8Array);

    if (unpdfResult && unpdfResult.text) {
      const joined = Array.isArray(unpdfResult.text)
        ? unpdfResult.text.join('\n\n')
        : String(unpdfResult.text);

      if (joined.trim().length >= 15) {
        extractedText = joined;
        numPages = unpdfResult.totalPages || 1;
      }
    }
  } catch (errTier1) {
    console.warn(`[PDF Parser] Tier 1 (unpdf) warning: "${errTier1.message}". Trying fallback tiers...`);
  }

  // Tier 2: pdf-parse fallback (for legacy document formats)
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length >= 15) {
        extractedText = data.text;
        numPages = data.numpages || 1;
      }
    } catch (errTier2) {
      console.warn(`[PDF Parser] Tier 2 (pdf-parse) warning: "${errTier2.message}". Trying direct stream extraction...`);
    }
  }

  // Tier 3: Direct stream decompression & operator extraction (completely ignores XRef table)
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const streamText = extractRawPdfStreamText(buffer);
      if (streamText && streamText.trim().length >= 15) {
        extractedText = streamText;
      }
    } catch (errTier3) {
      console.warn(`[PDF Parser] Tier 3 (stream decoding) warning: "${errTier3.message}".`);
    }
  }

  const normalized = normalizeText(extractedText);

  if (!normalized || normalized.length < 10) {
    throw new Error(
      'Could not extract readable text from this PDF. The document may be an image-only scanned file or password protected.'
    );
  }

  return {
    text: normalized,
    rawText: extractedText,
    normalizedText: normalized,
    numPages,
  };
};

export default parsePdf;
