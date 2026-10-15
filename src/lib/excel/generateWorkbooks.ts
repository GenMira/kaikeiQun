import type { item } from '../../components/interface'
import { loadTemplate } from './template'
import { getWorksheetPath } from './workbookXml'
import { writeProductRows } from './worksheetXml'
import { readXml, writeXml } from './xml'

export async function generateWorkbook(
  items: readonly item[],
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('商品を1件以上登録してください')
  }

  for (const product of items) {
    if (
      !product.name.trim() ||
      !Number.isSafeInteger(product.price) ||
      product.price < 0
    ) {
      throw new Error('商品名または価格が不正です')
    }
  }

  const zip = await loadTemplate()

  const accountingPath = await getWorksheetPath(zip, '会計')
  const accountingXml = await readXml(zip, accountingPath)

  writeProductRows(accountingXml, items)
  writeXml(zip, accountingPath, accountingXml)

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  })
}