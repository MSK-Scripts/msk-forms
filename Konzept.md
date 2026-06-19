# MSK Forms — Konzept

> **Status:** Planned / New Script
> **Brand:** MSK Scripts | Musiker15
> **Typ:** Eigenständige Web-Anwendung (SaaS) + Discord-Bot
> **Erstellt:** 2026-06-19
> **Autor:** Moritz Kohm (musiker15)

---

## Inhaltsverzeichnis

1. [Vision & Elevator Pitch](#1-vision--elevator-pitch)
2. [Problemstellung & Marktlücke](#2-problemstellung--marktlücke)
3. [Zielgruppen & Personas](#3-zielgruppen--personas)
4. [Kernfeatures (Überblick)](#4-kernfeatures-überblick)
5. [User Stories & Flows](#5-user-stories--flows)
6. [Form-Builder im Detail](#6-form-builder-im-detail)
7. [Feld-Typen (Field Types)](#7-feld-typen-field-types)
8. [Logik, Bedingungen & Verzweigungen](#8-logik-bedingungen--verzweigungen)
9. [Das Dashboard](#9-das-dashboard)
10. [Feedback-Loop & Bewerbungsstatus](#10-feedback-loop--bewerbungsstatus)
11. [Discord-Bot](#11-discord-bot)
12. [Branding & Customizing](#12-branding--customizing)
13. [Internationalisierung (i18n)](#13-internationalisierung-i18n)
14. [Technische Architektur](#14-technische-architektur)
15. [Datenbank-Schema](#15-datenbank-schema)
16. [API-Design](#16-api-design)
17. [Authentifizierung & Autorisierung](#17-authentifizierung--autorisierung)
18. [Security-Konzept](#18-security-konzept)
19. [DSGVO & Datenschutz](#19-dsgvo--datenschutz)
20. [Benachrichtigungen & Integrationen](#20-benachrichtigungen--integrationen)
21. [Monetarisierung & Pläne](#21-monetarisierung--pläne)
22. [Design-System (MSK)](#22-design-system-msk)
23. [Infrastruktur & Deployment](#23-infrastruktur--deployment)
24. [Skalierung & Performance](#24-skalierung--performance)
25. [Analytics & Reporting](#25-analytics--reporting)
26. [Roadmap & Phasen (MVP → V2)](#26-roadmap--phasen-mvp--v2)
27. [Risiken & offene Fragen](#27-risiken--offene-fragen)
28. [Namens-, Domain- & Branding-Vorschläge](#28-namens-domain--branding-vorschläge)
29. [Glossar](#29-glossar)
30. [GitHub-Repository & CI/CD](#30-github-repository--cicd)

---

## 1. Vision & Elevator Pitch

**MSK Forms** ist eine moderne, funktionsreiche Form- & Bewerbungs-Plattform — wie Google Forms oder Microsoft Forms, aber im modernen Gewand, mit besserem UI, mehr Features und vor allem einem echten **Feedback-Loop**: Bewerber sehen den Status ihrer Einreichung (z. B. *angenommen* / *abgelehnt* / *in Bearbeitung*) auf genau der Seite wieder, auf der sie das Formular ausgefüllt haben.

Die Plattform richtet sich an **FiveM-Communities, Discord-Server, Gaming-Clans, Vereine und kleine Unternehmen**, die Bewerbungen, Umfragen, Support-Anfragen oder Anmeldungen professionell verwalten wollen — ohne auf generische, langweilige Tools angewiesen zu sein.

Ein zentrales Alleinstellungsmerkmal: Eine **Guild kann einen Discord-Bot einfach auf ihren Server einladen**, der die Plattform tief mit Discord verzahnt (Rollen-Sync, Status-Benachrichtigungen, Embed-Posts, Slash-Commands).

> **One-Liner:** „Google Forms, neu gedacht — mit echtem Bewerbungs-Feedback und nativer Discord-Integration, im MSK-Design."

---

## 2. Problemstellung & Marktlücke

### Probleme bestehender Lösungen

| Tool | Schwächen |
|---|---|
| **Google Forms** | Veraltetes UI, keine echte Status-Rückmeldung an Einreicher, kein Branding, keine Discord-Integration, schwache Logik |
| **Microsoft Forms** | An M365-Ökosystem gebunden, kein Custom-Branding, kein Self-Hosting, keine Bewerbungs-Pipelines |
| **Typeform** | Teuer, Limits im Free-Tier, kein Discord-Fokus, kein Bewerbungs-Status-Loop |
| **Tally / Fillout** | Modern, aber kein Discord-Bot, kein Gaming-/FiveM-Fokus, kein Status-Tracking für Bewerber |
| **Discord-eigene Bewerbungsbots** | Bewerbung läuft komplett im Chat ab → unübersichtlich, keine schöne UI, keine Historie, schlechtes mobiles Erlebnis |

### Die Lücke, die MSK Forms füllt

1. **Bewerbungs-Status-Loop** — Bewerber reicht ein, Management entscheidet, Bewerber sieht das Ergebnis auf derselben Seite (UUID-Link).
2. **Native Discord-Integration** — Bot einladen, fertig. Rollen, Benachrichtigungen, Slash-Commands.
3. **Modernes, anpassbares UI** — Branding, Farben, Logo, eigene Domain (CNAME).
4. **Gaming/FiveM-Community-Fokus** — die Zielgruppe, die Moritz ohnehin bedient (MSK Scripts, Ticketbot).
5. **Faire Monetarisierung** — Free-Tier großzügig, Pro/Hosted für Power-User.

---

## 3. Zielgruppen & Personas

### Persona A — „Der Server-Owner" (Guild Admin)
- Betreibt einen FiveM-Server oder eine Discord-Community (50–5.000 Mitglieder).
- Will Whitelist-Bewerbungen, Team-Bewerbungen (Polizei, Medic, Gang), Support-Tickets, Events organisieren.
- Technisch mittel-versiert, will eine fertige Lösung ohne Coding.
- **Pain:** Bewerbungen per Discord-Ticket sind chaotisch, keine Übersicht, kein Archiv.

### Persona B — „Der Bewerber" (Applicant)
- Möchte sich bewerben (Whitelist, Team), Umfrage ausfüllen.
- Will wissen: *Ist meine Bewerbung angekommen? Wurde sie bearbeitet? Angenommen?*
- Nutzt überwiegend das **Handy**.
- **Pain:** Nach dem Absenden hört man nie wieder etwas; kein Status, kein Feedback.

### Persona C — „Der Reviewer" (Management/Staff)
- Bewertet eingehende Bewerbungen, vergibt Status, hinterlässt interne Notizen.
- Will Filter, Sortierung, Massenaktionen, Templates für Antworten.
- **Pain:** Muss zwischen Discord, Google Sheets und Notizen hin- und herspringen.

### Persona D — „Der Vereins-/KMU-Nutzer"
- Verein, Musikgruppe, kleiner Betrieb (Montageservice o. ä.).
- Anmeldungen, Kontaktformulare, Feedback-Umfragen, Terminbuchungen.
- Braucht DSGVO-Konformität, eigenes Branding, kein Discord nötig (optional).

---

## 4. Kernfeatures (Überblick)

### Form-Erstellung
- Drag-&-Drop Form-Builder mit Live-Vorschau.
- 25+ Feld-Typen (Text, Choice, File-Upload, Rating, Date, Signature …).
- Conditional Logic (Verzweigungen, Skip-Logic, Show/Hide).
- Multi-Page / Multi-Step-Formulare mit Fortschrittsanzeige.
- Validierung (Pflichtfelder, Regex, Min/Max, Datei-Typen).
- Vorlagen-Bibliothek (Whitelist, Team-Bewerbung, Umfrage, Kontakt …).

### Verteilung
- Öffentlicher Share-Link (kurze URL + QR-Code).
- Embed (iframe / Web-Component) für eigene Websites.
- Discord-Post via Bot (Button „Jetzt bewerben").
- Zugangsbeschränkung (Discord-Login, Passwort, Zeitfenster, Limit).

### Auswertung & Management
- Dashboard mit 4 Tabs (siehe [§9](#9-das-dashboard)).
- Einreichungs-Tabelle mit Filtern, Suche, Sortierung, Tags.
- Status-Pipeline (Kanban-artig: Neu → In Prüfung → Angenommen / Abgelehnt).
- Interne Notizen & Kommentare pro Einreichung.
- Massenaktionen (Status setzen, exportieren, löschen).
- Export (CSV, XLSX, JSON, PDF pro Einreichung).

### Feedback-Loop
- UUID-Link pro Einreichung → Bewerber sieht Live-Status.
- Status-Updates lösen Benachrichtigungen aus (Discord-DM, E-Mail, In-App).
- Optionale öffentliche Begründung / Reviewer-Nachricht.

### Discord-Bot
- Einladbar pro Guild (OAuth2 + Bot-Invite).
- Slash-Commands, Status-DMs, Rollen-Sync bei Annahme, Embed-Posts.

### Branding
- Logo, Farben, Schriften, eigene Domain (CNAME), Custom CSS (Pro).

---

## 5. User Stories & Flows

### 5.1 Story: Whitelist-Bewerbung (FiveM-Server)

1. Owner erstellt im Dashboard ein Formular „Whitelist-Bewerbung" aus einer Vorlage.
2. Owner verknüpft seine Guild (Discord-Bot bereits eingeladen) und wählt Rolle „Whitelisted", die bei Annahme vergeben wird.
3. Owner postet das Formular via Bot in `#bewerbungen` (Embed + Button).
4. Bewerber klickt Button → landet auf `forms.msk-scripts.de/f/<slug>` → loggt sich mit Discord ein.
5. Bewerber füllt mehrseitiges Formular aus → sendet ab.
6. System erzeugt **UUID-Link** `…/s/<uuid>` → Bewerber wird dorthin weitergeleitet („Deine Bewerbung ist eingegangen — Status: In Prüfung").
7. Reviewer sieht Einreichung im Dashboard (Tab „Guild Filled out Forms"), prüft, setzt Status „Angenommen", schreibt optionale Nachricht.
8. System:
   - aktualisiert UUID-Seite live → Bewerber sieht „✅ Angenommen".
   - sendet Discord-DM an Bewerber.
   - vergibt automatisch die Rolle „Whitelisted" auf dem Server.
9. Bewerber sieht den Status auch in seinem eigenen User-Dashboard (Tab „User Filled out Forms").

### 5.2 Story: Anonyme Umfrage (Verein)

1. Nutzer erstellt Umfrage, deaktiviert Login-Pflicht (anonym).
2. Teilt QR-Code im Vereinsheim.
3. Antworten landen aggregiert im Dashboard mit Charts.
4. Kein Status-Loop nötig (Umfrage-Modus statt Bewerbungs-Modus).

### 5.3 Story: Bewerber prüft Status später

1. Bewerber öffnet sein User-Dashboard (`forms.msk-scripts.de/me`).
2. Tab „User Filled out Forms" listet alle eigenen Einreichungen über alle Guilds.
3. Klick → UUID-Seite mit aktuellem Status & Reviewer-Nachricht.

---

## 6. Form-Builder im Detail

### Aufbau
- **Linke Spalte:** Feld-Palette (drag-bare Bausteine, gruppiert: Eingabe, Auswahl, Medien, Layout, Spezial).
- **Mitte:** Canvas mit der Form-Live-Vorschau (WYSIWYG), Felder per Drag-&-Drop sortierbar.
- **Rechte Spalte:** Eigenschaften-Panel des selektierten Feldes (Label, Beschreibung, Pflicht, Validierung, Logik, Breite).
- **Top-Bar:** Form-Name, Speichern (Autosave), Vorschau-Modus (Desktop/Mobile), Veröffentlichen, Versionierung.

### Eigenschaften pro Formular
- Titel, Beschreibung, Cover-Bild/Banner.
- Modus: **Bewerbung** (mit Status-Loop) | **Umfrage** (aggregiert) | **Kontakt** | **Quiz** (mit Bewertung/Punkten).
- Sichtbarkeit: Öffentlich / Nur eingeloggt / Passwort / Discord-Rolle erforderlich.
- Limits: Max. Anzahl Einreichungen gesamt, max. pro Nutzer, Öffnungs-/Schließzeit.
- Bestätigungs-Verhalten: Redirect zu UUID-Seite, Custom-Nachricht, Redirect-URL.
- Sprache & Übersetzungen (siehe [§13](#13-internationalisierung-i18n)).

### Komfort-Funktionen
- **Autosave** + Versionierung (Wiederherstellen früherer Stände).
- **Duplizieren** von Feldern, Seiten, ganzen Formularen.
- **Sektionen / Seiten** (Multi-Step) mit Drag-Reorder.
- **Vorlagen speichern** (eigene Templates für Wiederverwendung).
- **Import/Export** von Form-Definition als JSON.
- **Theme-Vorschau** direkt im Builder (mit Branding der Guild).

---

## 7. Feld-Typen (Field Types)

### Eingabe
| Typ | Beschreibung |
|---|---|
| `short_text` | Einzeiliges Textfeld |
| `long_text` | Mehrzeiliges Textfeld (Textarea) |
| `email` | E-Mail mit Format-Validierung |
| `number` | Zahl mit Min/Max/Step |
| `phone` | Telefonnummer (Ländervorwahl) |
| `url` | URL-Validierung |
| `password` | Maskierte Eingabe (selten, z. B. Zugangscode) |

### Auswahl
| Typ | Beschreibung |
|---|---|
| `single_choice` | Radio-Buttons / Dropdown (eine Antwort) |
| `multi_choice` | Checkboxen (mehrere Antworten, Min/Max wählbar) |
| `dropdown` | Klassisches Select |
| `multi_select` | Tag-/Multi-Select mit Suche |
| `yes_no` | Boolean-Toggle |
| `ranking` | Optionen in Reihenfolge bringen |
| `matrix` | Matrix/Tabelle (Zeilen × Spalten, Likert) |

### Bewertung
| Typ | Beschreibung |
|---|---|
| `rating_stars` | Sterne-Bewertung (1–5/1–10) |
| `nps` | Net Promoter Score (0–10) |
| `slider` | Schieberegler (Range) |
| `emoji_scale` | Emoji-Skala (Stimmung) |

### Medien
| Typ | Beschreibung |
|---|---|
| `file_upload` | Datei(en) hochladen (Typ/Größe limitierbar) |
| `image_upload` | Bild-Upload mit Vorschau |
| `signature` | Unterschrift (Canvas) |

### Spezial / Gaming
| Typ | Beschreibung |
|---|---|
| `date` / `time` / `datetime` | Datum/Zeit-Picker |
| `address` | Strukturierte Adresse |
| `country` | Länderauswahl |
| `discord_user` | Auto-gefüllt aus Discord-Login (read-only) |
| `steam_hex` / `fivem_id` | FiveM-spezifische Identifier mit Format-Check |
| `age_check` | Altersbestätigung / Mindestalter |
| `consent` | DSGVO-Einwilligung (Pflicht-Checkbox + Link) |
| `captcha` | Bot-Schutz (hCaptcha/Turnstile) |

### Layout (keine Eingabe)
| Typ | Beschreibung |
|---|---|
| `section_break` | Neue Seite/Sektion |
| `heading` | Überschrift |
| `paragraph` | Erklärtext / Markdown |
| `image_block` | Statisches Bild |
| `divider` | Trennlinie |
| `spacer` | Abstand |

> Jeder Feld-Typ besitzt: `id`, `label`, `description`, `placeholder`, `required`, `validation`, `conditional_logic`, `width` (full/half/third), `default_value`.

---

## 8. Logik, Bedingungen & Verzweigungen

### Conditional Logic
- **Show/Hide:** Feld nur zeigen, wenn Bedingung erfüllt (`Wenn Feld X = „Ja" → zeige Feld Y`).
- **Skip Logic:** Bei Multi-Step zu bestimmter Seite springen abhängig von Antwort.
- **Required-Logic:** Feld nur unter Bedingung zur Pflicht machen.
- **Berechnete Felder:** Werte aus anderen Feldern berechnen (z. B. Quiz-Punkte, Summen).

### Operatoren
`equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`, `in_list`.

### Logik-Beispiel (Pseudostruktur)
```jsonc
{
  "field": "interesse_polizei",
  "rules": [
    {
      "when": { "field": "abteilung", "op": "equals", "value": "polizei" },
      "action": "show"
    }
  ]
}
```

### Quiz/Scoring-Modus
- Punkte pro Antwort, automatische Auswertung, Schwellenwert für „bestanden".
- Optional: Auto-Annahme bei Score ≥ X (Automation, siehe [§20](#20-benachrichtigungen--integrationen)).

---

## 9. Das Dashboard

> Basierend auf der ursprünglichen Idee: **UUID-Link wird generiert und in einem User-Dashboard angezeigt. Dashboard mit mehreren Tabs.**

### Tab 1 — „Change Guild" (Guild-Wechsler)
- Auswahl/Umschalten zwischen verknüpften Discord-Guilds (für die der Nutzer Admin/Manager-Rechte hat).
- Anzeige: Guild-Icon, Name, Mitgliederzahl, Anzahl offener Bewerbungen.
- Button „+ Neue Guild verbinden" → Discord-OAuth + Bot-Invite-Flow.
- Rollen-/Berechtigungs-Mapping pro Guild (wer darf was, siehe [§17](#17-authentifizierung--autorisierung)).

### Tab 2 — „Manage Guild Forms" (Formulare verwalten)
- Liste aller Formulare der aktiven Guild (Status: Entwurf, Live, Geschlossen, Archiviert).
- Aktionen: Erstellen, Bearbeiten (Builder), Duplizieren, Veröffentlichen, Schließen, Löschen.
- Pro Formular: Share-Link, QR, Embed-Code, „In Discord posten".
- Statistik-Kacheln: Aufrufe, Einreichungen, Conversion-Rate, ⌀ Bearbeitungszeit.

### Tab 3 — „Guild Filled out Forms" (Eingegangene Bewerbungen)
- **Management-Sicht:** alle Einreichungen für die Formulare der Guild.
- Ansichten: **Tabelle** (Filter/Sortier/Suche) & **Kanban** (Status-Pipeline).
- Spalten: Bewerber (Discord-Avatar+Name), Formular, Datum, Status, Tags, Reviewer.
- Detail-Drawer: alle Antworten, interne Notizen, Status-Verlauf, Aktionen (Annehmen/Ablehnen/Zurückstellen, Nachricht senden, Rolle vergeben).
- Massenaktionen & Export.

### Tab 4 — „User Filled out Forms" (Eigene Einreichungen)
- **Bewerber-Sicht:** alle vom eingeloggten Nutzer abgesendeten Formulare — guild-übergreifend.
- Pro Eintrag: Formularname, Guild, Datum, **aktueller Status**, Reviewer-Nachricht.
- Klick → UUID-Status-Seite (`/s/<uuid>`).
- Filter nach Status (Offen / Angenommen / Abgelehnt).

### Globale Dashboard-Elemente
- Sidebar-Navigation, Topbar mit Guild-Switcher & Profil.
- Suchleiste (Cmd+K), Benachrichtigungs-Glocke.
- Responsive (mobil voll nutzbar).

---

## 10. Feedback-Loop & Bewerbungsstatus

> Das Herzstück und USP: **Der Bewerber sieht das Ergebnis auf derselben Seite, auf der er das Formular ausgefüllt hat.**

### Status-Modell (anpassbar pro Guild/Formular)
Standard-Pipeline:
1. `submitted` — Eingegangen
2. `in_review` — In Prüfung
3. `on_hold` — Zurückgestellt / Wartet auf Rückfrage
4. `accepted` — Angenommen
5. `rejected` — Abgelehnt
6. `withdrawn` — Vom Bewerber zurückgezogen

- **Custom-Status** erlaubt (eigene Stufen, Farben, ob für Bewerber sichtbar).
- Jeder Status-Wechsel wird im **Audit-Log** mit Reviewer, Zeit, optionaler Nachricht festgehalten.

### UUID-Status-Seite (`/s/<uuid>`)
- Öffentlich erreichbar nur mit der UUID (unguessbar, optional zusätzlich Login-Bindung).
- Zeigt:
  - Status-Badge (mit MSK-Farben, Animation bei Update).
  - Timeline des Bearbeitungsverlaufs (öffentliche Schritte).
  - Reviewer-Nachricht (falls freigegeben).
  - Eingereichte Antworten (read-only, optional editierbar bei „Rückfrage").
  - Aktion „Bewerbung zurückziehen" (falls erlaubt).
- **Live-Update** via WebSocket/SSE — kein Reload nötig.

### Rückfragen-Mechanik (optional)
- Reviewer kann Status `needs_info` setzen + Frage stellen.
- Bewerber sieht Frage auf UUID-Seite, kann antworten/ergänzen → zurück in die Pipeline.

---

## 11. Discord-Bot

> **Kernanforderung:** „Ein Discord Bot soll auch dabei sein, den eine Guild einfach auf ihren Server einladen kann."

### Einladung & Setup
1. Owner klickt im Dashboard „Guild verbinden" → Discord-OAuth2 (`guilds`, `identify`, `bot`, `applications.commands` Scopes).
2. Bot wird mit nötigen Permissions eingeladen (Rollen verwalten, Nachrichten senden, Embeds, DMs).
3. Setup-Wizard: Standard-Kanäle festlegen (Bewerbungs-Posts, Log-Kanal), Rollen-Mapping, Manager-Rollen.

### Bot-Funktionen

#### Slash-Commands
| Command | Funktion |
|---|---|
| `/forms post <formular>` | Postet ein Formular als Embed mit „Bewerben"-Button im aktuellen Kanal |
| `/forms list` | Listet aktive Formulare der Guild |
| `/forms status <uuid>` | Zeigt Status einer Einreichung (für Staff) |
| `/forms close <formular>` | Schließt ein Formular |
| `/forms setup` | Startet/öffnet den Setup-Wizard (Link zum Dashboard) |
| `/forms stats` | Kurzstatistik (Einreichungen, offen, Conversion) |

#### Interaktionen
- **Bewerben-Button** unter Embed → öffnet den Form-Link (ggf. mit vorausgefüllter Discord-Identität).
- **Review-Buttons** in einem internen Kanal: `✅ Annehmen` / `❌ Ablehnen` / `🔎 Im Dashboard öffnen` direkt unter der Benachrichtigung einer neuen Einreichung.

#### Automatisierungen
- **Neue Einreichung** → Embed in den Review-Kanal (mit Antworten-Vorschau & Action-Buttons).
- **Status „Angenommen"** → automatische Rollen-Vergabe + Glückwunsch-DM.
- **Status „Abgelehnt"** → DM mit (optionaler) Begründung, optional Cooldown bis zur nächsten Bewerbung.
- **Reminder** → Staff-Ping bei zu lange offenen Bewerbungen (SLA).

#### DM-Benachrichtigungen an Bewerber
- Eingang bestätigt, Status-Updates, Rückfragen — jeweils mit Link zur UUID-Seite.
- Respektiert „DMs geschlossen" → Fallback auf In-App/E-Mail.

### Technische Architektur des Bots
- **Sprache:** Node.js (discord.js v14) — passt zum bestehenden MSK-Discord-Bot-Stack.
- **Modell:** Ein **zentraler Multi-Tenant-Bot** (ein Bot-Account, viele Guilds) — NICHT pro Kunde gehostet, da Forms-Bot rein API-getrieben ist.
  - Unterschied zum Ticketbot (`/opt/customer_ticketbots/<guild_id>/`): Forms-Bot ist global, skaliert über Sharding.
- Kommuniziert mit dem Web-Backend über interne API (HTTP + Webhooks + Message-Queue für Events).
- **Sharding** für >2.500 Guilds (discord.js ShardingManager).
- Slash-Commands global registriert, Guild-spezifische Config in DB.

---

## 12. Branding & Customizing

> „Es wäre natürlich anpassbar bezüglich Farben, Sprache und allem anderen."

### Pro Guild/Workspace einstellbar
- **Logo & Favicon** (Upload).
- **Banner/Cover** für Formulare.
- **Farbschema:** Primär-/Akzentfarbe, Hintergrund (Light/Dark/MSK-Dark), Border-Radius.
- **Schriften:** Auswahl kuratierter Fonts (inkl. MSK-Defaults Syne/Space Mono/DM Sans).
- **Eigene Domain (CNAME):** `forms.deine-community.de` → zeigt auf MSK-Forms (wie msk-shop Custom-Domain-Feature). Auto-TLS via Let's Encrypt.
- **Eigene Domain für Status-Seiten** ebenso.
- **Custom CSS** (Pro/Enterprise) für Feinschliff.
- **Eigener Absender** für E-Mails (verifizierte Domain / DKIM) — Pro.
- **„Powered by MSK Forms"** Badge → entfernbar ab Pro.
- **Custom Confirmation/Redirect**, Custom 404, Custom Mail-Templates.

### Theme-Tokens (technisch)
- CSS-Variablen-basiert (siehe [§22](#22-design-system-msk)), pro Workspace überschreibbar, serverseitig in DB gespeichert, zur Render-Zeit injiziert (Nonce-CSP-kompatibel).

---

## 13. Internationalisierung (i18n)

### Plattform-UI
- Mehrsprachige Oberfläche (Start: **Deutsch, Englisch**; erweiterbar).
- Sprachdateien (i18n-Keys, JSON), `next-intl` o. ä.
- Spracherkennung via Browser + manueller Umschalter.

### Formular-Inhalte
- Form-Ersteller kann pro Feld **Übersetzungen** hinterlegen.
- Bewerber sieht das Formular in seiner Sprache (Fallback auf Default-Sprache).
- RTL-Support vorbereitet (Arabisch/Hebräisch) — spätere Phase.

### Discord-Bot
- Bot-Antworten/Embeds lokalisiert (Discord-Locale des Nutzers + Guild-Default).

---

## 14. Technische Architektur

### Stack-Empfehlung (konsistent mit MSK-Ökosystem)

| Schicht | Technologie | Begründung |
|---|---|---|
| **Frontend/SSR** | Next.js 16 (App Router), TypeScript | Neueste Major für neues Projekt (msk-shop läuft auf 15.5 — Versions-Konsistenz bei geteiltem Code prüfen) |
| **Styling** | Tailwind CSS 3 + CSS-Variablen | MSK-Design-System, Theming |
| **State** | Zustand 5 | Wie msk-shop (Builder-State, leichte Stores) |
| **Form-Builder** | dnd-kit (Drag & Drop), react-hook-form + zod (Runtime-Forms) | Robust, performant |
| **Datenbank** | MariaDB (mysql2) ODER PostgreSQL | MariaDB = Konsistenz; PostgreSQL = JSONB-Vorteile für flexible Antworten (Empfehlung: **PostgreSQL** wegen JSONB & Volltextsuche) |
| **ORM/Query** | Prisma | Schema-Migrationen, Typsicherheit (Prisma-MCP bereits im Setup) |
| **Realtime** | WebSocket / SSE (z. B. via dediziertem Node-Service oder Pusher/Soketi self-hosted) | Live-Status-Updates |
| **Queue/Events** | BullMQ (Redis) | Bot-Events, Mails, Webhooks asynchron |
| **Cache** | Redis | Sessions, Rate-Limits, Hot-Data |
| **Object Storage** | S3-kompatibel (MinIO self-hosted oder Nextcloud) | Datei-Uploads |
| **Bot** | Node.js + discord.js v14 (eigener Prozess, PM2) | Multi-Tenant, Sharding |
| **Auth** | Discord OAuth2 + Session (iron-session / NextAuth) | Discord-zentriert |
| **Mail** | Nodemailer + eigener SMTP / Postfix auf Debian | DSGVO, eigene Infra |
| **Reverse Proxy** | Apache2 (vorhanden) | MSK-Infra, kein Nginx |
| **Process Manager** | PM2 (systemd-Service `pm2-musiker15`) | Wie bestehende Bots |
| **CI/CD** | GitHub Actions → SSH Deploy | Wie msk-shop |

### Service-Topologie
```
                    ┌────────────────────────┐
   Bewerber/Owner → │  Apache2 (Reverse Proxy)│  forms.msk-scripts.de + Custom-Domains
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────────┐
              ▼                 ▼                     ▼
      ┌──────────────┐  ┌──────────────┐      ┌──────────────┐
      │ Next.js App  │  │ Realtime-Svc │      │  Discord-Bot │
      │ (SSR + API)  │  │  (WS/SSE)    │      │ (discord.js) │
      └──────┬───────┘  └──────┬───────┘      └──────┬───────┘
             │                 │                     │
             └───────┬─────────┴───────────┬─────────┘
                     ▼                      ▼
            ┌──────────────┐        ┌──────────────┐
            │ PostgreSQL   │        │   Redis      │
            │ (Daten)      │        │ (Queue/Cache)│
            └──────────────┘        └──────────────┘
                     │
              ┌──────────────┐
              │ S3 / MinIO   │  (Datei-Uploads)
              └──────────────┘
```

### Monorepo-Vorschlag
```
msk-forms/
├── apps/
│   ├── web/            ← Next.js (Dashboard, Builder, Public Forms, Status-Seiten)
│   ├── bot/            ← discord.js Bot (Sharding, Slash-Commands)
│   └── realtime/       ← WS/SSE-Service (oder in web integriert)
├── packages/
│   ├── db/             ← Prisma Schema, Migrations, Client
│   ├── shared/         ← Typen, zod-Schemas, Form-Definition-Spec
│   ├── ui/             ← Geteilte React-Komponenten (MSK-Design-System)
│   └── i18n/           ← Übersetzungen
├── .github/workflows/  ← CI/CD
├── docker-compose.yml  ← lokale Dev (Postgres, Redis, MinIO)
└── Konzept.md
```
> Tooling: **pnpm Workspaces** + **Turborepo** für schnelle Builds.

---

## 15. Datenbank-Schema

> Vereinfachtes relationales Modell (PostgreSQL). Flexible Antworten als JSONB.

### Tabellen (Auszug)

**`users`**
| Spalte | Typ | Notiz |
|---|---|---|
| id | uuid PK | |
| discord_id | varchar unique | |
| username, avatar | varchar | aus Discord |
| email | varchar nullable | optional |
| locale | varchar | UI-Sprache |
| created_at | timestamptz | |

**`guilds`** (verbundene Discord-Server / Workspaces)
| Spalte | Typ | Notiz |
|---|---|---|
| id | uuid PK | |
| discord_guild_id | varchar unique | |
| name, icon | varchar | |
| owner_user_id | uuid FK→users | |
| plan | enum(free,pro,enterprise) | |
| branding | jsonb | Farben, Logo, Fonts |
| custom_domain | varchar nullable | CNAME |
| bot_config | jsonb | Kanäle, Rollen-Mapping |
| created_at | timestamptz | |

**`guild_members`** (Berechtigungen pro Guild)
| Spalte | Typ | Notiz |
|---|---|---|
| guild_id | uuid FK | |
| user_id | uuid FK | |
| role | enum(owner,admin,reviewer,viewer) | |

**`forms`**
| Spalte | Typ | Notiz |
|---|---|---|
| id | uuid PK | |
| guild_id | uuid FK | |
| slug | varchar unique | Public-URL-Teil |
| title, description | text | |
| mode | enum(application,survey,contact,quiz) | |
| status | enum(draft,live,closed,archived) | |
| schema | jsonb | Felddefinitionen (Form-Spec) |
| settings | jsonb | Limits, Sichtbarkeit, Confirmation |
| theme | jsonb | Override des Guild-Brandings |
| version | int | Versionierung |
| open_at, close_at | timestamptz | |
| created_by | uuid FK | |
| created_at, updated_at | timestamptz | |

**`form_versions`** (Snapshot-Historie von `schema`/`settings`)

**`submissions`**
| Spalte | Typ | Notiz |
|---|---|---|
| id | uuid PK | = **UUID-Link** |
| form_id | uuid FK | |
| guild_id | uuid FK | denormalisiert für Filter |
| user_id | uuid FK nullable | null bei anonym |
| answers | jsonb | { field_id: value } |
| status | varchar | aktueller Status-Key |
| score | int nullable | Quiz |
| meta | jsonb | IP-Hash, UA, Locale, Referrer |
| submitted_at | timestamptz | |
| updated_at | timestamptz | |

**`submission_events`** (Audit-Log / Status-Verlauf)
| Spalte | Typ | Notiz |
|---|---|---|
| id | uuid PK | |
| submission_id | uuid FK | |
| actor_user_id | uuid FK nullable | |
| type | enum(status_change,note,message,reminder,info_request) | |
| from_status, to_status | varchar | |
| message | text nullable | öffentlich/intern |
| visibility | enum(public,internal) | |
| created_at | timestamptz | |

**`form_statuses`** (Custom-Status pro Formular/Guild)
| Spalte | Typ |
|---|---|
| id, form_id/guild_id, key, label, color, order, visible_to_applicant, is_terminal |

**`files`** (Uploads)
| id, submission_id, field_id, filename, mime, size, storage_key, scanned(bool) |

**`notifications`** (In-App)
**`webhooks`** / **`integrations`** (ausgehende Integrationen)
**`api_keys`** (für Embed/REST-Zugriff)
**`audit_log`** (sicherheitsrelevante Aktionen guild-weit)

### Indizes
- `submissions(form_id, status)`, `submissions(user_id)`, `submissions(guild_id, submitted_at)`.
- GIN-Index auf `submissions.answers` & `forms.schema` (JSONB) für Suche.
- Volltext (`tsvector`) über Antworten für die Suchfunktion.

---

## 16. API-Design

### Prinzipien
- REST + JSON (ggf. später tRPC für interne Typsicherheit).
- Versioniert: `/api/v1/...`.
- Auth via Session-Cookie (Web) oder Bearer-API-Key (Embed/Bot/Integrationen).
- Konsistente Fehler (`{ error: { code, message } }`), Rate-Limiting, Idempotency-Keys bei Submits.

### Wichtige Endpunkte (Auszug)

**Öffentlich (Bewerber)**
```
GET  /api/v1/public/forms/:slug          → Form-Definition (gerendert)
POST /api/v1/public/forms/:slug/submit    → Einreichung anlegen → { submissionId(uuid) }
GET  /api/v1/public/submissions/:uuid     → Status + sichtbarer Verlauf
POST /api/v1/public/submissions/:uuid/withdraw
POST /api/v1/public/submissions/:uuid/reply   → Rückfrage beantworten
GET  /api/v1/me/submissions                → eigene Einreichungen (Tab 4)
```

**Management (Reviewer/Admin)**
```
GET    /api/v1/guilds/:gid/forms
POST   /api/v1/guilds/:gid/forms
PATCH  /api/v1/guilds/:gid/forms/:fid
POST   /api/v1/guilds/:gid/forms/:fid/publish
GET    /api/v1/guilds/:gid/submissions?status=&form=&q=&page=
PATCH  /api/v1/guilds/:gid/submissions/:sid/status   → { status, message, visibility }
POST   /api/v1/guilds/:gid/submissions/:sid/note
POST   /api/v1/guilds/:gid/submissions/:sid/assign-role
GET    /api/v1/guilds/:gid/forms/:fid/export?format=csv|xlsx|json
```

**Bot-/Intern**
```
POST /api/internal/bot/events           → Bot meldet Interaktionen (signiert, HMAC)
POST /api/internal/notify               → Web triggert Bot-DM/Embed (Queue)
```

### Realtime
```
WS  /realtime/submissions/:uuid          → Status-Push an Bewerber
WS  /realtime/guilds/:gid                → Dashboard-Live-Updates für Staff
```

---

## 17. Authentifizierung & Autorisierung

### Authentifizierung
- **Primär: Discord OAuth2** (Scopes: `identify`, `email`, `guilds`).
- Optional später: E-Mail-Magic-Link (für Nicht-Discord-Nutzer / Vereine).
- Session via verschlüsseltem Cookie (iron-session, `SESSION_SECRET` wie msk-shop), HttpOnly, Secure, SameSite=Lax.

### Autorisierungs-Modell (RBAC pro Guild)
| Rolle | Rechte |
|---|---|
| **Owner** | Alles, inkl. Billing, Guild löschen, Branding, Domains |
| **Admin** | Formulare verwalten, Bot-Config, Status-Pipeline, Mitglieder verwalten |
| **Reviewer** | Einreichungen sehen/bearbeiten, Status setzen, Notizen, Nachrichten |
| **Viewer** | Nur lesen / Exporte ansehen |
| **Applicant** | Eigene Einreichungen sehen, einreichen, zurückziehen |

- Mapping zu **Discord-Rollen**: z. B. „Discord-Rolle X = Reviewer". Synchronisiert über Bot.
- Server-seitige Prüfung bei jedem Request (kein Vertrauen auf Client).
- Datenisolierung: Strikte `guild_id`-Scoping in jeder Query (Mandantentrennung).

---

## 18. Security-Konzept

> Konsistent mit MSK-Security-Mindset (msk-shop A+ Observatory).

### Web
- **Nonce-basiertes CSP** (`'strict-dynamic'`) via `middleware.ts` — wie msk-shop.
- HSTS (2 Jahre, preload), COOP/CORP, `X-Content-Type-Options`, `Referrer-Policy`.
- Security-Header zentral in Next.js, im Apache-vhost via `Header always unset` neutralisiert (keine Duplikate).
- CSRF-Schutz (Double-Submit-Token / SameSite).
- Input-Validierung server-seitig mit **zod** (jede Submission gegen Form-Schema geprüft).
- Rate-Limiting (Redis) pro IP/User/Form — Schutz vor Spam-Submits.
- **Bot-Schutz:** hCaptcha / Cloudflare Turnstile für öffentliche Formulare.
- **File-Uploads:** Typ-Whitelist, Größenlimit, Magic-Byte-Check, AV-Scan (ClamAV) vor Freigabe, Auslieferung über separate Sandbox-Domain (kein `script`-Kontext).
- UUID-Links: kryptografisch zufällig (UUIDv4), unguessbar; sensible Formulare zusätzlich an Login gebunden.
- Output-Encoding gegen XSS (React-Default + Markdown-Sanitizing für Paragraph-Felder).

### Bot
- HMAC-signierte interne Webhooks (Bot ↔ Web).
- Discord-Interaktionen mit Ed25519-Signaturprüfung.
- Least-Privilege Bot-Permissions.

### Infra
- Secrets über `.env` (nicht im Repo), Server-seitig.
- Fail2Ban, UFW, unattended-upgrades (vorhandene Debian-Härtung).
- DB-Zugriff nur lokal/Socket, keine öffentliche Exposition.
- Backups verschlüsselt (siehe [§23](#23-infrastruktur--deployment)).

---

## 19. DSGVO & Datenschutz

> Pflicht, da personenbezogene Daten von Dritten (Bewerbern) verarbeitet werden.

- **Auftragsverarbeitung:** MSK Forms = Auftragsverarbeiter, Guild-Owner = Verantwortlicher → **AV-Vertrag (DPA)** als Vorlage bereitstellen.
- **Einwilligung:** `consent`-Feld mit Link zur Datenschutzerklärung der Guild (Pflicht bei Bewerbungs-Modus).
- **Datenminimierung:** nur erfragen, was nötig ist; IP nur gehasht/anonymisiert speichern.
- **Auskunft & Löschung:** Bewerber kann eigene Einreichungen einsehen & Löschung beantragen (Self-Service im User-Dashboard).
- **Aufbewahrungsfristen:** automatische Löschung nach X Tagen (pro Formular konfigurierbar).
- **Recht auf Datenübertragbarkeit:** Export der eigenen Daten (JSON).
- **Standort:** Hosting in der EU (Debian-Server in DE).
- **Verschlüsselung:** TLS in transit, sensible Felder optional at-rest verschlüsselt.
- **Cookie-Banner / Consent-Management** für die Plattform.
- **Auftragsverarbeiter-Liste** (Discord, ggf. Captcha-Anbieter, Mail) transparent dokumentiert.
- **Impressum & Datenschutz** der Plattform (musiker15.de / msk-scripts.de-konform).

---

## 20. Benachrichtigungen & Integrationen

### Benachrichtigungs-Kanäle
- **In-App** (Glocke + Liste).
- **Discord-DM** (über Bot) — primär.
- **E-Mail** (optional, wenn hinterlegt).
- **Discord-Kanal-Embed** (Staff-Benachrichtigung neue Einreichung).

### Auslöser (Events)
`submission.created`, `submission.status_changed`, `submission.info_requested`, `submission.replied`, `form.closed`, `sla.breached`.

### Automationen (Rule-Engine, „Wenn-Dann")
- **Trigger** (z. B. neue Einreichung) → **Bedingung** (z. B. Score ≥ 80) → **Aktion** (Status setzen, Rolle vergeben, DM senden, Webhook feuern).
- Beispiele:
  - Auto-Annahme bei Quiz ≥ Schwelle.
  - Auto-Tag „Minderjährig" wenn Alter < 18.
  - Discord-Rolle entziehen bei Ablehnung.

### Externe Integrationen (Phasenweise)
- **Webhooks** (ausgehend, generisch) — V1.
- **Discord** (nativ) — V1.
- **Zapier / Make** — V2.
- **Google Sheets Sync** — V2.
- **E-Mail-Marketing (optional)** — später.
- **REST-API + API-Keys** für eigene Anbindungen.

---

## 21. Monetarisierung & Pläne

> Freemium-Modell, fair, mit Upsell für Power-User / Communities. Abrechnung evtl. via Tebex (wie msk-shop) oder Stripe.

| Feature | **Free** | **Pro** | **Enterprise** |
|---|---|---|---|
| Formulare | 3 aktiv | unbegrenzt | unbegrenzt |
| Einreichungen/Monat | 100 | 5.000 | unbegrenzt |
| Feld-Typen | Basis | alle | alle |
| Conditional Logic | einfach | voll | voll |
| Discord-Bot | ✓ | ✓ | ✓ (+Priorität) |
| Status-Loop / Feedback | ✓ | ✓ | ✓ |
| Branding (Farben/Logo) | begrenzt | voll | voll |
| Eigene Domain (CNAME) | ✗ | ✓ | ✓ |
| Custom CSS | ✗ | ✓ | ✓ |
| „Powered by"-Badge entfernen | ✗ | ✓ | ✓ |
| Datei-Uploads | klein | groß | groß |
| Automationen | ✗ | ✓ | ✓ |
| Exporte | CSV | CSV/XLSX/JSON/PDF | + API |
| Mitglieder/Reviewer | 2 | 15 | unbegrenzt |
| Aufbewahrung | 30 Tage | konfigurierbar | konfigurierbar |
| Support | Community | Priorität | Dediziert + SLA |
| Preis (Idee) | 0 € | ~5–9 €/Monat | individuell |

- **Lifetime / One-Time** Option denkbar (passt zur FiveM-Käufermentalität).
- **Pro Guild** oder **pro Workspace** abgerechnet.
- Verkauf/Promotion über **msk-scripts.de** (eigene Landingpage), wie Multibot über top.gg.

---

## 22. Design-System (MSK)

> Durchgängig dark-themed, grüner Akzent — konsistent mit MSK-Brand.

```css
:root {
  --bg:            #0a0b0d;
  --bg-panel:      #131317;
  --bg-input:      rgba(255,255,255,0.05);
  --border:        rgba(255,255,255,0.08);
  --border-accent: rgba(0, 230, 118, 0.35);
  --accent:        #00E676;   /* MSK Grün */
  --text-primary:  #f0ede8;
  --text-secondary:#b0adb8;
  --text-muted:    #6b6b72;
  --shadow-panel:  0 8px 32px rgba(0,0,0,0.5);
  --radius-lg:     12px;
  --radius-sm:     6px;
}
```

- **Typografie:** Syne (Headlines) / DM Sans (Body) / Space Mono (Labels, UPPERCASE).
- **Icons:** FontAwesome.
- **Stil:** monospace UPPERCASE-Labels, grüne Akzente, subtile Borders, sanfte Popup-Animationen.
- **Komponenten-Bibliothek** (`packages/ui`): Button, Input, Select, Toggle, Card, Drawer, Modal, Tabs, Badge, Toast, Table, Kanban-Card, StatusBadge, FormFieldRenderer.
- **Light-Mode** als kundenseitige Option (Branding), MSK-Dark als Default.
- **Accessibility:** Kontraste WCAG AA, Fokus-States, Tastatur-Navigation, ARIA, Screenreader.
- **Responsive:** Mobile-First für öffentliche Formulare & User-Dashboard (Bewerber sind meist mobil).

---

## 23. Infrastruktur & Deployment

### Server
- Debian + **Apache2** (Reverse Proxy, kein Nginx).
- Pfad-Vorschlag (Server): `/opt/msk-forms/` (Web), `/opt/msk-forms-bot/` (Bot).
- **PM2** (systemd-Service, User `musiker15`) für Web (Next.js standalone), Bot, Realtime, Worker.
- **PostgreSQL** + **Redis** lokal.
- **MinIO** (S3-kompatibel) oder Nextcloud für Uploads.
- TLS via Let's Encrypt (auch Wildcard für Custom-Domains / SAN-Automatik).

### Apache-vhost
- `forms.msk-scripts.de` → Proxy auf Next.js (Port intern).
- Custom-Domains (CNAME der Kunden) → gleicher vhost / dynamisches TLS (mod_md oder Certbot-Automatik).
- Security-Header im vhost via `Header always unset` neutralisiert (Next.js setzt sie selbst).

### CI/CD
- GitHub Actions → Build → SSH-Deploy → `pm2 reload`.
- Migrationen (`prisma migrate deploy`) im Deploy-Schritt.
- Zero-Downtime via PM2 `reload`.
- Separate Stages: `dev` (lokal Docker), `staging`, `production`.

### Backups
- Tägliche verschlüsselte DB-Dumps (pg_dump) → Nextcloud/offsite.
- Datei-Storage-Backups.
- Restore-Runbook dokumentiert.

### Monitoring
- Uptime-Checks, PM2-Metriken, Error-Tracking (Sentry self-hosted oder Glitchtip), strukturierte Logs.

---

## 24. Skalierung & Performance

- **Stateless Web-Layer** → horizontal skalierbar (mehrere PM2-Instanzen / Cluster-Mode).
- **Redis** für Sessions/Cache/Rate-Limit (shared state).
- **Queue (BullMQ)** entkoppelt Mails/Bot-DMs/Webhooks von Request-Zyklus.
- **DB-Indizes** & Connection-Pooling (PgBouncer bei Bedarf).
- **CDN** für statische Assets (oder Apache mit Caching-Headern).
- **Bot-Sharding** ab ~2.500 Guilds.
- **Pagination & Lazy-Loading** in Tabellen.
- **Edge-Caching** öffentlicher Form-Definitionen (immutable per Version).
- Lasttest-Ziel: 100 gleichzeitige Submits/s ohne Degradation (MVP-Ziel niedriger).

---

## 25. Analytics & Reporting

### Für Form-Owner
- **Funnel:** Aufrufe → Start → Abschluss (Drop-off pro Feld/Seite).
- **Conversion-Rate**, ⌀ Ausfüllzeit, Geräte/Browser, Referrer.
- **Status-Verteilung** (wie viele angenommen/abgelehnt), ⌀ Bearbeitungsdauer (SLA-Reporting).
- **Antwort-Aggregation** (Charts für Choice/Rating/NPS), Wortwolken für Freitext.
- Export von Reports (PDF/CSV).

### Plattform-intern (für Moritz)
- Aktive Guilds, Plan-Verteilung, MRR, Bot-Guilds, Top-Formulare.
- Privacy-freundliches Analytics (Plausible/Umami self-hosted, kein Google Analytics).

---

## 26. Roadmap & Phasen (MVP → V2)

### Phase 0 — Foundation (Setup)
- Monorepo, Prisma-Schema, Auth (Discord OAuth), Design-System-Grundlage, CI/CD, Apache-vhost.

### Phase 1 — MVP
- Form-Builder (Kern-Feldtypen: Text, Choice, Multi-Choice, Date, File, Consent).
- Öffentliche Form-Seite + Submit + **UUID-Status-Seite**.
- Dashboard mit den **4 Tabs** (Change Guild, Manage Forms, Guild Submissions, User Submissions).
- Status-Pipeline (Standard-Status) + interne Notizen.
- **Discord-Bot:** Invite-Flow, `/forms post`, neue-Einreichung-Embed, Status-DM, Rollen-Vergabe bei Annahme.
- Basis-Branding (Farben, Logo), Deutsch/Englisch.
- Security-Hardening (CSP, Rate-Limit, Captcha), DSGVO-Basics (Consent, Löschung).

### Phase 2 — Pro-Features
- Conditional Logic & Multi-Step, weitere Feldtypen (Rating, NPS, Matrix, Signature).
- Custom-Status, Kanban-Ansicht, Massenaktionen, Exporte (XLSX/PDF).
- Custom-Domain (CNAME), Custom CSS, „Powered by" entfernen.
- Automationen (Rule-Engine), Webhooks.
- Realtime-Live-Updates (WS/SSE) flächendeckend.
- Billing (Tebex/Stripe), Pläne.

### Phase 3 — Scale & Ecosystem
- Quiz/Scoring, Berechnete Felder, A/B-Tests von Formularen.
- Zapier/Make, Google-Sheets-Sync, öffentliche REST-API.
- Template-Marktplatz (Community-Vorlagen), Theme-Marktplatz.
- Mehr Sprachen, RTL.
- Mobile-App / PWA-Optimierung.
- FiveM-In-Game-Anbindung (optional: msk_core-Bridge — Bewerbung im Spiel sichtbar/auslösbar).

---

## 27. Risiken & offene Fragen

### Risiken
| Risiko | Gegenmaßnahme |
|---|---|
| **Spam/Missbrauch** öffentlicher Formulare | Captcha, Rate-Limit, Discord-Login-Pflicht-Option |
| **DSGVO-Haftung** (Dritt-Daten) | DPA-Vorlage, EU-Hosting, Löschkonzept, Rechtsberatung |
| **Discord-API-Limits / Bot-Bann** | Sharding, Rate-Limit-Handling, kein Spam, Verified Bot beantragen |
| **Skalierung der Realtime-Komponente** | SSE-Fallback, Soketi/Redis-Adapter |
| **Scope-Creep** (zu viele Features im MVP) | Strikte Phasen-Disziplin, MVP-Fokus |
| **Datei-Upload-Missbrauch** (Malware) | AV-Scan, Sandbox-Domain, Typ-Whitelist |
| **Custom-Domain-TLS-Automatik** komplex | mod_md / Certbot-Automatisierung, getestetes Runbook |

### Offene Fragen (vor Implementierung zu klären)
1. **DB-Wahl:** PostgreSQL (Empfehlung wegen JSONB) vs. MariaDB (Konsistenz mit msk-shop)? → **Entscheidung nötig.**
2. **Billing:** Tebex (vorhanden) oder Stripe (besser für SaaS-Abos)?
3. **Anonyme Bewerbungen** erlauben oder Discord-Login immer Pflicht?
4. **Multi-Tenant-Bot** vs. pro-Guild-Bot — bestätige zentralen Multi-Tenant-Ansatz.
5. **Branding-Name:** „MSK Forms" final oder eigene Marke (siehe [§28](#28-namens-domain--branding-vorschläge))?
6. **Self-Hosting für Kunden** anbieten (wie is_hosted bei Ticketbot) oder reines SaaS?
7. **FiveM-In-Game-Integration** Teil der Vision oder rein Web/Discord?
8. **E-Mail-Versand:** eigener SMTP vs. Transactional-Provider (Postmark/Resend)?

---

## 28. Namens-, Domain- & Branding-Vorschläge

### Name
- **MSK Forms** (Default, konsistent mit Brand).
- Alternativen: *FormFlow*, *Applya*, *Submitly*, *Guildforms*, *Replyo*.

### Domains
- `forms.msk-scripts.de` (Subdomain, schnell verfügbar — **Empfehlung für Start**).
- Eigene Marke: `mskforms.de`, `mskforms.com`.
- Status-/Embed-Domain für Uploads: `files.mskforms.de` (Sandbox).

### Positionierung
- Vermarktung über **msk-scripts.de** + Discord-Bot-Listen (top.gg etc., wie Multibot).
- Dokumentation unter `docu.msk-scripts.de/docs/msk_forms`.

---

## 29. Glossar

| Begriff | Bedeutung |
|---|---|
| **Guild** | Verbundener Discord-Server / Workspace in MSK Forms |
| **Form / Formular** | Definiertes Set aus Feldern (Bewerbung/Umfrage/…) |
| **Submission** | Eine Einreichung eines Bewerbers (besitzt UUID-Link) |
| **UUID-Link** | Eindeutiger, unguessbarer Link zur Status-Seite einer Submission |
| **Status-Loop** | Feedback-Mechanismus: Bewerber sieht Entscheidung am selben Ort |
| **Reviewer** | Staff-Mitglied, das Einreichungen bewertet |
| **Pipeline** | Status-Stufen einer Bewerbung (Neu → Angenommen/Abgelehnt) |
| **Branding** | Farb-/Logo-/Domain-Anpassung pro Guild |
| **Multi-Tenant** | Eine App-Instanz bedient viele Guilds isoliert |
| **Conditional Logic** | Felder/Seiten abhängig von Antworten ein-/ausblenden |
| **Embed** | Einbettung eines Formulars in eine fremde Website (iframe/Web-Component) |

---

## 30. GitHub-Repository & CI/CD

### Repository
- **Org:** `MSK-Scripts` → Repo `MSK-Scripts/msk-forms`.
- **Sichtbarkeit:** **Privat** (proprietär, kommerziell).
- **Lizenz:** Proprietär — „All Rights Reserved" ([`LICENSE`](./LICENSE)). Keine Open-Source-Lizenz, da das Produkt verkauft wird (sonst dürfte es jeder forken & weiterverkaufen). Einzelne Teile (z. B. Bot) könnten später separat quelloffen werden.
- **Default-Branch:** `main` (Production), Integrations-Branch `develop`, Feature-Branches via PR.

### Branch-Schutz (`main` & `develop`)
- PR-Pflicht, mind. 1 Review (CODEOWNERS = `@musiker15`).
- Required Status Checks: **CI** (Lint, Typecheck, Build, Test, Prisma-Validate) + **CodeQL**.
- Lineare Historie / „Squash & Merge", keine Force-Pushes, keine direkten Pushes auf `main`.
- Secrets-Scanning + Push-Protection aktiv (GitHub Advanced Security, falls verfügbar).

### Workflows (`.github/workflows/`)
| Workflow | Datei | Trigger | Zweck |
|---|---|---|---|
| **CI** | `ci.yml` | Push/PR auf `main`,`develop` | pnpm install → Prisma generate/validate/migrate → Lint → Typecheck → Test → Build. Service-Container: Postgres 16 + Redis 7 |
| **Deploy** | `deploy.yml` | Push auf `main` + manuell | SSH → Debian: `git reset`, `pnpm install --frozen`, `prisma migrate deploy`, `build`, `pm2 reload` (zero-downtime), optional Discord-Webhook-Notify |
| **CodeQL** | `codeql.yml` | Push/PR + wöchentlich | Statische Security-Analyse (JS/TS), `security-and-quality` Queries |

### Dependabot (`.github/dependabot.yml`)
- Ökosysteme: **npm/pnpm**, **github-actions**, **docker** — wöchentlich (Mo, Europe/Berlin).
- Gruppierte PRs (Minor/Patch gebündelt), Next.js/React separat, **Next.js-Major ignoriert** (manuell).

### Deploy-Secrets (Repo → Settings → Secrets, Environment `production`)
| Secret | Zweck |
|---|---|
| `DEPLOY_SSH_HOST` / `DEPLOY_SSH_USER` / `DEPLOY_SSH_PORT` | SSH-Ziel (Debian, User `musiker15`) |
| `DEPLOY_SSH_KEY` | Privater Deploy-Key (Pendant in `~/.ssh/authorized_keys`) |
| `DEPLOY_DISCORD_WEBHOOK` | (optional) Deploy-Benachrichtigung |

> Laufzeit-Secrets (`DATABASE_URL`, `DISCORD_BOT_TOKEN`, `SESSION_SECRET` …) liegen **nicht** in GitHub, sondern in der `.env` auf dem Server (`/opt/msk-forms/.env`). Vorlage: [`.env.example`](./.env.example).

### Weitere Repo-Dateien
- `README.md` — Übersicht, Badges, Stack, lokale Dev-Anleitung.
- `.gitignore` — Node/Next/Prisma/Secrets.
- `.github/CODEOWNERS` — Review-Zuständigkeit.
- `.github/pull_request_template.md` — PR-Checkliste (inkl. Security & Prisma-Migration).
- `ecosystem.config.cjs` *(folgt in Phase 0)* — PM2-Prozesse (web, bot, realtime, worker).

### Server-Voraussetzungen (einmalig, Phase 0)
1. `/opt/msk-forms` als Git-Clone (Deploy-Key mit Repo-Read-Zugriff).
2. Node 22 + `corepack enable` (pnpm), PM2 (vorhanden, User `musiker15`).
3. PostgreSQL + Redis + MinIO installiert; `.env` befüllt.
4. Apache2-vhost `forms.msk-scripts.de` → Proxy auf Next.js-Port (Security-Header via `Header always unset`).

> **Hinweis:** CI/Deploy referenzieren das Monorepo (pnpm + Turborepo). Sie greifen vollständig erst nach dem Phase-0-Scaffolding (package.json, `apps/`, `packages/`, Prisma-Schema, `ecosystem.config.cjs`).

---

> **Nächster Schritt:** Offene Fragen aus [§27](#27-risiken--offene-fragen) klären (v. a. DB-Wahl & Billing), dann Phase 0 (Foundation) aufsetzen — Repo `MSK-Scripts/msk-forms` anlegen, Monorepo scaffolden, Prisma-Schema, Discord-OAuth, Design-System.

*Konzept erstellt: 2026-06-19 — MSK Scripts | Musiker15*
