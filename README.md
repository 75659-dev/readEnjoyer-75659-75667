# ReadEnjoyer

## Autorzy

- Oleh Dushynskyi 75659 - backend i hosting
- Danil Doshyn 75667 - frontend

## Opis projektu

ReadEnjoyer to aplikacja webowa do przeglądania, wyszukiwania i oceniania książek. Projekt jest zbudowany jako monorepo i składa się z dwóch części:

- `frontend` - aplikacja w React + TypeScript + Vite.
- `backend` - API w NestJS, które obsługuje logikę biznesową, autoryzację, bazę danych i pliki.

W projekcie używane są również:

- PostgreSQL jako baza danych.
- Prisma jako ORM i warstwa migracji.
- MinIO jako prywatne magazynowanie plików, np. obrazów okładek i avatarów.

## Środowisko hostingu

Projekt jest wdrożony na VPS typu droplet w DigitalOcean.

- [http://read-enjoyer.duckdns.org/](http://read-enjoyer.duckdns.org/)
- [http://165.245.210.238/](http://165.245.210.238/)

Taki układ został wybrany, aby aplikacja działała na własnym serwerze, z kontrolą nad backendem, bazą danych i plikami.

Logowanie przez Google działa przez przekierowanie z domeny `duckdns`, ponieważ Google nie zawsze ufa nowym, niezweryfikowanym adresom IP lub świeżym hostom. Dzięki temu redirect prowadzi przez ustalony adres, a cały proces OAuth kończy się poprawnie po stronie frontendu.

W środowisku DigitalOcean mogą występować ograniczenia dla nowych projektów dotyczące portów pocztowych. Z tego powodu wysyłka wiadomości weryfikacyjnych e-mail może nie dochodzić do użytkownika. W praktyce oznacza to, że mechanizm potwierdzenia adresu e-mail może wymagać dodatkowej konfiguracji SMTP lub innego dostawcy poczty, jeśli ma działać w pełni produkcyjnie.

## Jak projekt działa

### 1. Frontend

Frontend odpowiada za interfejs użytkownika. Pobiera dane z API i wyświetla:

- katalog książek,
- szczegóły książek,
- autorów i kategorie,
- recenzje,
- profil użytkownika,
- bibliotekę użytkownika,
- formularze logowania i rejestracji,
- podgląd obrazów zapisanych w systemie plików.

Frontend nie łączy się bezpośrednio z prywatnym MinIO. Zamiast tego generuje adresy do obrazów przez backend, na przykład:

`/files/:id`

To oznacza, że przeglądarka pobiera plik z API, a nie bezpośrednio z magazynu.

### 2. Backend

Backend w NestJS pełni rolę centralnego API. Odpowiada za:

- autoryzację i uwierzytelnianie,
- pobieranie i zapisywanie danych w PostgreSQL,
- obsługę książek, autorów, kategorii, recenzji, komentarzy i biblioteki użytkownika,
- upload plików do MinIO,
- odczyt plików z MinIO i ich strumieniowanie do klienta,
- generowanie dokumentacji Swagger.

Dzięki temu prywatny bucket MinIO nie musi być dostępny publicznie.

### 2.1. Autoryzacja

Autoryzacja w aplikacji opiera się na JWT i działa w kilku krokach:

1. Użytkownik zakłada konto przez `POST /auth/register`.
2. System zapisuje użytkownika w bazie, hashuje hasło i generuje token weryfikacyjny do e-maila.
3. Użytkownik potwierdza adres e-mail przez `GET /auth/verify-email?token=...`.
4. Po potwierdzeniu e-maila można się zalogować przez `POST /auth/login`.
5. Backend zwraca `accessToken` oraz zapisuje `refreshToken` w ciasteczku `httpOnly`.

W praktyce wygląda to tak:

- `accessToken` jest wysyłany przez frontend w nagłówku `Authorization: Bearer ...`.
- `refreshToken` jest przechowywany w ciasteczku `httpOnly`, więc nie jest dostępny dla JavaScriptu w przeglądarce.
- Gdy access token wygaśnie, frontend może odświeżyć sesję przez `POST /auth/refresh`.
- Podczas wylogowania (`POST /auth/logout`) backend usuwa zapisany refresh token z bazy i czyści ciasteczko.

Projekt obsługuje również logowanie przez Google:

- `GET /auth/google` rozpoczyna logowanie OAuth.
- `GET /auth/google/callback` kończy logowanie, tworzy lub aktualizuje konto i przekierowuje użytkownika z powrotem do frontendu.

Do ochrony wybranych endpointów używane są guardy:

- `AtGuard` dla dostępu na podstawie access tokena,
- `RtGuard` dla odświeżania sesji,
- `GoogleAuthGuard` dla logowania Google.

Po stronie bazy użytkownik ma m.in. zapisane:

- `password` jako hash,
- `verificationToken` do aktywacji konta,
- `isEmailVerified` jako status potwierdzenia e-maila,
- `hashedRt` jako hash refresh tokena,
- `googleId`, jeśli konto zostało połączone z Google.

### 3. Baza danych i Prisma

Prisma odpowiada za komunikację z PostgreSQL. W bazie przechowywane są między innymi:

- użytkownicy,
- książki,
- autorzy,
- kategorie,
- recenzje,
- komentarze,
- relacje biblioteki użytkownika.

Migracje znajdują się w katalogu `backend/prisma/migrations`. Seed danych jest dostępny w `backend/prisma/seed.ts`.

### 4. Pliki i obrazy

Obrazy okładek i avatary nie są przechowywane w bazie danych. W bazie zapisuje się jedynie identyfikator pliku, a sam plik trafia do MinIO.

Mechanizm działa tak:

- upload pliku zapisuje go do MinIO przez `PutObjectCommand`,
- w bazie zostaje tylko `fileId`,
- frontend pobiera obraz przez backendowy endpoint `/files/:id`,
- backend strumieniuje plik z MinIO do klienta.

To rozwiązanie jest bezpieczniejsze, bo użytkownik nie dostaje bezpośredniego dostępu do prywatnego bucketu.

## Główne moduły backendu

- `auth` - logowanie i autoryzacja.
- `users` - profil użytkownika i dane konta.
- `books` - zarządzanie książkami.
- `authors` - autorzy książek.
- `categories` - kategorie i filtrowanie.
- `reviews` - recenzje użytkowników.
- `comments` - komentarze.
- `user-library` - biblioteka użytkownika.
- `files` - upload i odczyt plików z MinIO.
- `search` - wyszukiwanie treści w aplikacji.
- `mail` - wysyłka wiadomości e-mail.
- `seed` - inicjalizacja danych testowych.

## Uruchomienie lokalne

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

### Docker

W projekcie są przygotowane pliki `docker-compose.yml` i `docker-compose.prod.yml`.

Uruchomienie środowiska lokalnego:

```bash
docker compose up -d --build
```

Uruchomienie wersji produkcyjnej:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Struktura projektu

```text
readEnjoyer/
├── backend/   # NestJS + Prisma + MinIO
├── frontend/  # React + Vite
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Technologia

- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: NestJS, TypeScript, Swagger.
- Baza danych: PostgreSQL.
- ORM: Prisma.
- Pliki: MinIO + AWS SDK S3.
- Uruchamianie: Docker i Docker Compose.

## Uwagi wdrożeniowe

Wersja produkcyjna zakłada:

- osobny backend na porcie API,
- frontend zbudowany do statycznych plików,
- prywatny MinIO bez bezpośredniego dostępu z przeglądarki,
- pobieranie obrazów tylko przez backendowy endpoint `/files/:id`,
- cache dla obrazów ustawiony przez nagłówek `Cache-Control`.

## Podsumowanie

Projekt działa w modelu klient-serwer. Frontend odpowiada za interfejs, backend za logikę i bezpieczeństwo, a baza PostgreSQL oraz MinIO przechowują odpowiednio dane i pliki. Dzięki proxy przez backend użytkownik nie widzi prywatnego adresu MinIO, a wszystkie pliki są dostarczane jako strumień bezpośrednio do przeglądarki.
