import { useState } from 'react'
import '../components/Create.css'
import type { item } from '../components/interface'
import { generateWorkbook } from '../lib/excel/generateWorkbooks';

function CreateNewProject() {
  const [items,setItems] = useState<item[]>([]);
  const [itemName,setItemName] = useState<string>("");
  const [itemPrice,setItemPrice] = useState<number>(0);

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
  setIsGenerating(true)
  setError('')

  try {
    const blob = await generateWorkbook(items)
    downloadBlob(blob, '会計くん.xlsm')
  } catch (cause) {
    setError(
      cause instanceof Error ? cause.message : '生成に失敗しました',
    )
  } finally {
    setIsGenerating(false)
  }
}


  return(
    <main className="center create-page">
      <h1>会計くん</h1>
      <form className="input-box" onSubmit={(event) => {
        event.preventDefault()
        const name = itemName.trim()
        if (!name || !Number.isSafeInteger(itemPrice) || itemPrice < 0) return
        const newItem: item = { name, price: itemPrice }
        setItems((previousItems) => [...previousItems, newItem])
        setItemName('')
        setItemPrice(0)
      }}>
        <label htmlFor="item-name">商品名</label>
        <input
          id="item-name"
          type='text'
          required
          placeholder='登録する商品名を入力...'
          value = {itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <label htmlFor="item-price">価格（円）</label>
        <input
          id="item-price"
          type='number'
          required
          min={0}
          max={Number.MAX_SAFE_INTEGER}
          step={1}
          placeholder='価格を入力...'
          value = {itemPrice}
          onChange={(e) => setItemPrice(Number(e.target.value))}
        />
        <button type="submit">商品を追加</button>
      </form>
      <section className="item-list" aria-label="登録済みの商品">
        <h2>登録済みの商品</h2>
        {items.length === 0 ? <p>商品はまだ登録されていません。</p> : (
          <ul>
            {items.map((registeredItem, index) => (
              <li key={index}>
                <span>{registeredItem.name}</span>
                <span>{registeredItem.price.toLocaleString('ja-JP')}円</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default CreateNewProject
