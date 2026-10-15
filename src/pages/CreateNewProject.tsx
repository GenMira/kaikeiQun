import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import '../components/Create.css'
import { useProject } from '../state/project'

export default function CreateNewProject() {
  const { project: { items, draft }, dispatch } = useProject()
  const [inputError, setInputError] = useState('')
  const [createError, setCreateError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const nameInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const hasDraft = Boolean(draft.name || draft.price || draft.editingId)

  function createSheet() {
    if (!items.length) return
    if (hasDraft) {
      setCreateError('入力中の商品があります。「商品を追加」または「変更を保存」を押すか、入力を取り消してください。')
      nameInput.current?.focus()
      return
    }
    navigate('/download')
  }

  return (
    <main id="main-content" className="create-page">
      <div className="page-heading">
        <p className="eyebrow">商品を登録</p>
        <h1>お店のメニューを用意しましょう。</h1>
        <p>商品名と価格を追加するだけ。右側の一覧を確認して、会計用シートを作成できます。</p>
      </div>
      <div className="create-grid">
        <div className="create-controls">
          <section className="panel" aria-labelledby="product-form-title">
            <h2 id="product-form-title">{draft.editingId ? '商品を編集' : '商品を追加'}</h2>
            <form className="input-box" onSubmit={(event) => {
              event.preventDefault()
              const name = draft.name.trim()
              const price = Number(draft.price)
              if (!name || !draft.price.trim() || !Number.isSafeInteger(price) || price < 0) {
                setInputError('商品名と、0以上の整数の価格を入力してください。')
                return
              }
              dispatch({ type: 'save', product: { id: draft.editingId ?? crypto.randomUUID(), name, price } })
              setInputError('')
              setCreateError('')
              setAnnouncement(`${name}を${draft.editingId ? '更新' : '追加'}しました。`)
              nameInput.current?.focus()
            }}>
              <label htmlFor="item-name">商品名</label>
              <input id="item-name" ref={nameInput} type="text" required
                placeholder="例：コーヒー" value={draft.name}
                onChange={(event) => dispatch({ type: 'draft', field: 'name', value: event.target.value })} />
              <label htmlFor="item-price">価格 <span className="muted">（税込・円）</span></label>
              <input id="item-price" type="number" required min={0} max={Number.MAX_SAFE_INTEGER} step={1}
                placeholder="例：300" value={draft.price}
                onChange={(event) => dispatch({ type: 'draft', field: 'price', value: event.target.value })} />
              <p className="field-hint">価格は0以上の整数で入力してください。</p>
              {inputError && <p className="form-error" role="alert">{inputError}</p>}
              <button className="button button-primary" type="submit">
                {draft.editingId ? '変更を保存' : '商品を追加'}
              </button>
              {hasDraft && <button className="button button-quiet" type="button" onClick={() => {
                dispatch({ type: 'cancel' }); setInputError(''); setCreateError('')
              }}>入力を取り消す</button>}
            </form>
          </section>
          <section className="create-action" aria-label="会計用シートの作成">
            <p>すべての商品を登録したら、次へ進みます。</p>
            <button className="button button-primary button-wide" type="button"
              disabled={!items.length} onClick={createSheet}>会計用シートを作成 <span aria-hidden="true">→</span></button>
            {!items.length && <p className="field-hint">商品を1件以上追加すると作成できます。</p>}
            {createError && <p className="form-error" role="alert">{createError}</p>}
          </section>
        </div>
        <section className="panel product-panel" aria-labelledby="product-list-title">
          <div className="panel-heading">
            <h2 id="product-list-title">登録済みの商品</h2><span className="count-badge">{items.length}件</span>
          </div>
          {!items.length ? (
            <div className="empty-state"><span className="empty-symbol" aria-hidden="true">＋</span>
              <h3>まだ商品がありません</h3><p>フォームから商品を追加すると、<br />ここにメニューが並びます。</p></div>
          ) : (
            <ul className="product-list">
              {items.map((product) => (
                <li key={product.id}>
                  <div className="product-info"><span className="product-name">{product.name}</span>
                    <span className="product-price">{product.price.toLocaleString('ja-JP')}<small>円</small></span></div>
                  <div className="product-actions">
                    <button className="button button-small" type="button" aria-label={`${product.name}を編集`} onClick={() => {
                      dispatch({ type: 'edit', id: product.id }); setInputError(''); setCreateError(''); nameInput.current?.focus()
                    }}>編集</button>
                    <button className="button button-small button-danger" type="button" aria-label={`${product.name}を削除`} onClick={() => {
                      dispatch({ type: 'delete', id: product.id }); setCreateError(''); setAnnouncement(`${product.name}を削除しました。`)
                    }}>削除</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="field-hint list-note">登録内容はこのタブ内で保存されます。戻ったり再読み込みしても続きから編集できます。</p>
        </section>
      </div>
      <p className="sr-only" role="status">{announcement}</p>
    </main>
  )
}
