LANGUAGE FILES
==============
The application itself contains only English. Other languages are separate .json files that the user
imports with the "+" button next to the language list (several files at once are fine). Imported languages
are remembered on that device. "Remove imported languages" at the end of the list forgets them.

File format (UTF-8 JSON). One file may hold one or several languages:

  {
    "ru": { "name": "Русский", "flag": "🇷🇺", "strings": { "Start": "Старт", "Close": "Закрыть" } },
    "uk": { "name": "Українська", "flag": "🇺🇦", "strings": { "Start": "Старт" } }
  }

  - the key ("ru") is the language code; it is matched with the system language for automatic selection
  - "name" is shown in the list, "flag" is a flag emoji (plain characters, optional)
  - "strings": LEFT side = the original English text (never change it), RIGHT side = your translation.
    {n} and {v} are placeholders and must stay in the translation.
  - any string that is missing or empty is shown in English

To make a new language: copy template.json, rename it (e.g. it.json), change "xx" to the language code,
fill in name, flag and the right-hand sides.

Several files with the same language code are allowed: they appear as "Русский", "Русский (2)", "Русский (3)" ...
Importing exactly the same content twice is ignored.
In the Flatpak build these files are also compiled to gettext catalogues (python3 tools/make_po.py).
