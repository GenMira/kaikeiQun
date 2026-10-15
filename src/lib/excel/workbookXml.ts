import type JSZip from 'jszip'
import { readXml } from './xml'

const SHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const DOCUMENT_REL_NS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const PACKAGE_REL_NS =
  'http://schemas.openxmlformats.org/package/2006/relationships'

export async function getWorksheetPath(
  zip: JSZip,
  sheetName: string,
): Promise<string> {
  const workbook = await readXml(zip, 'xl/workbook.xml')
  const sheet = Array.from(workbook.getElementsByTagNameNS(SHEET_NS, 'sheet'))
    .find((element) => element.getAttribute('name') === sheetName)

  if (!sheet) {
    throw new Error(`シートが見つかりません: ${sheetName}`)
  }

  const relationshipId = sheet.getAttributeNS(DOCUMENT_REL_NS, 'id')
  if (!relationshipId) {
    throw new Error(`シートの参照IDがありません: ${sheetName}`)
  }

  const relationships = await readXml(zip, 'xl/_rels/workbook.xml.rels')
  const relationship = Array.from(
    relationships.getElementsByTagNameNS(PACKAGE_REL_NS, 'Relationship'),
  ).find((element) => element.getAttribute('Id') === relationshipId)

  if (!relationship) {
    throw new Error(`シートの参照先が見つかりません: ${relationshipId}`)
  }
  if (
    relationship.getAttribute('TargetMode') === 'External' ||
    relationship.getAttribute('Type') !== `${DOCUMENT_REL_NS}/worksheet`
  ) {
    throw new Error(`参照先が内部ワークシートではありません: ${sheetName}`)
  }

  const target = relationship.getAttribute('Target')
  if (!target) {
    throw new Error(`シートの参照先パスがありません: ${sheetName}`)
  }

  const base = new URL('https://excel.invalid/xl/workbook.xml')
  const resolved = new URL(target, base)
  if (resolved.origin !== base.origin || resolved.search || resolved.hash) {
    throw new Error(`シートの参照先パスが不正です: ${target}`)
  }
  const path = decodeURIComponent(resolved.pathname.slice(1))
  if (!zip.file(path)) {
    throw new Error(`Excel内にワークシートがありません: ${path}`)
  }

  return path
}
