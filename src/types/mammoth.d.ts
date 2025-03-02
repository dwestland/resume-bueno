declare module 'mammoth' {
  interface MammothOptions {
    arrayBuffer?: ArrayBuffer
    buffer?: Buffer
    path?: string
    file?: {
      read: (filename: string) => Promise<Buffer> | Buffer
      exists: (filename: string) => Promise<boolean> | boolean
    }
  }

  interface MammothResult {
    value: string
    messages: Array<{
      type: string
      message: string
      [key: string]: unknown
    }>
  }

  function extractRawText(options: MammothOptions): Promise<MammothResult>
  function convertToHtml(options: MammothOptions): Promise<MammothResult>

  export { extractRawText, convertToHtml }
}
