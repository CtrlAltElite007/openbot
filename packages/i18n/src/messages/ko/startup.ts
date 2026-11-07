import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "OpenBot을 시작할 수 없어요",
  "startup.failedBody":
    "{message}\n\n로컬 데이터는 초기화되거나 덮어쓰이지 않았어요. 복구 방법은 문제 해결 가이드를 확인해 주세요.",
  "startup.archiveChangedTitle": "OpenBot 파일이 변경됨",
  "startup.archiveChangedBody":
    "다른 프로그램이 OpenBot 파일 app.asar를 변경했습니다. OpenBot은 지금 실행 중이지만 종료하면 다시 열리지 않습니다.\n\n복구하려면 OpenBot을 다시 설치하세요. 로컬 데이터는 그대로 유지됩니다.",
  "startup.archiveChangedDownload": "OpenBot 다운로드",
  "startup.newerDataUpdatingTitle": "OpenBot 업데이트 중",
  "startup.newerDataUpdatingBody":
    "더 새로운 버전의 OpenBot이 데이터를 저장했습니다. OpenBot이 최신 버전을 설치한 후 다시 열립니다.\n\n로컬 데이터는 초기화되거나 덮어쓰이지 않았습니다.",
  "startup.newerDataTitle": "최신 OpenBot을 설치하세요",
  "startup.newerDataBody":
    "더 새로운 버전의 OpenBot이 데이터를 저장했으며, 이 버전({version})으로는 열 수 없습니다. 데이터를 열려면 최신 버전을 설치하세요.\n\n로컬 데이터는 초기화되거나 덮어쓰이지 않았습니다.",
  "startup.newerDataDownload": "OpenBot 다운로드",
  "startup.newerDataGuide": "가이드 열기",
  "startup.newerDataQuit": "종료",
  "startup.customNewerDataTitle": "이 사용자 지정 OpenBot은 데이터보다 오래된 버전입니다",
  "startup.customNewerDataBody":
    "최신 버전의 OpenBot이 데이터를 저장했기 때문에 이 사용자 지정 버전({version})으로는 열 수 없습니다. 최신 custom/main에서 사용자 지정 앱을 다시 빌드하거나, 빌드 스크립트가 만든 데이터 백업을 복원하세요.\n\n공식 OpenBot에는 사용자 지정 변경 사항이 없습니다. 로컬 데이터는 초기화되거나 덮어써지지 않았습니다.",
} as const satisfies PartialTranslation<typeof source>;
