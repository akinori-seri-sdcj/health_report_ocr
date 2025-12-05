import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import {
  HealthReportData,
  validateHealthReportData,
} from '../../../shared/health-report.schema'

export const runtime = 'nodejs'

type UploadedFile = {
  buffer: Buffer
  mimetype: string
  size: number
  originalname: string
}

// Upload constraints: keep serverless-friendly to avoid timeouts and memory blowups
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 10
const TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS || 120_000) // configurable; default 120s
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

const USE_MOCK_OCR =
  !process.env.OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY.startsWith('sk-your-') ||
  process.env.MOCK_OCR === '1'

const SYSTEM_PROMPT = `あなたは優秀なデータ入力アシスタントです。
提供された複数の健康診断結果の画像から、記載されている情報を正確に読み取り、指定されたJSON形式で出力してください。

# 制約条件

- 画像に記載されている**上から下の順序を維持して**、検査結果の配列に要素を追加してください。原本と突き合わせて確認する作業で順序が重要になります。
- 帳票に記載されている全ての検査項目を、漏れなく抽出してください。項目名、値、単位、判定のセットを1つとして扱ってください。
- 項目名は、画像に書かれている表記をできるだけそのまま使用してください。
- **判定フィールドは非常に重要です。** 「A」「B」「C」「D」「D2」などのアルファベットや記号が記載されている場合、必ずそのまま抽出してください。空欄の場合のみ null を設定してください。
- 値や単位が空欄の項目は、該当するキーの値を null としてください。
- **氏名や受診日が健康診断結果に記載されていない場合は、null を設定してください。** 全ての健康診断結果に氏名が含まれているわけではありません。
- JSON以外の説明や前置きは一切不要です。JSONオブジェクトのみを出力してください。

# 判定の抽出について

判定は通常、以下のような形式で記載されています：
- アルファベット1文字: A, B, C, D, E など
- アルファベット+数字: D1, D2, E1 など
- 記号: ○, ×, △ など
- 空欄の場合のみ null

**重要**: 判定列に何らかの文字や記号が書かれている場合は、必ずその値を抽出してください。

# 出力フォーマット（JSON）

{
  "受診者情報": {
    "氏名": "string | null (健康診断結果に記載がない場合は null)",
    "受診日": "string | null (YYYY-MM-DD形式を推奨、記載がない場合は null)"
  },
  "検査結果": [
    {
      "項目名": "string (例: 身長, 体重, LDLコレステロール)",
      "値": "string (例: 170.5, 65.2, 145)",
      "単位": "string | null (例: cm, kg, mg/dL)",
      "判定": "string | null (例: A, B, C, D, D2, ○, ×)"
    }
  ],
  "総合所見": {
    "総合判定": "string | null (例: A, D2)",
    "医師の所見": "string | null"
  }
}

# 出力例

## 例1: 氏名・受診日が記載されている場合
{
  "受診者情報": {
    "氏名": "山田太郎",
    "受診日": "2025-10-03"
  },
  "検査結果": [
    {
      "項目名": "身長",
      "値": "170.5",
      "単位": "cm",
      "判定": "A"
    },
    {
      "項目名": "LDLコレステロール",
      "値": "145",
      "単位": "mg/dL",
      "判定": "D2"
    }
  ],
  "総合所見": {
    "総合判定": "D2",
    "医師の所見": "血圧、脂質について精密検査を受けてください。"
  }
}

## 例2: 氏名・受診日が記載されていない場合
{
  "受診者情報": {
    "氏名": null,
    "受診日": null
  },
  "検査結果": [
    {
      "項目名": "身長",
      "値": "170.5",
      "単位": "cm",
      "判定": "A"
    }
  ],
  "総合所見": {
    "総合判定": null,
    "医師の所見": null
  }
}`

export async function POST(req: NextRequest) {
  if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
    return jsonError(400, 'INVALID_CONTENT_TYPE', 'multipart/form-data で送信してください。', {
      hint: 'フォームデータで images フィールドに画像を付与してください。',
    })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('images').filter((f): f is File => f instanceof File)

    if (!files.length) {
      return jsonError(400, 'NO_FILES_UPLOADED', '画像ファイルが送信されていません。', {
        hint: 'images フィールドに1枚以上の画像を添付してください。',
      })
    }
    if (files.length > MAX_FILES) {
      return jsonError(400, 'TOO_MANY_FILES', `最大${MAX_FILES}枚までアップロード可能です。`, {
        hint: '枚数を減らして再送してください。',
      })
    }

    const uploads: UploadedFile[] = []
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return jsonError(
          400,
          'UNSUPPORTED_MEDIA_TYPE',
          `サポートされていないファイル形式です。許可: ${ALLOWED_MIME_TYPES.join(', ')}`,
          { hint: '対応形式の画像で再送してください。' }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return jsonError(
          400,
          'FILE_TOO_LARGE',
          `ファイルサイズが上限(${MAX_FILE_SIZE / (1024 * 1024)}MB)を超えています。`,
          { hint: '画像を圧縮するか、サイズを小さくして再送してください。' }
        )
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      uploads.push({
        buffer,
        mimetype: file.type,
        size: file.size,
        originalname: file.name,
      })
    }

    const data = await performOcr(uploads)

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('OCR API error', error)
    const message =
      error instanceof Error
        ? error.message
        : '健康診断結果の抽出に失敗しました。'
    return jsonError(
      500,
      'OCR_PROCESSING_ERROR',
      message,
      {
        traceId: crypto.randomUUID?.() || undefined,
        retryable: USE_MOCK_OCR ? false : true,
      }
    )
  }
}

async function performOcr(files: UploadedFile[]): Promise<HealthReportData> {
  if (USE_MOCK_OCR) {
    console.warn('USE_MOCK_OCR is enabled. Returning mock OCR results.')
    const sample: HealthReportData = {
      ['受診者情報']: {
        ['氏名']: null,
        ['受診日']: null,
      } as any,
      ['検査結果']: [
        { ['項目名']: '身長', ['値']: '170.5', ['単位']: 'cm', ['判定']: 'A' } as any,
        { ['項目名']: '体重', ['値']: '65.2', ['単位']: 'kg', ['判定']: 'A' } as any,
        { ['項目名']: 'LDLコレステロール', ['値']: '145', ['単位']: 'mg/dL', ['判定']: 'D2' } as any,
      ] as any,
      ['総合所見']: {
        ['総合判定']: 'A',
        ['医師のコメント']: null,
      } as any,
    } as any
    return sample
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY が設定されていません。MOCK_OCR=1 でのみキーなし動作が許可されます。')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: TIMEOUT_MS, // abort if SDK-level timeout is hit
  })

  // Vercel serverlessは実行時間に制限があるため、モデル選定や画像枚数に応じてタイムアウト/フォールバックを別途検討する
  const imageContents = files.map(file => {
    const base64Image = file.buffer.toString('base64')
    return {
      type: 'image_url' as const,
      image_url: {
        url: `data:${file.mimetype};base64,${base64Image}`,
        detail: 'high' as const,
      },
    }
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '以下の健康診断結果の画像から、指定されたJSON形式でデータを抽出してください。',
              },
              ...imageContents,
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        temperature: 0,
      },
      { signal: controller.signal }
    )
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      throw new Error('OCR処理がタイムアウトしました。画像枚数やサイズを減らすか、MOCK_OCR=1で切り分けてください。')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI APIからのレスポンスが空です。')
  }

  const parsedData = JSON.parse(content)
  return validateHealthReportData(parsedData)
}

type ErrorMeta = {
  hint?: string
  traceId?: string
  retryable?: boolean
}

function jsonError(status: number, code: string, message: string, meta?: ErrorMeta) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...meta,
      },
    },
    { status }
  )
}
