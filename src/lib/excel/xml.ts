import type JSZip from 'jszip'

export async function readXml(
  zip: JSZip,
  path: string,
): Promise<XMLDocument> {
  const entry = zip.file(path)

  if (!entry) {
    throw new Error(`Excel内に必要な部品がありません: ${path}`)
  }

  const document = new DOMParser().parseFromString(
    await entry.async('string'),
    'application/xml',
  )

  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`XMLを読み込めません: ${path}`)
  }

  return document
}

export function writeXml(
  zip: JSZip,
  path: string,
  document: XMLDocument,
): void {
  zip.file(path, new XMLSerializer().serializeToString(document))
}