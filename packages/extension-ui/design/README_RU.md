# StatePort Extension — полный комплект исходников UX-прототипа

Один текущий проект: **Atom + API editor + Actions + Capture + Settings**.
Все модули Atom уже входят в расширенный прототип; отдельные v1/v2/v3 проекты не нужны.
Объединённый дизайн: **Extension · Current**, 24 экрана и стартовое оглавление.

## Быстрый просмотр

Откройте **`index.html` в браузере**. Он содержит все CSS, JS и SVG-знак внутри себя.
Для самого прототипа не нужны сервер, npm, API-ключи, Desktop или IDE-плагин.

Для разработки редактируйте файлы в `source/`, а не собранный `index.html`.
Можно открыть `source/index.html` или запустить из корня:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Модульная версия доступна по `http://127.0.0.1:8000/source/`.
У браузерного хранения на `file://` могут быть ограничения; прототип имеет session fallback.

## Сборка

```sh
python3 source/build_standalone.py
```

Скрипт использует только стандартную библиотеку Python, не скачивает зависимости и
пересоздаёт корневой `index.html`. Если команда Python в вашей системе называется
`python`, используйте её вместо `python3`.

## Что внутри

```text
index.html                   автономная собранная версия
source/
  index.html                 модульная точка входа
  app.js                     Atom, редакторы, демонстрационная страница и UX-состояния
  engine.js                  модель подмен: original / draft / armed / current / history
  style.css                  основное оформление
  extension.js               Capture, origin-settings, Action Inspector и связи с Atom
  extension-model.js         модель захвата, профилей, source-map identity и наблюдений
  extension.css              оформление дополнительных экранов
  build_standalone.py         сборщик автономного HTML
  assets/stateport-mark.svg  исходный знак StatePort
tests/                       Node-тесты моделей + Playwright-проверки UX
requirements-dev.txt         зависимость только для браузерных тестов/экспорта
package.json                 удобные команды; npm-зависимостей нет
docs/                        решения по UX, границы симуляции, handoff
design/
  figma-current.json         актуальные IDs/URLs 24 экранов + оглавление
  SCREEN_INDEX.md            экран → Figma → исходные модули
  html-reference/            векторные/структурные референсы, извлечённые из HTML
  tools/                    исходники экспорта HTML-геометрии и SVG
screens/                     референсные снимки Atom и расширенного интерфейса
artifacts/                   результаты повторного прогона на этом комплекте
CHECKSUMS.sha256              контрольные суммы содержимого комплекта
```

## Тесты

Модели — Node.js, без `npm install`:

```sh
node --test tests/atom-engine.test.cjs tests/extension-model.test.cjs
```

Браузерные проверки — Python и Playwright:

```sh
python3 -m venv .venv
# Linux/macOS:
. .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python tests/atom-browser.py
python tests/browser.py
python tests/local-explanation.py
```

По умолчанию используется Chromium, установленный Playwright. Для существующего
браузера задайте `CHROMIUM_EXECUTABLE` — например, `/usr/bin/chromium` на Linux.
Тесты не зависят от `/mnt/data` и не требуют менять политики браузера.
Результаты и скриншоты записываются в `artifacts/`.

## Figma — один актуальный источник дизайна

[Открыть Extension · Current](https://www.figma.com/design/PdAC6xFCNtGHdzStethUbW?node-id=38-2)

Файл: `PdAC6xFCNtGHdzStethUbW`, страница: `23:2`, оглавление: `38:2`.
Прежние отдельные страницы v2/v3 объединены. Архивные макеты не являются задачами
на повторную реализацию. Ссылки на исходные экраны сохранены.

`design/figma-current.json` перепроверен через живой Figma connector после объединения.
В Figma находятся редактируемые слои. **Этот ZIP не содержит нативный `.fig`-файл.**
SVG/JSON в `design/html-reference/` — референсы геометрии из HTML, а не резервная копия
всего Figma-документа; они не содержат всех прототипных переходов Figma.
Канвасное оглавление Figma не является новым экраном самого расширения.

## Что реально работает, а что симулируется

Работают интерактивные редакторы, валидация JSON, синхронизация Fields / JSON / Changes,
подготовка и применение демонстрационных подмен, их снятие и восстановление,
экспорт краткого отчёта, навигация, origin-профили и состояния Capture/наблюдения.

**Это исходники UX-прототипа, не production-расширения.** Здесь нет Chrome manifest,
реального CDP-перехвата, анализатора зависимостей, IDE bridge, Capture/Replay runtime,
парсера `.map`/ZIP или вызова модели. Глубокие связи и integrations основаны на
синтетических fixtures. Получение source maps, build matching, наблюдение обработчиков,
сохранение State Card и локальное AI-объяснение демонстрируют интерфейс, а не готовую
реализацию этих технологий.

Основной репозиторий StatePort и отдельный технический эксперимент в архив не входят
и при подготовке комплекта не изменялись. При интеграции сохранить существующий runtime
StatePort и заменить демонстрационные адаптеры его реальными интерфейсами.

## Передача агенту

Откройте эту папку отдельным workspace. Начать с `docs/HANDOFF_RU.md`, затем
`source/README_RU.md` и `design/SCREEN_INDEX.md`. Визуальный эталон интерактивности — HTML;
навигационный индекс дизайна — Figma `Extension · Current`.
Не считать экспорт HTML-геометрии, статический путь функции или fixture доказательством
реального анализа приложения. Не запускать миграцию основного продукта автоматически.
