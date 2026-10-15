import { Link } from 'react-router'
import { useProject } from '../state/project'

export default function HomePage() {
  const { project, dispatch } = useProject()
  const hasProject = project.items.length > 0 || Boolean(project.draft.name || project.draft.price)
  return (
    <main id="main-content" className="home-page">
      <section className="home-hero">
        <div>
          <p className="eyebrow">文化祭・模擬店の会計を、もっと手軽に。</p>
          <h1>お店の準備に、<br />会計くん。</h1>
          <p className="hero-description">メニューを登録するだけで、会計用のExcelができあがります。<br className="desktop-break" />当日はネットにつながなくても、いつものExcelで。</p>
          <Link className="button button-primary" to="/create">{hasProject ? '商品登録を続ける' : '会計用シートを作る'} <span aria-hidden="true">→</span></Link>
          <p className="hero-caption">Windowsのデスクトップ版Excelに対応</p>
          {hasProject && <button className="text-button" type="button" onClick={() => {
            if (window.confirm('登録した商品と入力中の内容を消して、新しく作り直しますか？')) dispatch({ type: 'reset' })
          }}>最初から作り直す</button>}
        </div>
        <div className="menu-preview" aria-label="会計用シートのイメージ">
          <div className="preview-header"><span>会計くん</span><span className="preview-tag">会計シート</span></div>
          <div className="preview-labels"><span>品目</span><span>単価</span><span>個数</span></div>
          {[['コーヒー', '300', '2'], ['ワッフル', '400', '1'], ['オレンジジュース', '200', '0']].map(([name, price, quantity]) => (
            <div className="preview-row" key={name}><span>{name}</span><span>¥{price}</span><span className="preview-quantity">{quantity}</span></div>
          ))}
          <div className="preview-total"><span>合計</span><strong>¥1,200</strong></div>
        </div>
      </section>
      <section className="how-to" aria-labelledby="how-to-title">
        <p className="eyebrow">使い方</p><h2 id="how-to-title">準備は、かんたん3ステップ。</h2>
        <ol className="how-to-grid">
          <li><span className="step-number">01</span><h3>商品を登録</h3><p>商品名と価格を入力します。追加した商品は一覧で確認・編集できます。</p></li>
          <li><span className="step-number">02</span><h3>Excelをダウンロード</h3><p>お店に合わせたマクロ付きの会計用ファイルを作成して保存します。</p></li>
          <li><span className="step-number">03</span><h3>Excelで会計</h3><p>事前にマクロとボタンの動作を確認。当日は通信なしで会計できます。</p></li>
        </ol>
      </section>
      <aside className="notice">ご利用前に：デスクトップ版Excelでマクロを有効にして使用します。文化祭の前に、実際の端末で動作を確認してください。</aside>
    </main>
  )
}

