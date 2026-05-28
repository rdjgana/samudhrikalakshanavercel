/**
 * Use with type="text" + inputMode="decimal" instead of type="number"
 * so scroll/wheel does not change the value (browser quirk on number inputs).
 */
export function isValidPartialDecimal(value) {
  return value === '' || /^\d*\.?\d*$/.test(value)
}
