import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "OpenBot を起動できませんでした",
  "startup.failedBody":
    "{message}\n\nお使いのデータは初期化も上書きもされていません。復旧の手順はトラブルシューティングガイドをご覧ください。",
  "startup.archiveChangedTitle": "OpenBot のファイルが変更されました",
  "startup.archiveChangedBody":
    "別のプログラムが OpenBot のファイル app.asar を変更しました。OpenBot は今は動作していますが、終了すると次は起動しません。\n\n修復するには、OpenBot をもう一度インストールしてください。ローカルのデータはそのまま残ります。",
  "startup.archiveChangedDownload": "OpenBot をダウンロード",
  "startup.newerDataUpdatingTitle": "OpenBot を更新しています",
  "startup.newerDataUpdatingBody":
    "新しいバージョンの OpenBot がデータを保存しました。OpenBot は最新バージョンをインストールしてから、もう一度開きます。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataTitle": "最新の OpenBot をインストールしてください",
  "startup.newerDataBody":
    "新しいバージョンの OpenBot がデータを保存したため、このバージョン ({version}) では開けません。データを開くには最新バージョンをインストールしてください。\n\nローカルデータはリセットも上書きもされていません。",
  "startup.newerDataDownload": "OpenBot をダウンロード",
  "startup.newerDataGuide": "ガイドを開く",
  "startup.newerDataQuit": "終了",
  "startup.customNewerDataTitle": "このカスタム版 OpenBot はデータより古いバージョンです",
  "startup.customNewerDataBody":
    "新しいバージョンの OpenBot がデータを保存したため、このカスタム版 ({version}) では開けません。最新の custom/main からカスタム版アプリをビルドし直すか、ビルドスクリプトが作成したデータのバックアップを復元してください。\n\n公式の OpenBot にはカスタムの変更が含まれていません。ローカルデータはリセットも上書きもされていません。",
} as const satisfies PartialTranslation<typeof source>;
