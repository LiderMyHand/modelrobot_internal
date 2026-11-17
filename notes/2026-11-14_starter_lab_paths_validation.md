# Walidacja torów i oczekiwanych odmów do instrukcji startowej

Wykonano 2026-11-14 w Chromium na dynamicznym serwerze lokalnym, przez rzeczywiste przyciski aplikacji. Skrypt: `notes/scripts/check_starter_lab_paths.cjs`. Pełny log budowania, testów i prób: `notes/artifacts/starter_lab_pl/validation.log`. Szczegóły liczbowe i źródła: `notes/artifacts/starter_lab_pl/paths_collision_validation.json`.

## Program poprawny i wariant

Stanowisko `seam_cartesian` jest wczytywane przyciskiem **Workcell → Load weld-path example**. Program używa pozycji `a=(0.15,0,0)`, `v=(0.35,0.14,0)`, `b=(0.55,0,0)` w metrach, ze stałą orientacją Q=(0,0,0,1). Sekwencja to MOVEJ a, MOVEL v, MOVEL b, MOVEL a, PAUSE0.5, MOVEC v b, MOVEL a. Przed wariantem ponownie wczytywany jest cały przykład, co zapewnia identyczny początek.

- Bazowy program: **Plan i pełne Play zakończone poprawnie**. Sześć ruchów, 8.899827 s, 3343 próbki; koniec slide_x=0.1500089999 m, slide_y≈0. To błąd poniżej 10 mikrometrów względem a i mieści się w tolerancji planera.
- Wariant zmienia wyłącznie `v.y` z0.14 na0.10 m: **Plan i pełne Play zakończone poprawnie**. Sześć ruchów, 10.729210 s, 3291 próbek; koniec ponownie przy a z błędem poniżej10mikrometrów.
- Nie wolno w instrukcji zakładać, że obniżenie wysokości via skraca czas ruchu. W tej próbie czas jest większy; czasowanie uwzględnia ograniczenia ruchu, a nie wyłącznie długość narysowanej krzywej.

Sprawdzone pliki do dystrybucji:

- `examples/03_paths.robot`, `examples/03_paths.workcell.zip`;
- `examples/03_paths_v010.robot`, `examples/03_paths_v010.workcell.zip`;
- obrazy `paths_plan.png` i `paths_variant.png`.

## Przeszkoda w obowiązkowym via

Ponownie wczytano oryginalny przykład spawalniczy. Do SDF dodano jeden statyczny model `lab_obstacle` w(0.35,0.14,0), z pudełkiem0.05×0.05×0.10m jako visual i collision. Oryginalny CIRC musi przejść przez to via.

Plan został odrzucony; przeguby pozostały dokładnie w q=[0,0]. Początkowo interfejs pokazywał tylko „disallowed configuration”, mimo że wynik funkcji miał już status `collision`. Po uzgodnieniu z rodzicem naprawiono **wyłącznie komunikat** w `frontend/planning/ik-pose.js`: osiągnięta poza odrzucona przez predykat ma powód „configuration rejected by collision/state validation”. Nie zmieniono algorytmu, tolerancji ani filtrów dopuszczalności.

W `tests/planning.test.cjs` uzupełniono istniejącą regresję: sprawdza status collision, jawny komunikat o walidatorze oraz mały błąd pozycji potwierdzający osiągalność geometryczną odrzuconego celu. `node --test tests/planning.test.cjs tests/planning-collision.test.cjs` przechodzi **22/22**.

Komunikat oznacza odrzucenie przez walidator konfiguracji. W ogólnym API `isStateValid` może wyrażać inny warunek dopuszczalności, więc samo brzmienie nie stanowi niezależnego dowodu surowego przecięcia siatek. W dostarczonym ćwiczeniu zmieniono jedynie znaną przeszkodę geometryczną. Ponowne **Load weld-path example** usuwa przeszkodę i przywraca poprawny plan3ruchów w3.957555s.

Gotowe dane: `examples/04_collision.workcell.zip`, `examples/04_obstacle.world.sdf`, `collision_blocked.png`.

## GRAB przed podejściem

Na świeżym pick-and-place przestawiono tylko `GRAB pick_box` przed `MOVEJ pick`. Weryfikacja składni jest poprawna:7komend,4cele. Plan odrzuca wykonanie z jawnym komunikatem, że przedmiot jest0.483m odTCP i należy zbliżyć TCP do0.040m od powierzchni kolizyjnej. Wektor przegubów nie zmienił się. To poprawna składniowo, lecz niewykonalna w tym stanie operacja chwytu, nie błąd parsera.

Ponowne wczytanie poprawnego przykładu przywróciło plan3ruchów(PTP,CIRC,LIN),14.300892s,2425próbek. Dane: `examples/05_grab_too_early.robot`, `examples/05_grab_too_early.workcell.zip`, `examples/05_pick_place_correct.robot`, `grab_too_early.png`.

Próba końcowa całego skryptu: **PASS**, brak wyjątków strony. Obrazy czystego toru, kolizji i błędu chwytu obejrzano; komunikaty i oczekiwana geometria są widoczne. Pliki i notatka pozostają lokalne; nic nie wysyłano do Git remote.
