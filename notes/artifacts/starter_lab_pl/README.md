# MyModelRobot: ćwiczenia wprowadzające

Samodzielna instrukcja po polsku. Otwórz `mymodelrobot_cwiczenia.pdf`.

## Zawartość i użycie

- `main.tex` i `assets/`: edytowalne źródło i ilustracje aktualnej aplikacji.
- `examples/`: programy do skopiowania do pola Movement source; nie są programami sprzętowego kontrolera.
- `projekty/kuka_iiwa.workcell.zip`, `projekty/ur5.workcell.zip`: gotowe projekty do otwarcia przez Workcell → Open project ZIP. Zawierają dwupunktowe programy, siatki i zgiętą konfigurację startową.
- Do uruchomienia potrzebna jest aktualna aplikacja MyModelRobot (osobny katalog z `standalone.html`). Sam PDF nie uruchamia symulatora.

## Kompilacja

Wymagany pdfLaTeX/TeX Live, pakiety: lmodern, geometry, amsmath, graphicx, booktabs, tabularx, tikz, tcolorbox, listings, enumitem, fancyhdr, lastpage, hyperref. Uruchom `bash build.sh` z dowolnego katalogu. Polecenie korzysta wyłącznie z lokalnych plików pakietu. Tekst jest UTF-8/T1, kąty w przykładach są w radianach, kwaterniony w kolejności xyzw.

## Źródła i licencje modeli

Treść ćwiczeń i zrzuty dotyczą MyModelRobot. Inspiracją metodyczną była instrukcja PŁ wskazana przez prowadzącego: https://automatyka.p.lodz.pl/sites/i21/files/2026-02/stanowisko_c_-_easy-_rob.pdf . Oryginalny materiał zarchiwizowano w repozytorium w `references/stanowisko_c_easy_rob_2026.pdf`; nie jest potrzebny do wykonywania ćwiczeń i nie jest częścią tego pakietu dydaktycznego.

KUKA LBR iiwa: źródło https://github.com/bulletphysics/bullet3/tree/d3afe76132fc76b0f9b2359cbaef47a3766e7fbb/data/kuka_iiwa , opis modelu BSD-2-Clause, zgodnie z nagłówkiem URDF. UR5: oficjalny opis Universal Robots ROS 2, https://github.com/UniversalRobots/Universal_Robots_ROS2_Description/tree/3852128295499b52f38f82171f5ff3f21ecdfa22 , BSD-3-Clause. W pakiecie `licenses/` znajdują się pełne zachowane noty. W obu projektach upstreamowe siatki kolizyjne STL służą także jako widoczne powierzchnie, ponieważ importer nie wczytuje OBJ/DAE. Zachowano kinematykę, limity, lokalne transformacje i kolizje. Nie ma kalibracji egzemplarza sprzętu.

## Weryfikacja

Sekwencje uczenia, Joint/World/Tool, osobliwość, odtwarzanie i ponowne otwieranie ZIP opierają się na testach przeglądarkowych aplikacji. Dodatkowy skrypt `notes/scripts/check_starter_lab_paths.cjs` w repozytorium sprawdza tor trójkąta i łuku oraz ćwiczenie z przeszkodą. Instrukcja opisuje symulator kinematyczny; nie obejmuje sił kontaktu, dynamiki ani sterowania sprzętem.
