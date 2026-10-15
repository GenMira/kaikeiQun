import { Link, Outlet, useLocation } from 'react-router'
import { useProject } from '../state/project'

export default function Layout() {
  const { pathname } = useLocation()
  const { storageWarning } = useProject()
  const steps = ['商品を登録', 'Excelを作成', '会計をはじめる']
  return (
    <>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="会計くん ホーム">
            <span className="brand-mark" aria-hidden="true">会</span>会計くん
          </Link>
          <Link className="button button-quiet" to="/" aria-current={pathname === '/' ? 'page' : undefined}>ホームへ</Link>
        </div>
      </header>
      <div className="page-shell">
        {(pathname === '/create' || pathname === '/download') && (
          <ol className="progress-steps" aria-label="作成の手順">
            {steps.map((step, index) => (
              <li key={step} aria-current={(pathname === '/create' ? index === 0 : index === 1) ? 'step' : undefined}>
                <span aria-hidden="true">{index + 1}</span>{step}
              </li>
            ))}
          </ol>
        )}
        {storageWarning && <p className="notice" role="alert">{storageWarning}</p>}
        <Outlet />
      </div>
      <footer className="site-footer">模擬店の準備も、当日の会計も。</footer>
    </>
  )
}
