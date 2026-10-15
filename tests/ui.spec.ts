import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import JSZip from 'jszip'
import { readFile } from 'node:fs/promises'

async function addProduct(page: Page, name: string, price: string) {
  await page.getByLabel('商品名', { exact: true }).fill(name)
  await page.getByLabel('価格').fill(price)
  await page.getByRole('button', { name: '商品を追加', exact: true }).click()
}

test('shared header, guide, empty state and not-found navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner').getByRole('link', { name: '会計くん ホーム' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '準備は、かんたん3ステップ。' })).toBeVisible()
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true })
  await page.getByRole('link', { name: '会計用シートを作る' }).click()
  await expect(page).toHaveURL(/\/create$/)
  await expect(page.getByRole('button', { name: '会計用シートを作成' })).toBeDisabled()
  const positions = await page.locator('.create-controls, .product-panel').evaluateAll((elements) => elements.map((e) => e.getBoundingClientRect().x))
  expect(positions[1]).toBeGreaterThan(positions[0])
  await page.goto('/unknown-page')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await page.getByRole('banner').getByRole('link', { name: 'ホームへ' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/download')
  await expect(page.getByRole('heading', { name: 'まずは商品を登録しましょう。' })).toBeVisible()
})

test('add, edit, delete, keep drafts and block unregistered inputs', async ({ page }) => {
  await page.goto('/create')
  await addProduct(page, 'コーヒー', '300')
  await addProduct(page, 'ワッフル', '400')
  await page.getByRole('button', { name: 'コーヒーを編集' }).click()
  await page.getByLabel('価格').fill('350')
  await page.getByRole('button', { name: '変更を保存' }).click()
  await expect(page.locator('.product-list')).toContainText('350')
  await page.getByRole('button', { name: 'ワッフルを削除' }).click()
  await page.getByLabel('商品名', { exact: true }).fill('追加途中')
  await page.getByRole('button', { name: '会計用シートを作成' }).click()
  await expect(page.getByRole('alert')).toContainText('入力中の商品があります')
  await expect(page).toHaveURL(/\/create$/)
  await page.getByRole('banner').getByRole('link', { name: 'ホームへ' }).click()
  await page.getByRole('link', { name: '商品登録を続ける' }).click()
  await expect(page.getByLabel('商品名', { exact: true })).toHaveValue('追加途中')
  await page.reload()
  await expect(page.getByLabel('商品名', { exact: true })).toHaveValue('追加途中')
  await expect(page.locator('.product-list')).toContainText('コーヒー')
  await page.getByRole('button', { name: '入力を取り消す' }).click()
  await expect(page.getByLabel('商品名', { exact: true })).toHaveValue('')
})

test('validate blank names, fractional and negative prices; allow zero', async ({ page }) => {
  await page.goto('/create')
  await addProduct(page, '   ', '300')
  await expect(page.getByRole('alert')).toContainText('0以上の整数')
  for (const price of ['-1', '1.5']) {
    await addProduct(page, '商品', price)
    await expect(page.locator('.product-list li')).toHaveCount(0)
  }
  await addProduct(page, '試食', '0')
  await expect(page.locator('.product-list')).toContainText('試食')
  await expect(page.locator('.product-list')).toContainText('0円')
})

test('generate once under StrictMode, download, release URL and refresh nested route', async ({ page }) => {
  let requests = 0
  await page.route('**/template.xlsm', async (route) => {
    requests++
    await new Promise((resolve) => setTimeout(resolve, 250))
    await route.continue()
  })
  await page.addInitScript(() => {
    const original = URL.revokeObjectURL.bind(URL)
    Object.assign(window, { revokedUrls: [] as string[] })
    URL.revokeObjectURL = (url) => {
      ;(window as unknown as { revokedUrls: string[] }).revokedUrls.push(url)
      original(url)
    }
  })
  await page.goto('/create')
  await addProduct(page, 'コーヒー & ワッフル <セット>', '700')
  await page.getByRole('button', { name: '会計用シートを作成' }).click()
  await expect(page).toHaveURL(/\/download$/)
  await expect(page.getByRole('heading', { name: '会計用シートを作成しています' })).toBeVisible()
  const link = page.getByRole('link', { name: 'Excelをダウンロード' })
  await expect(link).toBeVisible()
  expect(requests).toBe(1)
  await page.screenshot({ path: 'test-results/download-desktop.png', fullPage: true })
  const downloadPromise = page.waitForEvent('download')
  await link.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('会計くん.xlsm')
  const path = await download.path()
  expect(path).not.toBeNull()
  const zip = await JSZip.loadAsync(await readFile(path!))
  const template = await JSZip.loadAsync(await readFile('public/template.xlsm'))
  expect(await zip.file('xl/vbaProject.bin')!.async('uint8array')).toEqual(await template.file('xl/vbaProject.bin')!.async('uint8array'))
  const sheetXml = await zip.file('xl/worksheets/sheet1.xml')!.async('string')
  expect(sheetXml).toContain('700')
  expect(sheetXml).toContain('&amp;')
  await page.getByRole('link', { name: '商品設定に戻る' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { revokedUrls: string[] }).revokedUrls.length)).toBe(1)
  await page.getByRole('button', { name: '会計用シートを作成' }).click()
  await expect(link).toBeVisible()
  expect(requests).toBe(1)
  await page.reload()
  await expect(page.getByRole('link', { name: 'Excelをダウンロード' })).toBeVisible()
  expect(requests).toBe(2)
  await page.getByRole('link', { name: '商品設定に戻る' }).click()
  await page.getByRole('button', { name: 'コーヒー & ワッフル <セット>を編集' }).click()
  await page.getByLabel('価格').fill('750')
  await page.getByRole('button', { name: '変更を保存' }).click()
  await page.getByRole('button', { name: '会計用シートを作成' }).click()
  await expect(link).toBeVisible()
  expect(requests).toBe(3)
})

test('failure can be retried without losing products', async ({ page }) => {
  let requests = 0
  await page.route('**/template.xlsm', async (route) => {
    requests++
    if (requests === 1) await route.fulfill({ status: 503, body: 'Unavailable' })
    else await route.continue()
  })
  await page.goto('/create')
  await addProduct(page, 'コーヒー', '300')
  await page.getByRole('button', { name: '会計用シートを作成' }).click()
  await expect(page.getByRole('alert')).toContainText('503')
  expect(requests).toBe(1)
  await page.getByRole('button', { name: '再試行' }).click()
  await expect(page.getByRole('link', { name: 'Excelをダウンロード' })).toBeVisible()
  expect(requests).toBe(2)
})

test('bad storage and unavailable storage do not crash the app', async ({ browser }) => {
  const context = await browser.newContext()
  await context.addInitScript(() => sessionStorage.setItem('kaikeiqun.project.v1', JSON.stringify({ version: 1, items: [{ id: 'bad', name: '不正', price: -1 }], draft: {} })))
  const page = await context.newPage()
  await page.goto('/download')
  await expect(page.getByRole('alert')).toContainText('復元できませんでした')
  await expect(page.getByRole('heading', { name: 'まずは商品を登録しましょう。' })).toBeVisible()
  await context.close()
  const blocked = await browser.newContext()
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError') }
  })
  const blockedPage = await blocked.newPage()
  await blockedPage.goto('/create')
  await addProduct(blockedPage, 'コーヒー', '300')
  await expect(blockedPage.getByRole('alert')).toContainText('入力内容を保存できません')
  await expect(blockedPage.locator('.product-list')).toContainText('コーヒー')
  await blocked.close()
})

test('mobile stacks the form and list without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/create')
  await addProduct(page, 'とても長い商品名'.repeat(8), '123456')
  const layout = await page.locator('.create-controls, .product-panel').evaluateAll((elements) => elements.map((e) => {
    const box = e.getBoundingClientRect(); return { x: box.x, y: box.y, bottom: box.bottom }
  }))
  expect(layout[1].x).toBe(layout[0].x)
  expect(layout[1].y).toBeGreaterThan(layout[0].bottom)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/create-mobile.png', fullPage: true })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('reset requires explicit confirmation and clears the project', async ({ page }) => {
  await page.goto('/create')
  await addProduct(page, 'コーヒー', '300')
  await page.getByRole('banner').getByRole('link', { name: 'ホームへ' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '最初から作り直す' }).click()
  await page.getByRole('link', { name: '会計用シートを作る' }).click()
  await expect(page.getByRole('button', { name: '会計用シートを作成' })).toBeDisabled()
  await page.reload()
  await expect(page.locator('.product-list li')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/create-desktop.png', fullPage: true })
})
