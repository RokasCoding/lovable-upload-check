# Premijos Taškų Sistema

Tai premijos taškų (lojalumo) sistema, skirta Vilniaus Coding School. Sistema leidžia administratoriui pridėti taškus vartotojams už baigtus kursus, o vartotojai gali iškeisti sukauptus taškus į prizus.

## Naudojamos Technologijos

Projektas sukurtas naudojant šias technologijas:

-   **Vite**: Greitam developinimui ir buildinimui.
-   **React**: Vartotojo sąsajos kūrimui.
-   **TypeScript**: Tipo saugumui.
-   **Tailwind CSS**: Moderniam ir greitam dizainui.
-   **shadcn/ui**: Paruošti, pritaikomi vartotojo sąsajos komponentai.
-   **Supabase**: Duomenų bazei, autentifikacijai ir saugyklai.
-   **Resend**: El. laiškų siuntimui (pvz., registracijos patvirtinimai, slaptažodžio atstatymas).

## Projekto Paleidimas Lokaliai

Norint paleisti projektą savo kompiuteryje, atlikite šiuos veiksmus:

1.  **Klonuokite repozitoriją:**
    ```sh
    git clone <JŪSŲ_GIT_URL>
    cd <PROJEKTO_PAVADINIMAS>
    ```

2.  **Įdiekite priklausomybes:**
    ```sh
    npm install
    ```

3.  **Sukonfigūruokite aplinkos kintamuosius:**
    -   Sukurkite `.env` failą projekto šakninėje direktorijoje, nukopijuodami `.env.example` turinį.
    -   Užpildykite `.env` failą savo Supabase ir Resend raktais:
        ```env
        # Supabase Konfigūracija
        VITE_SUPABASE_URL=JŪSŲ_SUPABASE_PROJEKTO_URL
        VITE_SUPABASE_ANON_KEY=JŪSŲ_SUPABASE_ANON_RAKTAS

        # Resend Konfigūracija
        VITE_RESEND_API_KEY=JŪSŲ_RESEND_API_RAKTAS

        # Aplikacijos URL
        VITE_APP_URL=http://localhost:5173
        ```

4.  **Paleiskite developinimo serverį:**
    ```sh
    npm run dev
    ```
    Aplikacija bus pasiekiama adresu `http://localhost:5173`.

## Supabase Konfigūracija

Norint, kad aplikacija veiktų, būtina teisingai sukonfigūruoti Supabase projektą.

### 1. Duomenų Bazės Lentelės ir RLS

-   **Paleiskite SQL skriptus:** Supabase projekto **SQL Editor** skiltyje paleiskite pateiktus SQL skriptus, kad sukurtumėte reikiamas lenteles (`profiles`, `bonus_entries`, `prizes`, `redemptions`) ir nustatytumėte Row Level Security (RLS) politiką.

### 2. Autentifikacija

-   **Įjunkite Email Provider:** Nueikite į **Authentication -> Providers** ir įjunkite **Email**.
-   **Konfigūruokite Redirect URLs:** Nueikite į **Authentication -> URL Configuration** ir laukelyje **Redirect URLs** pridėkite savo aplikacijos URL, pvz.:
    -   `http://localhost:5173/reset-password` (lokaliam testavimui)
    -   `https://jūsų-produkcijos-domenas.com/reset-password` (produkcijai)

## Vartotojų Valdymas

### Administratoriaus Sukūrimas

Norėdami sukurti administratorių, atlikite šiuos veiksmus:

1.  Užregistruokite naują vartotoją per aplikacijos registracijos formą.
2.  Supabase projekto **SQL Editor** skiltyje įvykdykite SQL funkciją, nurodydami naujo vartotojo ID (jį galite gauti iš **Authentication -> Users** skilties):
    ```sql
    -- Pirmiausia, vieną kartą sukurkite šią funkciją:
    CREATE OR REPLACE FUNCTION add_admin_role(user_id_to_update UUID)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      UPDATE auth.users
      SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
      WHERE id = user_id_to_update;
      RETURN 'Role updated for ' || user_id_to_update;
    END;
    $$;

    -- Tada naudokite funkciją, kad priskirtumėte rolę:
    SELECT add_admin_role('VARTOTOJO_ID_ČIA');
    ```

## Diegimas (Deployment)

Projektas yra paruoštas diegimui į **Vercel**.

1.  **Prijunkite savo Git repozitoriją** prie Vercel.
2.  **Sukonfigūruokite aplinkos kintamuosius** Vercel projekto nustatymuose (Settings -> Environment Variables). Būtina pridėti visus kintamuosius iš `.env` failo.
3.  **Pridėkite peradresavimo taisyklę:** Sukurkite `vercel.json` failą projekto šakninėje direktorijoje su šiuo turiniu, kad veiktų klientinės pusės maršrutizavimas (routing):
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/" }
      ]
    }
    ```
4.  Po `git push` į pagrindinę šaką, Vercel automatiškai įdiegs naujausią versiją.
