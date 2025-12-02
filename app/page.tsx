import Link from 'next/link'

async function getHealth() {
  const base =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  try {
    const res = await fetch(`${base}/api/ocr/health`, { cache: 'no-store' })
    if (!res.ok) return { status: 'unavailable', detail: `HTTP ${res.status}` }
    return await res.json()
  } catch (e) {
    return { status: 'unavailable', detail: (e as Error).message }
  }
}

export default async function Home() {
  const health = await getHealth()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-gray-500">健康診断OCR API</p>
          <h1 className="text-3xl font-bold">API Routes デプロイ</h1>
          <p className="text-gray-600">
            このエンドポイント群はサーバーレスAPIとして提供されています。フロントUIは含まれないため、
            下記のヘルスチェックやcurl例で動作を確認してください。
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">ヘルスチェック</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <code className="bg-gray-100 px-2 py-1 rounded">GET /api/ocr/health</code>
            </p>
            <p>現在のステータス: <span className="font-semibold">{health?.status ?? 'unknown'}</span></p>
            {health?.services?.openai && (
              <p>OpenAI: <span className="font-semibold">{health.services.openai}</span></p>
            )}
            {health?.mock && <p>Mockモード: {health.mock}</p>}
            {health?.detail && <p className="text-red-600">detail: {health.detail}</p>}
            <Link
              className="inline-block mt-2 text-blue-600 hover:underline"
              href="/api/ocr/health"
            >
              ブラウザで開く
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">OCR API</h2>
          <p className="text-sm text-gray-700">
            マルチパートフォームで画像を送信してください（フィールド名: <code>images</code>、最大10枚、各10MB）。
          </p>
          <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto">
{`curl -X POST https://${process.env.VERCEL_URL ?? 'localhost:3000'}/api/ocr \\
  -F "images=@/path/to/health-report.jpg"`}
          </pre>
        </section>

        <footer className="text-sm text-gray-500">
          エラーになる場合は環境変数（OPENAI_API_KEY / MOCK_OCR / OCR_TIMEOUT_MS）を確認してください。
        </footer>
      </div>
    </main>
  )
}
