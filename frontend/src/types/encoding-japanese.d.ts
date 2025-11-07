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
