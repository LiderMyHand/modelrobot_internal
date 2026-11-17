# Propozycja ćwiczeń startowych po polsku

Przegląd dydaktyczny dla samodzielnej instrukcji MyModelRobot LaTeX/PDF. Stan aplikacji: 2026-11-13. Nazwy działań i składnię sprawdzono w `standalone.html`, `frontend/workcell-ui.js`, `frontend/program.js` oraz dostarczonych przykładach. Wskazany przez użytkownika materiał źródłowy przeczytano w całości; służy wyłącznie jako inspiracja kolejności pracy, nie jako temat dokumentu dla studenta.

## Zalecana kolejność nauki

Najpierw wczytanie kompletnego stanowiska; identyfikacja osi, zakresów i TCP przez sterowanie ręczne; uczenie i edycja programu; odtwarzanie i obserwacja; rozróżnienie ruchów MOVEJ/MOVEL/MOVEC; przenoszenie przedmiotu. Zadania paletyzacji i procesu spawania nadają się do rozszerzeń. Instrukcja powinna najpierw dać uczniowi udany, krótki ruch, a dopiero potem wyjaśniać pełną składnię i diagnostykę.

Nie warto przenosić katalogu wszystkich ikon i komend na pierwsze strony. W obecnej aplikacji jedna prosta trasa to **Start programming → Teach two poses → Teach joint pose → jog → Teach joint pose → Reset to teaching start → Plan path → Play**. W wersji mobilnej wejście prowadzi przez zakładkę **Program**; przycisk nagłówka jest ukryty na wąskich ekranach.

### Ustalenia potrzebne studentowi

- Komplet stanowiska otwiera się z ZIP projektu; sam URDF nie zawiera świata SDF ani programu i wszystkich zewnętrznych meshy. Na początku wystarcza gotowy przykład albo ZIP.
- Własny język ruchu używa `MOVEJ`, `MOVEL`, `MOVEC via end`, `PAUSE`, `GRAB` i `RELEASE`. Definicja celu jest osobna od polecenia ruchu.
- Długości są w metrach, a kąty przegubowe i AA w radianach. Kolejność kwaternionu to `Q qx qy qz qw`; alternatywa to `AA ax ay az angle`. `Q 0 0 0 1` oznacza orientację jednostkową, a nie cztery kąty.
- `TOOL tcp_link` wybiera istniejący link URDF. Nie jest poleceniem wpisywania offsetu narzędzia.
- Prędkość joggingu i czasowanie zaplanowanego ruchu to różne ustawienia. Wartości modelu nie są certyfikacją napędu.
- `PAUSE seconds` oznacza postój w programie. Przycisk Pause zatrzymuje odtwarzacz i nie dopisuje komendy.
- `GRAB name` wymaga TCP w odległości do 0,04 m od powierzchni geometrii kolizyjnej. Chwyt jest związaniem kinematycznym, bez sił chwytaka i tarcia.
- **Show collision warnings** steruje wizualizacją ostrzeżeń; planowanie i jogging zawsze mają osobne sprawdzenie kolizji. Odznaczenie ostrzeżeń nie wyłącza walidacji ruchu.

## Zestaw podstawowy: około 100–140 minut

Każde ćwiczenie kończy się krótkim dowodem: fragmentem programu, zrzutem i 2–3 zdaniami interpretacji. Pozwala to uniknąć sprawozdania zawierającego wyłącznie obrazy robota.

### 1. Pierwszy program z dwóch pozycji (15–20 min)

**Cel:** rozróżnić bieżącą pozycję robota, zapisany cel i zaplanowaną trajektorię.

1. Otwórz **Program → Start here — your first robot movement → Teach two poses**. Jest to pełna lekcja z pustym światem i zgiętą konfiguracją początkową. Nowa lekcja zastępuje obecny program i stanowisko.
2. Sprawdź robot `classroom_six_axis_arm`, TCP `tcp_link` i komunikat o braku zaplanowanej ścieżki.
3. Naciśnij **Teach joint pose**, zapisując A. W trybie **Joint** wykonaj jeden dodatni krok J1. Naciśnij **Teach joint pose** ponownie, zapisując B.
4. Użyj **Reset to teaching start**, potem **Plan path → Play**. Reset jest natychmiastowym przywróceniem pozycji do lekcji; nie jest ruchem programu.
5. Rozwiń **Movement source — inspect or edit commands** i znajdź deklaracje `JOINTS taught_joints_1`, `JOINTS taught_joints_2` oraz odpowiadające im `MOVEJ`.

**Kryterium:** robot przechodzi z A do B, program zawiera dwa różne cele, a uczeń wskazuje, który cel przechowuje współrzędne, a która linia zleca ruch. **Pytania:** co stałoby się, gdyby po nauczeniu B zaplanować od razu z B? Dlaczego Reset nie zastępuje `MOVEJ`? **Typowe błędy:** pominięte nauczenie A; nauczenie dwa razy tej samej pozycji; próba Play bez nowego planu.

### 2. Ruchy Joint, World i Tool (15–20 min)

**Cel:** rozpoznać układ, w którym zadawany jest ruch, oraz odróżnić ruch jednego przegubu od ruchu TCP.

Po każdym wariancie wróć przez **Reset to teaching start** do tej samej pozycji. Porównuj pojedyncze kliknięcia, nie długie przytrzymywanie. W **Joint** porusz J1 i sprawdź zmianę jednego przegubu. W **World TCP** wykonaj +Z. W **Tool TCP** wykonaj +X. Do porównania globalnej i lokalnej osi można użyć +X w obu trybach, o ile obie próby są wykonalne; oba ruchy muszą rozpoczynać się od tej samej zgiętej pozycji. Rozwiń wartości TCP i przegubów w panelu. **COORD ↻** przełącza te same tryby co lista.

**Kryterium:** tabela zawiera tryb, kierunek, stan początkowy i obserwację ruchu TCP; student wyjaśnia, dlaczego w World/Tool może zmienić się kilka przegubów. **Pytania:** czy Tool +X musi oznaczać wzrost globalnego X? Czy zmiana trybu zmienia już nauczone punkty? **Typowe błędy:** porównanie z dwóch różnych pozycji; uznanie Rx za translację; pomylenie radianów z metrami.

### 3. Pozycja złączowa i poza TCP (10–15 min)

**Cel:** rozróżnić dwa sposoby reprezentacji celu.

W tej samej, nieruchomej konfiguracji naciśnij **Teach joint pose** i **Teach TCP pose**, następnie obejrzyj wygenerowane deklaracje `JOINTS` i `POSE ... world ... Q ...`. Oba przyciski dopisują ruch **MOVEJ**, a nie automatycznie MOVEL. Porównaj liczbę i jednostki wartości. Wskaż osobno nazwę celu, pozycję XYZ i orientację Q. Dla reprezentacji AA wystarczy opcjonalna demonstracja w panelu **Pose target — inverse kinematics**; nie należy wymagać ręcznego wyliczania kwaternionu na pierwszych zajęciach.

**Kryterium:** uczeń poprawnie oznacza jednostki, kolejność `xyzw` i pole wybierające TCP. **Pytania:** czy dwa roboty mogą używać identycznej listy kątów JOINTS do osiągnięcia tej samej pozy? Czy cel POSE narzuca jednoznaczny wektor przegubów? **Typowe błędy:** zamiana nazw POSE i komendy ruchu; wpisanie trzech kątów Eulera w polu czterech składowych kwaternionu; traktowanie TOOL jak offsetu.

### 4. Różnica MOVEJ, MOVEL i MOVEC (20–25 min)

**Cel:** porównać rodzaje krzywych TCP na celach o znanej wykonalności.

Najbardziej przewidywalny przykład dla początkującego to **Workcell → Load weld-path example** z prostym dwuosiowym układem `seam_cartesian`. Jego stała orientacja umożliwia rysowanie w jednej płaszczyźnie. W pierwszym wariancie usuń rozkazy procesu WELD i zastosuj:

```text
ROBOT seam_cartesian
TOOL tcp_link
POSE A world 0.15 0 0 Q 0 0 0 1
POSE B world 0.35 0.14 0 Q 0 0 0 1
POSE C world 0.55 0 0 Q 0 0 0 1
MOVEJ A
MOVEL B
MOVEL C
MOVEL A
PAUSE 0.5
MOVEC B C
MOVEL A
```

To własny krótki program na pozycjach dostarczonych przez aplikację. Sekwencję z dodatkowym końcowym `MOVEL a` uruchomiono w rzeczywistej przeglądarce przez `notes/scripts/check_starter_lab_paths.cjs`: plan sześciu ruchów oraz pełne odtwarzanie zakończyły się poprawnie. Wersja do dystrybucji jest zapisana w `notes/artifacts/starter_lab_pl/examples/03_paths.robot` i odpowiadającym jej ZIP. A, B i C nie są współliniowe; po powrocie do A komenda MOVEC prowadzi łukiem z A przez B do C. Do porównania wariantów należy wybrać **Reset przed edycją** albo ponownie wczytać przykład, aby obie próby miały ten sam stan początkowy. Po zmianie źródła poprzedni plan jest nieważny.

Nie należy obiecywać, że zamiana MOVEL na MOVEJ zawsze da widocznie zakrzywiony tor: na takim kartezjańskim układzie prosty ruch złączowy może wyglądać podobnie. Różnicę między PTP i LIN na manipulatorze sześciosiowym można zbadać później na nauczonych celach TCP. PTP może omijać przeszkodę; LIN/CIRC zachowują zadaną geometrię i zgłaszają niewykonalność.

**Kryterium:** widok z góry, zrzut planowanej ścieżki, wskazanie początku/via/końca łuku i rozróżnienie wierszy deklaracji od wykonania. **Pytania:** dlaczego CIRC potrzebuje trzech pozycji, choć w komendzie są dwie nazwy? Co oznacza punkt bieżący? Czy trzy punkty współliniowe definiują okrąg? **Błędy:** `MOVEC C B` odwraca role via/end; użycie JOINTS jako argumentu MOVEL; próba obrotu narzędzia o dowolny kąt w robocie dwuosiowym.

### 5. Osobliwość i komunikaty odmowy (15 min)

**Cel:** traktować niepowodzenie jako informację o zadaniu i stanie, a nie jako zgubiony program.

Wróć do **Teach two poses**, rozwiń **Optional lesson — why Cartesian motion can be blocked**, wybierz **Set straight posture for this exercise** i spróbuj World +X. Zapisz komunikat o ograniczonej ruchliwości/odmowie oraz fakt, że robot nie wykonał częściowego kroku. Użyj **Switch to Joint mode to recover**, zmień ostrożnie posturę, a następnie **Reset to teaching start**, by wrócić do znanej konfiguracji. Student ma odróżnić ostrzeżenie o posturze od wyniku konkretnego polecenia.

**Kryterium:** dwa zrzuty: ograniczona postać i powrót do konfiguracji zgiętej; wyjaśnienie, dlaczego zablokowany kierunek nie oznacza, że wszystkie ruchy są niemożliwe. **Pytania:** czy mniejsza prędkość przywraca utracony kierunek? Dlaczego trzeba czasem zmienić posturę Joint? **Błędy:** wielokrotne zwiększanie prędkości w zablokowanym kierunku; nazwanie każdego niewykonalnego celu osobliwością; uznanie niskiej liczby osi robota za błąd.

### 6. Prędkość, limity i interpretacja kolizji (10–15 min)

**Cel:** odróżnić ograniczenie złączowe, niedostępny kierunek i kolizję.

W znanej konfiguracji zgiętej porównaj krok przy niskiej i wyższej prędkości żądanej. Nie stawiaj warunku, że automatyczne zwolnienie musi wystąpić dla dowolnej pozycji: zależy od Jacobianu i limitów. Gdy wystąpi, odczytaj procent prędkości i nazwy ograniczających przegubów; gdy ruch jest niewykonalny, odczytaj przyczynę i zachowany stan. W **Joint** zanotuj rzeczywistą prędkość i przyrost jednego kliknięcia. Wyjaśnij znaczenie limitu ręcznego 0,3 rad/s lub 0,05 m/s oraz domyślnego czasu kroku 0,1 s. Ustawienia ręczne nie są tożsame z czasowaniem zaplanowanej trajektorii.

Do ćwiczenia odmowy ruchu dostarczono `notes/artifacts/starter_lab_pl/examples/04_collision.workcell.zip`: statyczna przeszkoda zajmuje pozycję obowiązkowego punktu pośredniego łuku w gotowym stanowisku kartezjańskim. Plan zostaje odrzucony, robot pozostaje w pozycji początkowej, a komunikat wskazuje `collision/state validation`. To informacja o odrzuceniu przez walidator konfiguracji; w dowolnym programie nie jest ona sama w sobie dowodem surowego przecięcia siatek. W tym konkretnym ćwiczeniu jedyną zmianą sceny jest uprzednio sprawdzona przeszkoda. Przywrócenie **Load weld-path example** usuwa ją i pozwala ponownie zaplanować oryginalny przykład. Student powinien odróżnić **Show collision warnings** od zawsze wykonywanej walidacji planera/joggingu. Nie ma potrzeby samodzielnego przesuwania nieznanych obiektów SDF.

**Kryterium:** tabela „komunikat → przyczyna → bezpieczny następny krok”, obejmująca brak planu, ograniczenie prędkości, ograniczenie pozycji i kolizję. **Błędy:** próba wyłączenia walidacji odznaczeniem ostrzeżeń; traktowanie obniżenia prędkości jako sposobu przechodzenia przez przeszkodę.

### 7. Pick-and-place i stan przedmiotu (15–20 min)

**Cel:** zrozumieć, że ruch robota i powiązanie przedmiotu są oddzielnymi operacjami.

Wybierz **Explore pick-and-place** lub **Workcell → Load pick-and-place example**, sprawdź źródło, wybierz Plan i Play. Ustal, które linie odpowiadają podejściu, przechwyceniu `pick_box`, łukowi, odcinkowi prostemu i zwolnieniu. Zatrzymaj odtwarzanie po GRAB, zaobserwuj wspólne przemieszczanie przedmiotu z TCP, a następnie Reset i sprawdź przywrócenie początkowego stanowiska. Nie edytuj nieznanych współrzędnych na początku ćwiczenia.

**Kryterium:** student potrafi wskazać `GRAB pick_box` i `RELEASE pick_box` oraz moment zmiany więzi. **Pytania:** czy GRAB oznacza symulację siły zacisku? Czy RELEASE uruchamia spadanie przedmiotu? Dlaczego chwyt z dużej odległości zostanie odrzucony? **Błędy:** oczekiwanie fizyki grawitacyjnej i tarcia; mylenie światowego położenia przedmiotu z jego powiązaniem z TCP.

### 8. Archiwizacja i odtworzenie (5–10 min)

**Cel:** oddać projekt, który da się powtórzyć na innym komputerze.

Po jawnie wybranym stanie początkowym użyj **Workcell → Download project ZIP**; nadaj nazwę grupy i numer ćwiczenia. Zapisz także lokalnie przez **Save in this browser** i wyjaśnij różnicę. Otwórz pobrany ZIP przez **Open project ZIP**, porównaj robota, TCP, źródło, obiekty i pozycję, a następnie ponownie Plan i Play. ZIP przechowuje scenę i bieżące położenia, nie zatrzymany licznik programu ani czas pauzy. Dla ucznia najczytelniej eksportować po Reset do udokumentowanego początku.

**Kryterium:** ZIP + zrzut ponownie otwartego stanowiska + krótka informacja o jednostkach i punkcie startowym. **Błędy:** oddanie samego URDF bez meshy/programu; utożsamianie zapisu przeglądarki z przenośnym plikiem; oczekiwanie wznowienia w środku odtwarzania.

## Rozszerzenia dla prowadzącego

- **KUKA iiwa/UR5:** otworzyć gotowe ZIP-y testowane w przeglądarce. Powtórzyć A/B; w KUKA sprawdzić stronicowanie do J7. Porównać 7 przegubów z sześciowymiarowym zadaniem TCP, bez twierdzenia, że samo dodanie osi usuwa każdą osobliwość. Nie kopiować współrzędnych `JOINTS` pomiędzy robotami.
- **ZONE:** dopiero po zrozumieniu dokładnych punktów postoju porównać `ZONE 0` z małą dodatnią wartością. Jednostką jest metr, a nie milimetr; promień pozycyjny nie jest tolerancją orientacji. To zadanie zaawansowane, nie warunek zaliczenia pierwszego uruchomienia.
- **Spawanie:** `WELD ON workpiece`, LIN/CIRC, `WELD OFF` wizualizują i kontrolują bliskość toru względem powierzchni. `WELD JOIN` daje sztywne powiązanie kinematyczne. Nie jest to model temperatury, odkształcenia, wytrzymałości spoiny ani kontaktu.
- **Wiele urządzeń:** osobny język sygnałów i `RUN_ROBOT` zostawić na późniejsze zajęcia. Nie wprowadzać jego liczników i zegara równolegle z pierwszym programem ruchowym.

## Minimalna karta sprawozdania

1. Nazwa stanowiska, robota, wybrany TCP i jednostki.
2. Cel każdego ćwiczenia oraz stan początkowy.
3. Źródło ruchu lub wygenerowany fragment i jeden czytelny obraz.
4. Obserwacja odróżniająca wynik od oczekiwania, zwłaszcza przy błędzie.
5. Dwie odpowiedzi kontrolne i ZIP odtwarzający własny program.

Sugestia podziału dydaktycznego: podstawowe zaliczenie to ćwiczenia 1, 2, 4, 5, 7, 8; ćwiczenie 3 można połączyć z analizą źródła, a 6 przeprowadzić jako wspólną dyskusję komunikatów. Taki podział unika przeciążenia początkującego pełnym katalogiem języka.
