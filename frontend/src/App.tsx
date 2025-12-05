import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { CameraPage } from './pages/CameraPage'
import { ConfirmEditPage } from './pages/ConfirmEditPage'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* カメラページは全画面表示のため、ヘッダー・フッターなし */}
        <Route path="/camera" element={<CameraPage />} />

        {/* 確認・編集ページ */}
        <Route path="/confirm-edit" element={<ConfirmEditPage />} />

        {/* その他のページはレイアウト付き */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold text-gray-900">健康診断結果OCR</h1>
                </div>
              </header>

              <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/edit" element={<EditPage />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

// ホームページ
function HomePage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        健康診断結果のデジタル化
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        カメラで撮影して、自動的にExcelファイルに変換します
      </p>
      <div className="flex flex-col gap-4 items-center">
        <Link
          to="/camera"
          className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg"
        >
          撮影を開始
        </Link>
        <Link
          to="/confirm-edit"
          className="inline-block bg-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors shadow-lg"
        >
          画像をアップロード
        </Link>
      </div>
    </div>
  )
}

// 確認・編集ページ（仮実装）
function EditPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900">確認・編集画面</h2>
      <p className="text-gray-600 mt-4">実装予定</p>
    </div>
  )
}

export default App
