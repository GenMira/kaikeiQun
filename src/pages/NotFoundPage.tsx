import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main id="center">
      <h1>404</h1>
      <p>ページが見つかりませんでした。</p>
      <Link to="/">ホームに戻る</Link>
    </main>
  )
}

export default NotFoundPage
