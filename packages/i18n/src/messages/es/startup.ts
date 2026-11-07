import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "OpenBot no pudo iniciarse",
  "startup.failedBody":
    "{message}\n\nTus datos locales no se han restablecido ni sobrescrito. Consulta la guía de solución de problemas para recuperarlos.",
  "startup.archiveChangedTitle": "Se cambiaron archivos de OpenBot",
  "startup.archiveChangedBody":
    "Otro programa cambió el archivo app.asar de OpenBot. OpenBot funciona ahora, pero no se abrirá después de cerrarlo.\n\nPara repararlo, vuelve a instalar OpenBot. Tus datos locales se conservan.",
  "startup.archiveChangedDownload": "Descargar OpenBot",
  "startup.newerDataUpdatingTitle": "Actualizando OpenBot",
  "startup.newerDataUpdatingBody":
    "Una versión más reciente de OpenBot guardó tus datos. OpenBot instala la última versión y luego se abre de nuevo.\n\nTus datos locales no se restablecieron ni se sobrescribieron.",
  "startup.newerDataTitle": "Instala la última versión de OpenBot",
  "startup.newerDataBody":
    "Una versión más reciente de OpenBot guardó tus datos y esta versión ({version}) no puede abrirlos. Instala la última versión para abrir tus datos.\n\nTus datos locales no se restablecieron ni se sobrescribieron.",
  "startup.newerDataDownload": "Descargar OpenBot",
  "startup.newerDataGuide": "Abrir guía",
  "startup.newerDataQuit": "Salir",
  "startup.customNewerDataTitle": "Este OpenBot personalizado es más antiguo que tus datos",
  "startup.customNewerDataBody":
    "Una versión más reciente de OpenBot guardó tus datos, y esta versión personalizada ({version}) no puede abrirlos. Vuelve a compilar la app personalizada desde el custom/main más reciente, o restaura una copia de seguridad de tus datos si tienes una.\n\nEl OpenBot oficial no tiene los cambios personalizados. Tus datos locales no se restablecieron ni se sobrescribieron.",
} as const satisfies PartialTranslation<typeof source>;
