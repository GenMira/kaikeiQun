import JSZip from 'jszip'

export async function loadTemplate(): Promise<JSZip> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}template.xlsm`,
  )

  if (!response.ok) {
    throw new Error(`テンプレートの取得に失敗しました: ${response.status}`)
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer())

  if (!zip.file('xl/vbaProject.bin')) {
    throw new Error('テンプレートにVBAが含まれていません')
  }

  return zip
}