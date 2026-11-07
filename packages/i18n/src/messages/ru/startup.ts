import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "OpenBot не удалось запустить",
  "startup.failedBody":
    "{message}\n\nЛокальные данные не сброшены и не перезаписаны. Шаги восстановления — в руководстве по устранению неполадок.",
  "startup.archiveChangedTitle": "Файлы OpenBot изменены",
  "startup.archiveChangedBody":
    "Другая программа изменила файл OpenBot app.asar. Сейчас OpenBot работает, но после выхода он больше не запустится.\n\nЧтобы исправить это, установите OpenBot заново. Ваши локальные данные сохранятся.",
  "startup.archiveChangedDownload": "Скачать OpenBot",
  "startup.newerDataUpdatingTitle": "Обновление OpenBot",
  "startup.newerDataUpdatingBody":
    "Более новая версия OpenBot сохранила ваши данные. OpenBot устанавливает последнюю версию и затем откроется снова.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataTitle": "Установите последнюю версию OpenBot",
  "startup.newerDataBody":
    "Более новая версия OpenBot сохранила ваши данные, и эта версия ({version}) не может их открыть. Установите последнюю версию, чтобы открыть данные.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataDownload": "Скачать OpenBot",
  "startup.newerDataGuide": "Открыть руководство",
  "startup.newerDataQuit": "Выйти",
  "startup.customNewerDataTitle": "Эта собственная сборка OpenBot старше ваших данных",
  "startup.customNewerDataBody":
    "Более новая версия OpenBot сохранила ваши данные, и эта собственная сборка ({version}) не может их открыть. Пересоберите приложение из последней ветки custom/main или восстановите резервную копию данных, созданную скриптом сборки.\n\nВ официальном OpenBot нет изменений собственной сборки. Ваши локальные данные не были сброшены или перезаписаны.",
} as const satisfies PartialTranslation<typeof source>;
