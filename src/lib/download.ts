export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)

  try {
    link.click()
  } finally {
    link.remove()
    // Keep the URL alive until the browser has started reading the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
