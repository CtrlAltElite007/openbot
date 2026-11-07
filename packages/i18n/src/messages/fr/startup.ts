import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  // The one native error box: the app could not start, so no renderer exists to show it.
  "startup.failedTitle": "OpenBot n’a pas pu démarrer",
  "startup.failedBody":
    "{message}\n\nVos données locales n’ont pas été réinitialisées ni écrasées. Consultez le guide de dépannage pour savoir comment récupérer la situation.",
  "startup.archiveChangedTitle": "Des fichiers d’OpenBot ont été modifiés",
  "startup.archiveChangedBody":
    "Un autre programme a modifié le fichier app.asar d’OpenBot. OpenBot fonctionne maintenant, mais il ne s’ouvrira plus après sa fermeture.\n\nPour le réparer, réinstallez OpenBot. Vos données locales sont conservées.",
  "startup.archiveChangedDownload": "Télécharger OpenBot",
  "startup.newerDataUpdatingTitle": "Mise à jour d’OpenBot",
  "startup.newerDataUpdatingBody":
    "Une version plus récente d’OpenBot a enregistré vos données. OpenBot installe la dernière version, puis se rouvre.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataTitle": "Installez la dernière version d’OpenBot",
  "startup.newerDataBody":
    "Une version plus récente d’OpenBot a enregistré vos données, et cette version ({version}) ne peut pas les ouvrir. Installez la dernière version pour ouvrir vos données.\n\nVos données locales n’ont pas été réinitialisées ni écrasées.",
  "startup.newerDataDownload": "Télécharger OpenBot",
  "startup.newerDataGuide": "Ouvrir le guide",
  "startup.newerDataQuit": "Quitter",
  "startup.customNewerDataTitle": "Cet OpenBot personnalisé est plus ancien que vos données",
  "startup.customNewerDataBody":
    "Une version plus récente d’OpenBot a enregistré vos données, et cette version personnalisée ({version}) ne peut pas les ouvrir. Recompilez l’app personnalisée depuis le dernier custom/main, ou restaurez une sauvegarde de vos données si vous en avez une.\n\nL’OpenBot officiel ne contient pas les modifications personnalisées. Vos données locales n’ont été ni réinitialisées ni écrasées.",
} as const satisfies PartialTranslation<typeof source>;
