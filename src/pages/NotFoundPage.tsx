import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main id="main-content" className="not-found-page panel">
      <h1>404</h1>
      <p>ページが見つかりませんでした。</p>
      <Link to="/">ホームに戻る</Link>
    </main>
  )
}

export default NotFoundPage
