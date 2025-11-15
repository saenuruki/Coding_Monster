# ライフシミュレーションゲーム Backend MVP実装計画

## 技術スタック
- FastAPI (Python)
- Google Gemini API (LLM)
- SQLite (データ永続化)
- Pydantic (データバリデーション)

## パラメータ設計
6つのパラメータを管理(後で変更可能):
- health (健康)
- happiness (幸福度)
- money (お金)
- energy (体力)
- social (社会性)
- career (キャリア)

各パラメータの変化範囲: -10 ~ +10

## ディレクトリ構成
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPIアプリケーション本体
│   ├── models.py            # データモデル定義
│   ├── database.py          # SQLite接続管理
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── gemini_client.py # Gemini API連携
│   │   ├── prompts.py       # プロンプトテンプレート
│   │   └── event_generator.py # イベント生成ロジック
│   └── api/
│       ├── __init__.py
│       └── routes.py        # APIエンドポイント
├── requirements.txt
└── .env.example
```

## API エンドポイント設計
1. `POST /api/game/start` - 新規ゲーム開始
2. `GET /api/game/{game_id}/day/{day_number}` - 指定日のイベント取得
3. `POST /api/game/{game_id}/choice` - 選択肢を選択してパラメータ更新
4. `GET /api/game/{game_id}/status` - 現在のステータス取得

## LLMモジュール機能
1. **イベント生成**: 現在のdayとパラメータ状態に基づいてイベント+3選択肢を生成
2. **パラメータ計算**: 各選択肢がパラメータに与える影響を計算(-10~+10)
3. **構造化出力**: JSON形式で返却(Gemini Function Calling使用)

## 実装順序
1. 基本的なFastAPIセットアップ + 依存関係
2. データモデルとSQLite DB設定
3. Gemini API連携とプロンプト設計
4. イベント生成ロジック実装
5. APIエンドポイント実装
6. ローカル動作確認
