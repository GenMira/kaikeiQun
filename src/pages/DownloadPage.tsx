import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getWorkbookTask } from '../lib/excel/workbookTask'
import { useProject } from '../state/project'
import type { Product } from '../state/project'

type Result = { status: 'loading' } | { status: 'ready'; url: string } | { status: 'error'; message: string }

function FileGeneration({ items }: { items: Product[] }) {
  const [result, setResult] = useState<Result>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    void getWorkbookTask(items).then((blob) => {
      if (!active) return
      objectUrl = URL.createObjectURL(blob)
      setResult({ status: 'ready', url: objectUrl })
    }).catch((cause: unknown) => {
      if (active) setResult({ status: 'error', message: cause instanceof Error ? cause.message : 'ファイルの生成に失敗しました。' })
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [items, attempt])

  return (
    <>
      <section className="panel download-card" aria-busy={result.status === 'loading'}>
        {result.status === 'loading' && <>
          <span className="spinner" aria-hidden="true" />
          <h1>会計用シートを作成しています</h1>
          <p role="status">{items.length}件の商品をファイルに反映しています。少しお待ちください。</p>
        </>}
        {result.status === 'ready' && <>
          <span className="ready-mark" aria-hidden="true">✓</span>
          <p className="eyebrow" role="status">ファイルの準備ができました</p>
          <h1>会計の準備まで、あと少し。</h1>
          <p>{items.length}件の商品を登録したExcelファイルを保存できます。</p>
          <a className="button button-primary" href={result.url} download="会計くん.xlsm">Excelをダウンロード <span className="file-extension">.xlsm</span></a>
          <p className="field-hint">保存先はブラウザのダウンロード設定で確認できます。</p>
        </>}
        {result.status === 'error' && <>
          <h1>ファイルを作成できませんでした</h1>
          <p className="form-error" role="alert">{result.message}</p>
          <p>通信環境を確認して、もう一度お試しください。商品情報は保持されています。</p>
          <button className="button button-primary" type="button" onClick={() => {
            setResult({ status: 'loading' }); setAttempt((value) => value + 1)
          }}>再試行</button>
        </>}
        <Link className="text-link" to="/create">← 商品設定に戻る</Link>
      </section>
      <aside className="panel excel-guide" aria-labelledby="excel-guide-title">
        <h2 id="excel-guide-title">ダウンロードしたら</h2>
        <ol>
          <li>ファイルをWindowsのデスクトップ版Excelで開き、マクロを有効にします。</li>
          <li>Alt + F8で「CreateButtons」を選び、実行すると商品に合わせたボタンが配置されます。</li>
          <li>商品・価格と増減ボタンの動作を確認してから、会計に使用してください。</li>
        </ol>
        <p className="field-hint">当日の会計は通信なしで行えます。準備と動作確認は事前に済ませておきましょう。</p>
      </aside>
    </>
  )
}

export default function DownloadPage() {
  const { project: { items } } = useProject()
  return (
    <main id="main-content" className="download-page">
      {items.length ? <FileGeneration key={JSON.stringify(items)} items={items} /> : (
        <section className="panel download-card">
          <h1>まずは商品を登録しましょう。</h1>
          <p>会計用シートを作成するには、商品を1件以上登録してください。</p>
          <Link className="button button-primary" to="/create">商品を登録する</Link>
        </section>
      )}
    </main>
  )
}
