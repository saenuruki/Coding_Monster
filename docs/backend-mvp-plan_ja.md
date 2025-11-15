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

## 担当分担
- **Iena**: database.py, models.py, update_stats関数, APIエンドポイント
- **Kent**: LLMモジュール (gemini_client.py, prompts.py, event_generator.py)

## LLMモジュール機能 (K-uehara担当)
1. **イベント生成**: 現在のdayとパラメータ状態に基づいてイベント+3選択肢を生成
2. **パラメータ計算**: 各選択肢がパラメータに与える影響(impact)を計算(-10~+10)
3. **構造化出力**: JSON形式で返却

### LLM出力形式
```json
{
  "event": {
    "description": "イベントの説明文",
    "choices": [
      {
        "id": 1,
        "text": "選択肢1",
        "impact": {
          "health": 5,
          "happiness": 3,
          "money": 0,
          "energy": -2,
          "social": 0,
          "career": 2
        }
      },
      // ... 選択肢2, 3
    ]
  }
}
```

## Database機能 (Iena担当)
1. **GameState管理**: game_id, current_day, 6つのパラメータをSQLiteで保持
2. **update_stats関数**: LLMから返されたimpactを使ってパラメータを更新
3. **データ永続化**: ゲーム進行状態の保存・読み込み

## 実装順序
1. **並行作業**:
   - Iena: FastAPIセットアップ + database.py + models.py
   - Kent: gemini_client.py + prompts.py + event_generator.py
2. **統合**: APIエンドポイントでLLMモジュールとDB連携
3. **動作確認**: ローカルでE2Eテスト
