
# VCS Bonus CRM Sistema - Dokumentacija

## Sistemos aprašymas

VCS Bonus CRM yra taškų valdymo sistema, skirta Vilnius Coding School studentams ir administracijai. Sistema leidžia studentams kaupti taškus už mokymosi veiklą ir keisti juos į prizus.

## Sistemos architektūra

### Technologijos
- **Frontend**: React 18, TypeScript
- **UI Framework**: Tailwind CSS, Shadcn/UI
- **Maršrutizavimas**: React Router v6
- **Būsenos valdymas**: TanStack Query, Context API
- **Duomenų saugojimas**: LocalStorage (demo versija)
- **Diagramos**: Recharts
- **Ikonos**: Lucide React

### Projektų struktūra
```
src/
├── components/         # Bendri komponentai
│   ├── ui/            # Shadcn/UI komponentai
│   └── Layout.tsx     # Pagrindinis išdėstymas
├── contexts/          # React kontekstai
├── hooks/             # Custom React hooks
├── pages/             # Puslapių komponentai
├── services/          # API servisai
├── types.ts           # TypeScript tipai
└── docs/              # Dokumentacija
```

## Naudotojų tipai ir rolės

### Studentai (role: 'user')
- Gali peržiūrėti savo taškų balansą
- Gali iškeisti taškus į prizus
- Gali peržiūrėti savo istoriją
- Gali skaityti taisykles ir D.U.K.

### Administratoriai (role: 'admin')
- Visi studentų teisės
- Gali valdyti naudotojus
- Gali pridėti/atimti taškus
- Gali valdyti prizų katalogą
- Gali patvirtinti/atmesti prizų užsakymus
- Gali generuoti registracijos nuorodas
- Gali redaguoti turinį (taisykles, D.U.K.)

## Funkcionalumas pagal puslapius

### Prisijungimas (`/login`)
- El. pašto ir slaptažodžio autentifikacija
- Automatinis nukreipimas pagal rolę
- Saugus sesijos valdymas

### Pagrindinis puslapis (`/dashboard`)
- Taškų balanso rodymas
- Neseniai gautų taškų sąrašas
- Greitieji veiksmai
- Statistikos apžvalga

### Prizai (`/prizes`)
- Visų galimų prizų katalogs
- Prizų išsamūs aprašymai
- Taškų kainos
- Iškeitimo funkcionalumas
- Filtrų galimybės

### Istorija (`/history`)
- Visų taškų transakčijų istorija
- Prizų užsakymų istorija
- Filtravimas pagal datą ir tipą
- Eksportavimo galimybės

### Taisyklės (`/rules`)
- Sistemos naudojimo taisyklės
- Taškų gavimo kriterijai
- Prizų iškeitimo sąlygos
- Admin redagavimo funkcija

### D.U.K. (`/faq`)
- Dažnai užduodami klausimai
- Kategorijų sistema
- Paieškos funkcija
- Admin redagavimo funkcija

### Admin panelė (`/admin`)
- Statistikos dashboard
- Naudotojų valdymas
- Prizų katalogas
- Iškeitimų valdymas
- Naujų narių sekimas
- Nuorodų generavimas

## Administratoriaus funkcijos

### Naujų narių sekimas
- Automatinis naujų narių aptikimas (registracija per paskutines 7 dienas)
- Prizų paskyrimo sistema
- Automatinis el. laiško siuntimas (akvile.n@vilniuscoding.lt)
- Paskyrimo istorijos sekimas

### Registracijos nuorodų generavimas
```javascript
// Be taškų (kampanijoms)
https://domain.com/register?ref=abc123&points=0

// Su taškais (10 taškų už registraciją)
https://domain.com/register?ref=abc123&points=10
```

### Taškų valdymas
- Pridėti taškus bet kuriam naudotojui
- Atimti taškus (neigiami įrašai)
- Peržiūrėti pilną taškų istoriją
- Masinis taškų pridėjimas (būsima funkcija)

### Prizų katalogas
- Naujų prizų kūrimas su:
  - Pavadinimu
  - Aprašymu
  - Taškų kaina
  - Paveikslėliu (URL)
  - Aktyvumo statusu
- Esamų prizų redagavimas
- Prizų įjungimas/išjungimas

### Naudotojų valdymas
- Visų naudotojų sąrašas su:
  - Vardu ir pavarde
  - El. pašto adresu
  - Telefono numeriu
  - Sukauptais taškais
  - Registracijos data
  - Role
- Kvietimų siuntimas naujiem naudotojams
- Rolių keitimas

## Duomenų modeliai

### User (Naudotojas)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}
```

### BonusEntry (Taškų įrašas)
```typescript
interface BonusEntry {
  id: string;
  userId: string;
  userName: string;
  courseName: string;
  price: number;
  pointsAwarded: number;
  createdAt: string;
}
```

### Prize (Prizas)
```typescript
interface Prize {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### PrizeRedemption (Prizo iškeitimas)
```typescript
interface PrizeRedemption {
  id: string;
  userId: string;
  userName: string;
  prizeId: string;
  prizeName: string;
  pointCost: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  requestedAt: string;
  updatedAt?: string;
}
```

## API Servisai

### dataService.ts
Centrinė duomenų valdymo tarnyba, kuri teikia:

- `getUsers()` - Visų naudotojų gavimas
- `getUser(id)` - Konkretaus naudotojo gavimas
- `getBonusEntries(userId?)` - Taškų įrašų gavimas
- `getPrizes()` - Prizų katalogo gavimas
- `getRedemptions()` - Iškeitimų gavimas
- `getStats()` - Statistikos gavimas
- `createBonusEntry(data)` - Taškų pridėjimas
- `createPrize(data)` - Prizo kūrimas
- `inviteUser(email, name, role)` - Naudotojo kvietimas
- `processRedemption(id, status, comment?)` - Iškeitimo apdorojimas
- `redeemPrize(userId, prizeId)` - Prizo iškeitimas

## Dizaino sistema

### Spalvų paletė
```css
/* Pagrindinės spalvos */
--vcs-white: #ffffff;
--vcs-black: #020202;
--vcs-blue: #3535FF;

/* Šešėliai ir atspalviai */
--vcs-gray: #f5f5f5;
--border-color: #e0e0e0;
```

### Komponentų stiliai
- Lentelės: juodi kraštai (`.vcs-table`)
- Taškų ženkleliai: mėlyni su baltų tekstu (`.point-badge`)
- Hover efektai: mąstomas didinimas (`.hover-scale`)

### Animacijos
- `fade-in`: Ėjimo animacija puslapiams
- `hover-scale`: Didinimas užvedus
- `accordion-down/up`: Išskleidimo animacijos

## Saugumas

### Autentifikacija
- Sesijos saugojimas localStorage
- Automatinis išloginiamas po neaktyvumo
- Rolių patikrinimas kiekviename puslapyje

### Duomenų apsauga
- Administratorių funkcijų ribojimas
- Duomenų validacija visose formose
- XSS apsauga per React

## Išdiegimas ir konfigūracija

### Aplinkos kintamieji
```env
VITE_APP_NAME="VCS Bonus CRM"
VITE_API_URL="https://api.example.com"
VITE_ADMIN_EMAIL="akvile.n@vilniuscoding.lt"
```

### Projekto paleidimas
```bash
# Priklausomybių diegimas
npm install

# Kūrimo režimas
npm run dev

# Produkcijos build
npm run build

# Preview
npm run preview
```

### Išdiegimas į produkciją
```bash
# Build komanda
npm run build

# Statinio turinio įkėlimas į serverį
# dist/ folderio turinys kopijuojamas į web serverį
```

## Testavi nas

### Testavimo strategija
- Komponental testai Jest + React Testing Library
- E2E testai su Cypress
- Vizualini testai su Storybook

### Testavimo komandos
```bash
# Vienetų testai
npm run test

# E2E testai
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Klaidų valdymas

### Error Boundary
- React Error Boundary komponuojant
- Klaidų registravimas
- Graceful fallback UI

### Logging
- Console.log testavimo metu
- Error reporting produko aplinkoje
- Performance monitoring

## Našumo optimizavimas

### Code Splitting
- Lazy loading puslapių
- Komponen splitting per React.lazy
- Bundle size optimization

### Caching
- React Query cache strategija
- LocalStorage optimizaci
- Browser cache headers

## Priežiūra ir monitoringas

### Metrics
- Naudotojų aktyvumo sekimas
- Prizų išmainių statistikos
- Sistemos našumų monitoringas

### Backup
- Duomenų atsarginės kopijos
- Konfigūracijos backup
- Disaster recovery plans

## Būsimi plėtoti planai

### Trumpalaikiai tikslai (1-3 mėn.)
- Mobile responsive improvements
- Advanced filtering options
- Bulk operations for admins
- Email notification system

### Vidutiniai tikslai (3-6 mėn.)
- REST API integration
- Real-time notifications
- Advanced analytics dashboard
- Multi-language support

### Ilgalaikiai tikslai (6-12 mėn.)
- Mobile application
- Third-party integrations
- AI-powered recommendations
- Advanced reporting tools

## Pagalba ir palaikymas

### Dokumentacijos šaltiniai
- Šis README failas
- Inline code komentarai
- API documentation
- Component documentation (Storybook)

### Kontaktai
- Techninis palaikymas: akvile.n@vilniuscoding.lt
- Sistemos administratorius: [admin kontaktai]
- Devrų komanda: [dev team kontaktai]

### Troubleshooting
Žiūrėti [Dažnos problemos](#dažnos-problemos-ir-sprendimai) skyrių pagrindinėje dokumentacijoje.

## Licencija

MIT License - žiūrėti LICENSE failą projekto šakniniame aplanke.

---

*Paskutinis atnaujinimas: 2024-12-09*
*Versija: 1.0.0*
