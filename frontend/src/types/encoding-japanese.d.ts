<<<<<<< HEAD
declare module 'encoding-japanese' {
  const Encoding: {
    stringToCode(input: string): number[]
    convert(
      source: number[] | Uint8Array,
      options: { to: string; from?: string }
    ): number[]
  } & Record<string, unknown>

  export default Encoding
}
=======
declare module 'encoding-japanese'
>>>>>>> 649b950 (2025-12-02  Fix TS build errors for OCR UI and CSV export)
