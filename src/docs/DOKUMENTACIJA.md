
# VCS Bonus CRM Sistema - Dokumentacija

## Sistemos aprašymas

VCS Bonus CRM yra taškų valdymo sistema, skirta Vilnius Coding School studentams ir administracijai. Sistema leidžia studentams kaupti taškus už mokymosi veiklą ir keisti juos į prizus.

## Funkcionalumas

### Studentams

#### Pagrindinis puslapis (Dashboard)
- Rodo esamų taškų skaičių
- Atskleidžia neseniai gautus taškus
- Rodo galimų prizų kiekį

#### Prizai
- Peržiūrėti visus galimus prizus
- Matyti kiekvieno prizo taškų kainą
- Užsisakyti prizus (jei pakanka taškų)
- Stebėti užsakymų statusą

#### Istorija
- Peržiūrėti visą taškų gavimo istoriją
- Matyti prizų užsakymų istoriją
- Sekti taškų balanso pokyčius

#### Taisyklės
- Perskaityti sistemos naudojimo taisykles
- Sužinoti, kaip galima užsidirbti taškų

#### D.U.K. (Dažnai užduodami klausimai)
- Rasti atsakymus į populiariausius klausimus
- Išmokti naudotis sistema

### Administratoriams

#### Admin panelė
- **Statistikos peržiūra**: bendri rodikliai apie sistemą
- **Naudotojų valdymas**: visų naudotojų sąrašas ir duomenų peržiūra
- **Taškų valdymas**: galimybė pridėti/atimti taškus bet kuriam naudotojui
- **Prizų katalogas**: prizų kūrimas, redagavimas, išjungimas
- **Užsakymų valdymas**: prizų užsakymų patvirtinimas/atmetimas

#### Turinio redagavimas
- **Taisyklių redagavimas**: galimybė keisti taisyklių turinį
- **D.U.K. redagavimas**: galimybė atnaujinti dažnai užduodamų klausimų sąrašą

## Techniškі parametrai

### Technologijos
- **Frontend**: React 18, TypeScript
- **UI Framework**: Tailwind CSS, Shadcn/UI
- **Maršrutizavimas**: React Router
- **Būsenos valdymas**: TanStack Query, Context API
- **Duomenų saugojimas**: LocalStorage (demo versija)

### Dizaino sistema
- **Spalvos**: 
  - Baltas fonas: #ffffff
  - Juodas tekstas: #020202  
  - Mėlyni akcentai: #3535FF
- **Šriftai**: Sistemos numatytieji šriftai
- **Lentelės**: Juodi kraštai, aiškūs atskyrimai

## Naudojimo instrukcijos

### Prisijungimas
1. Eikite į sistemos pagrindinį puslapį
2. Įveskite savo el. paštą ir slaptažodį
3. Spauskite "Prisijungti"

### Taškų peržiūra
1. Po prisijungimo pateksite į pagrindinį puslapį
2. Viršuje matysite savo esamų taškų skaičių
3. Žemiau rasite neseniai gautų taškų sąrašą

### Prizų užsakymas
1. Eikite į "Prizai" skyrių
2. Peržiūrėkite galimus prizus
3. Pasirinkite norimą prizą
4. Patikrinkite, ar turite pakankamai taškų
5. Spauskite "Užsisakyti"
6. Palaukite administratoriaus patvirtinimo

### Istorijos peržiūra
1. Eikite į "Istorija" skyrių
2. Čia rasite:
   - Visą taškų gavimo istoriją
   - Prizų užsakymų istoriją
   - Kiekvieno įrašo datą ir aprašymą

## Dažnos problemos ir sprendimai

### Nepavyksta prisijungti
- Patikrinkite el. pašto adresą ir slaptažodį
- Įsitikinkite, kad interneto ryšys veikia
- Kreipkitės į administratorių

### Neatsiskaito taškai
- Palaukite kelių minučių - sistema gali būti užimta
- Atnaujinkite puslapį
- Kreipkitės į dėstytoją ar administratorių

### Negaliu užsisakyti prizo
- Patikrinkite, ar turite pakankamai taškų
- Įsitikinkite, kad prizas dar prieinamas
- Patikrinkite internetо ryšį

## Palaikymas

Jei kyla klausimų ar problemų:
1. Pirmiausia perskaitykite D.U.K. skyrių
2. Peržiūrėkite taisykles
3. Kreipkitės į savo dėstytoją
4. Rašykite administratoriui

## Sistemos atnaujinimai

Sistema reguliariai atnaujinama:
- Pridedami nauji prizai
- Tobulinama funkcionalumo dalis
- Taisomos klaidos
- Atnaujinamas turinys

Apie svarbius atnaujinimus informuojama el. paštu arba per pamokas.
