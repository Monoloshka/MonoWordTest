/*
 * MonoWordTest translations.
 *
 * HOW TO ADD A LANGUAGE (no other code changes needed):
 *   1. Copy any block below (e.g. "de") and paste it at the end of MWT_LANGS.
 *   2. Change the key to the language code (e.g. "it", "pt-br", "zh-cn"; lower-case).
 *   3. Set "name" (shown in the dropdown, in the language itself) and "flag"
 *      (a flag emoji, i.e. plain text characters - not an image).
 *   4. Translate ONLY the text on the RIGHT side of each line.
 *      The LEFT side is the original English text and must stay unchanged.
 *      {n} is a placeholder for a number - keep it in the translation.
 *   Any line you leave out (or leave empty) automatically falls back to English.
 *
 * The app picks the language from the system/browser locale automatically;
 * the user can also choose one manually. Unknown locale -> English.
 */
var MWT_LANGS = {

  en: { name: 'English', flag: '🇬🇧', strings: {} },   // English = the original text, nothing to translate

  ru: { name: 'Русский', flag: '🇷🇺', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Угадайте перевод. Загрузите .txt-файл, где каждая строка имеет вид: слово - перевод',
    'Browse…': 'Обзор…',
    'Use built-in RU ↔ EN dictionary': 'Использовать встроенный словарь RU ↔ EN',
    'No file selected': 'Файл не выбран',
    'Answer options:': 'Вариантов ответа:',
    'Show:': 'Показывать:',
    'Random side': 'Случайная сторона',
    'Left of " - " (guess the right)': 'Слева от " - " (угадать правую часть)',
    'Right of " - " (guess the left)': 'Справа от " - " (угадать левую часть)',
    'Start': 'Старт',
    'Close': 'Закрыть',
    'Language:': 'Язык:',
    'Theme:': 'Тема:',
    'Auto': 'Авто',
    'Light': 'Светлая',
    'Dark': 'Тёмная',
    'Pick the translation.': 'Выберите перевод.',
    'Correct! Next word in {n}...': 'Верно! Следующее слово через {n}...',
    'Loaded {n} entries. Choose options and press Start.': 'Загружено записей: {n}. Выберите параметры и нажмите «Старт».',
    'Built-in RU ↔ EN dictionary': 'Встроенный словарь RU ↔ EN',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'Подходящих строк не найдено. Каждая строка должна иметь вид: слово - перевод (минимум 2 строки).',
    'This browser cannot read files. Use the built-in dictionary.': 'Этот браузер не умеет читать файлы. Используйте встроенный словарь.',
    'Could not read the file.': 'Не удалось прочитать файл.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'Встроенный словарь (dictionary.js) не найден рядом с этой страницей.',
    'Ad': 'Реклама'
  } },

  uk: { name: 'Українська', flag: '🇺🇦', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Вгадайте переклад. Завантажте .txt-файл, де кожен рядок має вигляд: слово - переклад',
    'Browse…': 'Огляд…',
    'Use built-in RU ↔ EN dictionary': 'Використати вбудований словник RU ↔ EN',
    'No file selected': 'Файл не вибрано',
    'Answer options:': 'Варіантів відповіді:',
    'Show:': 'Показувати:',
    'Random side': 'Випадкова сторона',
    'Left of " - " (guess the right)': 'Ліворуч від " - " (вгадати праву частину)',
    'Right of " - " (guess the left)': 'Праворуч від " - " (вгадати ліву частину)',
    'Start': 'Старт',
    'Close': 'Закрити',
    'Language:': 'Мова:',
    'Theme:': 'Тема:',
    'Auto': 'Авто',
    'Light': 'Світла',
    'Dark': 'Темна',
    'Pick the translation.': 'Оберіть переклад.',
    'Correct! Next word in {n}...': 'Вірно! Наступне слово через {n}...',
    'Loaded {n} entries. Choose options and press Start.': 'Завантажено записів: {n}. Оберіть параметри та натисніть «Старт».',
    'Built-in RU ↔ EN dictionary': 'Вбудований словник RU ↔ EN',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'Придатних рядків не знайдено. Кожен рядок має мати вигляд: слово - переклад (щонайменше 2 рядки).',
    'This browser cannot read files. Use the built-in dictionary.': 'Цей браузер не вміє читати файли. Скористайтеся вбудованим словником.',
    'Could not read the file.': 'Не вдалося прочитати файл.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'Вбудований словник (dictionary.js) не знайдено поруч із цією сторінкою.',
    'Ad': 'Реклама'
  } },

  kk: { name: 'Қазақша', flag: '🇰🇿', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Аудармасын табыңыз. Әр жолы мына түрде болатын .txt файлын жүктеңіз: сөз - аударма',
    'Browse…': 'Шолу…',
    'Use built-in RU ↔ EN dictionary': 'Кіріктірілген RU ↔ EN сөздігін пайдалану',
    'No file selected': 'Файл таңдалмаған',
    'Answer options:': 'Жауап нұсқалары:',
    'Show:': 'Көрсету:',
    'Random side': 'Кездейсоқ жағы',
    'Left of " - " (guess the right)': '" - " белгісінің сол жағы (оң жағын табу)',
    'Right of " - " (guess the left)': '" - " белгісінің оң жағы (сол жағын табу)',
    'Start': 'Бастау',
    'Close': 'Жабу',
    'Language:': 'Тіл:',
    'Theme:': 'Тақырып:',
    'Auto': 'Авто',
    'Light': 'Ашық',
    'Dark': 'Қараңғы',
    'Pick the translation.': 'Аударманы таңдаңыз.',
    'Correct! Next word in {n}...': 'Дұрыс! Келесі сөзге дейін: {n}...',
    'Loaded {n} entries. Choose options and press Start.': '{n} жазба жүктелді. Параметрлерді таңдап, «Бастау» түймесін басыңыз.',
    'Built-in RU ↔ EN dictionary': 'Кіріктірілген RU ↔ EN сөздігі',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'Жарамды жолдар табылмады. Әр жол мына түрде болуы керек: сөз - аударма (кемінде 2 жол).',
    'This browser cannot read files. Use the built-in dictionary.': 'Бұл браузер файлдарды оқи алмайды. Кіріктірілген сөздікті пайдаланыңыз.',
    'Could not read the file.': 'Файлды оқу мүмкін болмады.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'Кіріктірілген сөздік (dictionary.js) осы беттің қасынан табылмады.',
    'Ad': 'Жарнама'
  } },

  de: { name: 'Deutsch', flag: '🇩🇪', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Errate die Übersetzung. Lade eine .txt-Datei, in der jede Zeile so aussieht: Wort - Übersetzung',
    'Browse…': 'Durchsuchen…',
    'Use built-in RU ↔ EN dictionary': 'Eingebautes RU ↔ EN-Wörterbuch verwenden',
    'No file selected': 'Keine Datei ausgewählt',
    'Answer options:': 'Antwortmöglichkeiten:',
    'Show:': 'Anzeigen:',
    'Random side': 'Zufällige Seite',
    'Left of " - " (guess the right)': 'Links von " - " (rechte Seite erraten)',
    'Right of " - " (guess the left)': 'Rechts von " - " (linke Seite erraten)',
    'Start': 'Start',
    'Close': 'Schließen',
    'Language:': 'Sprache:',
    'Theme:': 'Design:',
    'Auto': 'Automatisch',
    'Light': 'Hell',
    'Dark': 'Dunkel',
    'Pick the translation.': 'Wähle die Übersetzung.',
    'Correct! Next word in {n}...': 'Richtig! Nächstes Wort in {n}...',
    'Loaded {n} entries. Choose options and press Start.': '{n} Einträge geladen. Wähle die Optionen und drücke Start.',
    'Built-in RU ↔ EN dictionary': 'Eingebautes RU ↔ EN-Wörterbuch',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'Keine verwendbaren Zeilen gefunden. Jede Zeile muss so aussehen: Wort - Übersetzung (mindestens 2 Zeilen).',
    'This browser cannot read files. Use the built-in dictionary.': 'Dieser Browser kann keine Dateien lesen. Verwende das eingebaute Wörterbuch.',
    'Could not read the file.': 'Die Datei konnte nicht gelesen werden.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'Das eingebaute Wörterbuch (dictionary.js) wurde neben dieser Seite nicht gefunden.',
    'Ad': 'Werbung'
  } },

  fr: { name: 'Français', flag: '🇫🇷', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Devinez la traduction. Chargez un fichier .txt dont chaque ligne est de la forme : mot - traduction',
    'Browse…': 'Parcourir…',
    'Use built-in RU ↔ EN dictionary': 'Utiliser le dictionnaire RU ↔ EN intégré',
    'No file selected': 'Aucun fichier sélectionné',
    'Answer options:': 'Nombre de réponses :',
    'Show:': 'Afficher :',
    'Random side': 'Côté aléatoire',
    'Left of " - " (guess the right)': 'À gauche de " - " (deviner la droite)',
    'Right of " - " (guess the left)': 'À droite de " - " (deviner la gauche)',
    'Start': 'Démarrer',
    'Close': 'Fermer',
    'Language:': 'Langue :',
    'Theme:': 'Thème :',
    'Auto': 'Auto',
    'Light': 'Clair',
    'Dark': 'Sombre',
    'Pick the translation.': 'Choisissez la traduction.',
    'Correct! Next word in {n}...': 'Correct ! Mot suivant dans {n}...',
    'Loaded {n} entries. Choose options and press Start.': '{n} entrées chargées. Choisissez les options et appuyez sur Démarrer.',
    'Built-in RU ↔ EN dictionary': 'Dictionnaire RU ↔ EN intégré',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'Aucune ligne exploitable. Chaque ligne doit être de la forme : mot - traduction (au moins 2 lignes).',
    'This browser cannot read files. Use the built-in dictionary.': 'Ce navigateur ne peut pas lire les fichiers. Utilisez le dictionnaire intégré.',
    'Could not read the file.': 'Impossible de lire le fichier.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'Le dictionnaire intégré (dictionary.js) est introuvable à côté de cette page.',
    'Ad': 'Publicité'
  } },

  es: { name: 'Español', flag: '🇪🇸', strings: {
    'Guess the translation. Load a .txt file where each line is: word - translation': 'Adivina la traducción. Carga un archivo .txt donde cada línea tenga la forma: palabra - traducción',
    'Browse…': 'Examinar…',
    'Use built-in RU ↔ EN dictionary': 'Usar el diccionario RU ↔ EN integrado',
    'No file selected': 'Ningún archivo seleccionado',
    'Answer options:': 'Opciones de respuesta:',
    'Show:': 'Mostrar:',
    'Random side': 'Lado aleatorio',
    'Left of " - " (guess the right)': 'A la izquierda de " - " (adivinar la derecha)',
    'Right of " - " (guess the left)': 'A la derecha de " - " (adivinar la izquierda)',
    'Start': 'Empezar',
    'Close': 'Cerrar',
    'Language:': 'Idioma:',
    'Theme:': 'Tema:',
    'Auto': 'Automático',
    'Light': 'Claro',
    'Dark': 'Oscuro',
    'Pick the translation.': 'Elige la traducción.',
    'Correct! Next word in {n}...': '¡Correcto! Siguiente palabra en {n}...',
    'Loaded {n} entries. Choose options and press Start.': '{n} entradas cargadas. Elige las opciones y pulsa Empezar.',
    'Built-in RU ↔ EN dictionary': 'Diccionario RU ↔ EN integrado',
    'No usable lines found. Each line must look like: word - translation (at least 2 lines).': 'No se encontraron líneas válidas. Cada línea debe tener la forma: palabra - traducción (al menos 2 líneas).',
    'This browser cannot read files. Use the built-in dictionary.': 'Este navegador no puede leer archivos. Usa el diccionario integrado.',
    'Could not read the file.': 'No se pudo leer el archivo.',
    'Built-in dictionary (dictionary.js) was not found next to this page.': 'No se encontró el diccionario integrado (dictionary.js) junto a esta página.',
    'Ad': 'Publicidad'
  } }

};
