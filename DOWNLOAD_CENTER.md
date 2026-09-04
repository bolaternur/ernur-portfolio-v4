# ERNUR PORTFOLIO V5 — DOWNLOAD CENTER

Это единая точка входа. Иди строго сверху вниз.

> Не нужно скачивать всё подряд. Сначала блок **MUST DOWNLOAD**, потом мы делаем аудит и только после этого берём optional-компоненты.

---

## 00 — Твои файлы, которые уже есть

Положи их потом в `assets/source/`:

- `DECODE Simple Bot(1).glb`
- `3209-0001-0007.glb`
- `lowprofilemechanicalkeyboard.obj`
- `lowprofilemechanicalkeyboard.mtl`
- `lowprofilemechanicalkeyboard.fbx`
- `lowprofilekeyboard.dae`
- `bricolage-main(1).zip`
- `fragment-mono-main(1).zip`
- `instrument-serif-main(1).zip`

Подробно: [`resources/04_YOUR_ASSETS.md`](./resources/04_YOUR_ASSETS.md)

---

# MUST DOWNLOAD

## 01 — React Three Fiber
https://github.com/pmndrs/react-three-fiber

Нужно для 3D-сцен и React-интеграции.

## 02 — Drei
https://github.com/pmndrs/drei

Готовые production-помощники для камер, environments, loaders и interaction.

## 03 — gltfjsx
https://github.com/pmndrs/gltfjsx

Нужно для анализа/превращения GLB в управляемую структуру компонентов.

## 04 — React Postprocessing
https://github.com/pmndrs/react-postprocessing

Используем очень аккуратно: selective bloom / subtle chromatic effects / vignette только если реально улучшает сцену.

## 05 — Lenis
https://github.com/darkroomengineering/lenis

Smooth scroll и синхронизация с GSAP.

## 06 — Meshoptimizer / gltfpack
https://github.com/zeux/meshoptimizer

Критично для оптимизации двух GLB перед production.

## 07 — Theatre.js
https://github.com/theatre-js/theatre

Для точной постановки камеры/света/таймингов, если понадобится.

---

# CODROPS — DOWNLOAD AFTER AUDIT

## 08 — One Element Scroll
https://github.com/codrops/OneElementScroll

Референс для перехода одного объекта между layout-state.

## 09 — Scroll Based Layout Animations
https://github.com/codrops/ScrollBasedLayoutAnimations

Референс для Flip + ScrollTrigger композиций.

## 10 — Kinetic Type Page Transition
https://github.com/codrops/KineticTypePageTransition

Только как референс для page transition. Не копируем как есть.

## 11 — On Scroll Typography Animations
https://github.com/codrops/OnScrollTypographyAnimations

Для controlled text reveals.

## 12 — Scroll Text Motion
https://github.com/codrops/ScrollTextMotion

Для одной-двух текстовых сцен, если они нужны.

## 13 — On Scroll Path Animations
https://github.com/codrops/OnScrollPathAnimations

Для signal-path / engineering-line interaction.

## 14 — Elastic Grid Scroll
https://github.com/codrops/ElasticGridScroll

Только если решим делать gallery/process section.

## 15 — 3D Carousel
https://github.com/codrops/3DCarousel

Только как источник идей. В финале generic carousel может вообще не понадобиться.

## 16 — Image To Content
https://github.com/codrops/ImageToContent

Для перехода CAD/process preview → detail view.

---

# OPTIONAL UI — НЕ СКАЧИВАЙ ПОКА

## 17 — React Bits
https://github.com/DavidHDev/react-bits

Большая коллекция эффектов. Берём максимум 1–2 идеи и переписываем под наш стиль.

## 18 — Magic UI
https://github.com/magicuidesign/magicui

Только отдельные interaction patterns, не дизайн-система сайта.

## 19 — Cult UI
https://github.com/nolly-studio/cult-ui

Только research/reference.

---

# ПОРЯДОК

1. Сначала убедись, что два GLB и клавиатура у тебя сохранены.
2. Скачай **01–07**.
3. Напиши мне: `скачал core 01-07`.
4. Я делаю аудит двух GLB + выбираю точный stack.
5. После этого я скажу, какие именно пункты из **08–19** реально нужны.
6. Не скачивай optional-пакеты заранее — это только создаёт мусор.

---

## Следующая страница

Открой: [`resources/00_START_HERE.md`](./resources/00_START_HERE.md)
