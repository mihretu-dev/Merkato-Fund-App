/**
 * Merkato Fund — ETB Currency Formatting
 *
 * Formats numbers for display as Ethiopian Birr (ETB).
 * All amounts in this application are in ETB unless explicitly stated otherwise.
 */

/**
 * Format a number as ETB currency string.
 *
 * @param amount - The amount in ETB (may be negative for debits)
 * @param options - Formatting options
 * @returns Formatted string, e.g. "ETB 1,000,000.00" or "50 ETB"
 *
 * @example
 * formatETB(1000000)           // "ETB 1,000,000.00"
 * formatETB(50, { compact: true }) // "50 ETB"
 * formatETB(-550)              // "-ETB 550.00"
 */
export function formatETB(
  amount: number,
  options: {
    /** If true, use "N ETB" suffix style instead of "ETB N" prefix style */
    compact?: boolean;
    /** Number of decimal places (default: 2) */
    decimals?: number;
    /** If true, show "+" prefix for positive amounts */
    showSign?: boolean;
  } = {}
): string {
  const { compact = false, decimals = 2, showSign = false } = options;

  if (!Number.isFinite(amount)) {
    return 'ETB —';
  }

  const sign = amount < 0 ? '-' : showSign && amount > 0 ? '+' : '';
  const absFormatted = formatNumber(Math.abs(amount), decimals);

  if (compact) {
    return `${sign}${absFormatted} ETB`;
  }

  return `${sign}ETB ${absFormatted}`;
}

/**
 * Format a number with thousands separators and fixed decimal places.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string, e.g. "1,000,000.00"
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const fixed = Math.abs(value).toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Add thousands separators
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart !== undefined
    ? `${withSeparators}.${decimalPart}`
    : withSeparators;
}

/**
 * Format a large ETB amount with abbreviated suffix for dashboard display.
 *
 * @param amount - The amount in ETB
 * @returns Abbreviated string, e.g. "1M ETB", "15K ETB"
 *
 * @example
 * formatETBCompact(1000000)  // "1M ETB"
 * formatETBCompact(15000)    // "15K ETB"
 * formatETBCompact(550)      // "550 ETB"
 */
export function formatETBCompact(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '— ETB';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const display = Number.isInteger(millions)
      ? millions.toString()
      : millions.toFixed(1);
    return `${sign}${display}M ETB`;
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const display = Number.isInteger(thousands)
      ? thousands.toString()
      : thousands.toFixed(1);
    return `${sign}${display}K ETB`;
  }

  return `${sign}${abs} ETB`;
}
