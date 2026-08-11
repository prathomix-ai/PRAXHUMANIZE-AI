declare module "html-to-docx" {
  export default function HTMLtoDOCX(
    html: string,
    headerHTML?: string | null,
    options?: Record<string, any>,
    footerHTML?: string | null
  ): Promise<Buffer | Blob | ArrayBuffer>;
}
