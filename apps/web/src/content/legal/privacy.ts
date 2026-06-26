// Privacy Policy for MSK Forms (forms.msk-scripts.de). Plain Markdown strings
// rendered by lib/legal.ts — no backticks, no ${ } in the text.

export const privacy = {
  en: `# Privacy Policy

*Last updated: June 2026*

## Privacy at a Glance

### General Information

The following notices provide a simple overview of what happens to your personal data when you use **MSK Forms** at **forms.msk-scripts.de**. Personal data is any data that can be used to personally identify you.

MSK Forms is a hosted platform that lets Discord servers (guilds) build forms and review the resulting submissions. Two roles are important throughout this policy: **we** operate the platform, and the **guild operators** decide which forms to publish and what data to collect from their applicants (see "Roles and Responsibilities" below).

### What rights do you have?

You have the right at any time to obtain information free of charge about the origin, recipients, and purpose of your stored personal data, as well as the right to have this data corrected or deleted. You can contact us at any time regarding this and other questions.

---

## Hosting

We host MSK Forms with the following provider:

**netcup GmbH**, Daimlerstraße 25, D-76185 Karlsruhe, Germany

When you use the service, netcup, acting as a processor, automatically records information transmitted by your browser in server log files: browser type and version, operating system used, referrer URL, hostname of the accessing computer, time of the server request, and the IP address. This data is not merged with other data sources.

**Legal basis:** the legitimate interest in the technically error-free provision and security of our service (Art. 6(1)(f) GDPR). We have concluded a data processing agreement (DPA) with the provider. The server, the database, and all uploaded files are located within the **European Union**.

---

## General Information and Mandatory Information

### Data Protection

We take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.

### Notice Regarding the Responsible Party

The party responsible for the operation of the platform is:

**Moritz Kohm**
c/o Impressumservice Dein-Impressum
Stettiner Str. 41
35410 Hungen
Germany

Email: [info@msk-scripts.de](mailto:info@msk-scripts.de)

### Roles and Responsibilities

- For **platform and account data** (your Discord login, billing, technical operation), MSK Scripts is the controller.
- For the **content of forms and submissions**, the **guild operator** who created the form is responsible (controller) and decides which data is collected. We process that data on their behalf in order to provide the platform. Guild operators must inform their own applicants about this processing.

### Data Protection Officer

There is no statutory obligation for us to appoint a data protection officer. For questions regarding data protection, please contact us directly using the contact details above.

### Storage Period

Unless a more specific storage period is mentioned, your personal data remains with us until the purpose of the data processing no longer applies, or until you (or, for submissions, the relevant guild operator) delete it.

### Revocation of Your Consent

Many data processing operations are only possible with your explicit consent. You can revoke a consent you have already given at any time. The legality of the data processing carried out until the revocation remains unaffected.

### Right to Object (Art. 21 GDPR)

IF DATA PROCESSING IS BASED ON ART. 6(1)(E) OR (F) GDPR, YOU HAVE THE RIGHT AT ANY TIME TO OBJECT TO THE PROCESSING OF YOUR PERSONAL DATA ON GROUNDS RELATING TO YOUR PARTICULAR SITUATION; THIS ALSO APPLIES TO PROFILING BASED ON THESE PROVISIONS. IF YOU OBJECT, WE WILL NO LONGER PROCESS YOUR PERSONAL DATA CONCERNED, UNLESS WE CAN DEMONSTRATE COMPELLING LEGITIMATE GROUNDS FOR THE PROCESSING THAT OVERRIDE YOUR INTERESTS, RIGHTS, AND FREEDOMS, OR THE PROCESSING SERVES THE ESTABLISHMENT, EXERCISE, OR DEFENCE OF LEGAL CLAIMS (ART. 21(1) GDPR).

### Right to Lodge a Complaint

In the event of violations of the GDPR, you have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your habitual residence, place of work, or the place of the alleged violation.

### Further Rights

You have the right to data portability, to information, correction, and deletion, and to restriction of processing, within the framework of the applicable statutory provisions. You can contact us at any time for this purpose.

### SSL / TLS Encryption

For security reasons, this service uses SSL/TLS encryption. You can recognise an encrypted connection by the "https://" prefix and the lock icon in your browser's address bar.

---

## Data We Process

### Login and Account (Discord OAuth)

To use the dashboard you log in with **Discord** (OAuth scopes: identify, email, guilds). After authorisation, Discord transmits your Discord user ID, username, avatar, email address, and the list of servers you are a member of. We store your **Discord user ID, username, avatar, email address, and language preference** to operate your account, determine which servers you can manage, send you status notifications, and display your name to your team.

Your session is maintained with an encrypted, httpOnly cookie. **Legal basis:** Art. 6(1)(b) GDPR (provision of the service).

### Form Submissions

When a form is submitted, we store the **answers** the applicant provided, together with metadata (submission timestamp, status, status history, internal notes and public messages from reviewers, and — for quizzes — a score). The answers may contain personal data that the **guild operator chose to ask for**; the operator is responsible for that choice (see "Roles and Responsibilities").

Each submission is reachable via a private link containing a random identifier (UUID). Anyone who has the link can view that submission's status page and use the self-service actions on it. The link is the access capability — handle it appropriately.

For logged-in applicants, we additionally store the Discord identity needed to send status direct messages and (on acceptance) to grant a role. **Anonymous** submissions (public forms, no login) carry no Discord identity. **Legal basis:** Art. 6(1)(b) GDPR (provision of the service) and the guild operator's respective legal basis for the application itself.

### File Uploads

If a form contains a file, image, or signature field, the uploaded file is stored on our server (S3-compatible storage within the EU) under a random key. Files are served back only through the application as downloads. **Legal basis:** Art. 6(1)(b) GDPR.

### Discord Bot

The MSK Forms bot is a multi-tenant bot that a guild can invite. To provide its functions it stores Discord identifiers for the guild, its members and forms, posts form and review messages to channels you configure, and sends status direct messages to applicants who logged in with Discord. **Legal basis:** Art. 6(1)(f) GDPR (providing the requested bot functionality) and Art. 6(1)(b) GDPR.

### Subscription Payments (Stripe)

Paid plans (Pro, Enterprise) are processed via **Stripe** (Stripe Payments Europe, Ltd.). You enter your name, billing address, email, and payment details directly with Stripe. We do **not** receive or store your card details; we only store the **Stripe customer and subscription IDs** and your plan to provide the service. Stripe Privacy Policy: [stripe.com/privacy](https://stripe.com/privacy). **Legal basis:** Art. 6(1)(b) GDPR.

### Captcha (Cloudflare Turnstile)

Public forms may be protected by **Cloudflare Turnstile**, a privacy-friendly captcha. When active, your browser loads a script from Cloudflare and Turnstile assesses whether the request is automated. We only receive a pass/fail token; the assessment is performed by Cloudflare. Cloudflare Privacy Policy: [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/). **Legal basis:** Art. 6(1)(f) GDPR (protection against spam and abuse).

### Abuse Prevention (Rate Limiting)

To protect public endpoints (such as form submission and file upload) from automated abuse, the server temporarily processes your IP address in a short-lived in-memory/Redis counter to count requests within a time window. This counter is not used for profiling or tracking and is discarded after the window elapses. **Legal basis:** Art. 6(1)(f) GDPR (security and availability).

### Live Status Updates

The status page can update live via a WebSocket connection so applicants see status changes without refreshing. This connection transmits only the technical information required to deliver updates for the specific submission. **Legal basis:** Art. 6(1)(f) GDPR.

### Custom Domains (Pro and above)

If a guild configures a custom domain, the domain name is stored in our database and an Apache virtual host plus a free Let's Encrypt SSL certificate are set up. Your domain name may appear in public **Certificate Transparency** logs as part of standard Web PKI. A guild may optionally store its **own Discord OAuth and Cloudflare Turnstile credentials** for its domain; secret values are stored **encrypted** and are never displayed again. **Legal basis:** Art. 6(1)(b) and (f) GDPR.

### What We Do NOT Do

- We do **not** use tracking cookies, analytics services, or advertising technologies.
- We do **not** receive or store your payment card details.
- We do **not** read your Discord messages beyond what the service requires to function (e.g. the slash commands you run and the channels you configure).

---

## Legal Bases for Processing

| Processing activity | Legal basis |
|---|---|
| Discord login, account, sessions | Art. 6(1)(b) GDPR — provision of the service |
| Form submissions, files, status workflow | Art. 6(1)(b) GDPR — provision of the service |
| Discord bot functionality | Art. 6(1)(b) and (f) GDPR |
| Subscription processing (Stripe) | Art. 6(1)(b) GDPR — provision of the service |
| Captcha (Turnstile) | Art. 6(1)(f) GDPR — spam/abuse prevention |
| Rate limiting | Art. 6(1)(f) GDPR — security and availability |
| Web server logs | Art. 6(1)(f) GDPR — security and operation |

---

## Cookies and Local Storage

We only use technically necessary cookies — there is **no** tracking and **no** cookie consent banner is required.

| Name | Purpose | Duration |
|---|---|---|
| Session cookie | Keeps you logged in (encrypted, httpOnly) | Session / until logout |
| OAuth state cookie | CSRF protection during the Discord login flow | A few minutes |
| **NEXT_LOCALE** | Stores your chosen display language | 1 year |
| A/B test cookie (per form) | Keeps an A/B variant assignment stable for an applicant | Limited |
| Turnstile cookie | Set by Cloudflare when the captcha is active | Per Cloudflare |

The browser's local storage may hold non-personal UI preferences (e.g. light/dark theme). **Legal basis:** Art. 6(1)(b) GDPR (technically necessary) and Art. 6(1)(f) GDPR (consistent language/UI preference).

---

## Web Server Logs

Our server automatically records access logs containing: IP address, date and time, URL accessed, HTTP status code, and browser/client type. These are used for security and operational purposes and are automatically deleted after a maximum of **14 days**. **Legal basis:** Art. 6(1)(f) GDPR.

---

## Storage Period

| Data | Storage period |
|---|---|
| Server access logs | 14 days |
| Account data (Discord ID, username, avatar, email, language) | Until account/data deletion |
| Form submissions, answers, status history | Until deleted by the applicant or the guild operator, or the form is deleted |
| Uploaded files (file/image/signature) | Together with the submission |
| Stripe references (customer/subscription IDs, plan) | Until the subscription ends and account data is deleted |
| Session / OAuth state cookies | Session / a few minutes |
| Language cookie (NEXT_LOCALE) | 1 year (or until cleared) |
| Rate-limiting counters | Short rolling window |
| Custom domain + (encrypted) per-guild credentials | Until removed |

When the bot is removed from a server and the subscription has ended, we may delete the associated data.

---

## Data Transfer to Third Countries

- **Discord** (Discord Netherlands B.V. / Discord Inc., USA): processing Discord identities necessarily involves Discord. Where data is transferred to the USA, this is based on Standard Contractual Clauses. See [discord.com/privacy](https://discord.com/privacy).
- **Stripe** (Ireland): subscription payments are processed within the EU; transfers to its US parent are based on Standard Contractual Clauses. See [stripe.com/privacy](https://stripe.com/privacy).
- **Cloudflare** (USA): when the Turnstile captcha is active. Transfers are based on Standard Contractual Clauses. See [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/).

Our server, database, and all uploaded files are stored within the **European Union**.

---

## Your Rights Under the GDPR

As a data subject, you have the following rights:

- **Right of access** (Art. 15 GDPR)
- **Right to rectification** (Art. 16 GDPR)
- **Right to erasure** (Art. 17 GDPR)
- **Right to restriction** (Art. 18 GDPR)
- **Right to data portability** (Art. 20 GDPR)
- **Right to object** (Art. 21 GDPR)
- **Right to lodge a complaint** with the competent supervisory authority

**Applicant self-service:** if you submitted a form, you can exercise the core rights yourself directly on your status page, using only your submission link and without logging in — you can **withdraw**, **export** (as JSON), or **delete** your submission. Deleting also removes any files you uploaded.

To exercise your rights regarding account or platform data, contact: [info@msk-scripts.de](mailto:info@msk-scripts.de). For data contained in a specific application, the **guild operator** that runs the form is the primary point of contact; we will support you in reaching them. We process requests within **30 days**.

---

## Changes to This Privacy Policy

We reserve the right to update this privacy policy to reflect changes to our service or applicable law. The current version is always available at this URL. The date above indicates the last update.`,

  de: `# Datenschutzerklärung

*Zuletzt aktualisiert: Juni 2026*

## Datenschutz auf einen Blick

### Allgemeine Hinweise

Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie **MSK Forms** unter **forms.msk-scripts.de** nutzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

MSK Forms ist eine gehostete Plattform, mit der Discord-Server (Guilds) Formulare erstellen und die eingehenden Einreichungen prüfen können. Zwei Rollen sind in dieser Erklärung durchgehend wichtig: **wir** betreiben die Plattform, und die **Guild-Betreiber** entscheiden, welche Formulare sie veröffentlichen und welche Daten sie von ihren Bewerbern erheben (siehe „Rollen und Verantwortlichkeiten").

### Welche Rechte haben Sie?

Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten sowie ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen können Sie sich jederzeit an uns wenden.

---

## Hosting

Wir hosten MSK Forms beim folgenden Anbieter:

**netcup GmbH**, Daimlerstraße 25, D-76185 Karlsruhe, Deutschland

Wenn Sie den Dienst nutzen, erfasst netcup als Auftragsverarbeiter automatisch von Ihrem Browser übermittelte Informationen in Server-Logfiles: Browsertyp und -version, verwendetes Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und die IP-Adresse. Diese Daten werden nicht mit anderen Datenquellen zusammengeführt.

**Rechtsgrundlage:** das berechtigte Interesse an der technisch fehlerfreien Bereitstellung und Sicherheit unseres Dienstes (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag (AVV). Der Server, die Datenbank und alle hochgeladenen Dateien befinden sich innerhalb der **Europäischen Union**.

---

## Allgemeine Hinweise und Pflichtinformationen

### Datenschutz

Wir nehmen den Schutz Ihrer personenbezogenen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

### Hinweis zur verantwortlichen Stelle

Verantwortlich für den Betrieb der Plattform ist:

**Moritz Kohm**
c/o Impressumservice Dein-Impressum
Stettiner Str. 41
35410 Hungen
Deutschland

E-Mail: [info@msk-scripts.de](mailto:info@msk-scripts.de)

### Rollen und Verantwortlichkeiten

- Für **Plattform- und Kontodaten** (Ihre Discord-Anmeldung, Abrechnung, technischer Betrieb) ist MSK Scripts verantwortlich.
- Für den **Inhalt von Formularen und Einreichungen** ist der **Guild-Betreiber** verantwortlich, der das Formular erstellt hat, und entscheidet, welche Daten erhoben werden. Wir verarbeiten diese Daten in seinem Auftrag, um die Plattform bereitzustellen. Guild-Betreiber müssen ihre eigenen Bewerber über diese Verarbeitung informieren.

### Datenschutzbeauftragter

Wir sind nicht gesetzlich verpflichtet, einen Datenschutzbeauftragten zu bestellen. Bei Fragen zum Datenschutz wenden Sie sich bitte direkt an die oben genannten Kontaktdaten.

### Speicherdauer

Soweit keine speziellere Speicherdauer genannt ist, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck der Datenverarbeitung entfällt oder bis Sie (bzw. bei Einreichungen der jeweilige Guild-Betreiber) sie löschen.

### Widerruf Ihrer Einwilligung

Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Eine bereits erteilte Einwilligung können Sie jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt unberührt.

### Widerspruchsrecht (Art. 21 DSGVO)

WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH EINZULEGEN; DIES GILT AUCH FÜR EIN AUF DIESE BESTIMMUNGEN GESTÜTZTES PROFILING. LEGEN SIE WIDERSPRUCH EIN, WERDEN WIR IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITEN, ES SEI DENN, WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG NACHWEISEN, DIE IHRE INTERESSEN, RECHTE UND FREIHEITEN ÜBERWIEGEN, ODER DIE VERARBEITUNG DIENT DER GELTENDMACHUNG, AUSÜBUNG ODER VERTEIDIGUNG VON RECHTSANSPRÜCHEN (ART. 21 ABS. 1 DSGVO).

### Beschwerderecht

Im Falle von Verstößen gegen die DSGVO steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu, insbesondere im Mitgliedstaat Ihres Aufenthaltsorts, Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.

### Weitere Rechte

Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen das Recht auf Datenübertragbarkeit, auf Auskunft, Berichtigung und Löschung sowie auf Einschränkung der Verarbeitung. Hierzu können Sie sich jederzeit an uns wenden.

### SSL-/TLS-Verschlüsselung

Aus Sicherheitsgründen nutzt dieser Dienst eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie am „https://"-Präfix und am Schloss-Symbol in der Adresszeile Ihres Browsers.

---

## Welche Daten wir verarbeiten

### Anmeldung und Konto (Discord OAuth)

Zur Nutzung des Dashboards melden Sie sich mit **Discord** an (OAuth-Scopes: identify, email, guilds). Nach der Autorisierung übermittelt Discord Ihre Discord-Benutzer-ID, Ihren Benutzernamen, Avatar, Ihre E-Mail-Adresse und die Liste der Server, in denen Sie Mitglied sind. Wir speichern Ihre **Discord-Benutzer-ID, Ihren Benutzernamen, Avatar, Ihre E-Mail-Adresse und Ihre Spracheinstellung**, um Ihr Konto zu betreiben, zu bestimmen, welche Server Sie verwalten können, Ihnen Statusbenachrichtigungen zu senden und Ihrem Team Ihren Namen anzuzeigen.

Ihre Sitzung wird über ein verschlüsseltes, httpOnly-Cookie aufrechterhalten. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Dienstes).

### Formular-Einreichungen

Beim Absenden eines Formulars speichern wir die vom Bewerber gemachten **Antworten** samt Metadaten (Zeitstempel der Einreichung, Status, Statusverlauf, interne Notizen und öffentliche Nachrichten der Prüfer sowie — bei Quizzen — eine Punktzahl). Die Antworten können personenbezogene Daten enthalten, nach denen der **Guild-Betreiber zu fragen entschieden hat**; für diese Wahl ist der Betreiber verantwortlich (siehe „Rollen und Verantwortlichkeiten").

Jede Einreichung ist über einen privaten Link mit einer zufälligen Kennung (UUID) erreichbar. Wer den Link besitzt, kann die Status-Seite dieser Einreichung einsehen und die dortigen Selbstbedienungsfunktionen nutzen. Der Link ist der Zugangsschlüssel — behandeln Sie ihn entsprechend.

Bei angemeldeten Bewerbern speichern wir zusätzlich die Discord-Identität, die zum Versand von Status-Direktnachrichten und (bei Annahme) zur Rollenvergabe erforderlich ist. **Anonyme** Einreichungen (öffentliche Formulare, ohne Anmeldung) enthalten keine Discord-Identität. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Dienstes) sowie die jeweilige Rechtsgrundlage des Guild-Betreibers für die Bewerbung selbst.

### Datei-Uploads

Enthält ein Formular ein Datei-, Bild- oder Signaturfeld, wird die hochgeladene Datei auf unserem Server (S3-kompatibler Speicher innerhalb der EU) unter einem zufälligen Schlüssel gespeichert. Dateien werden ausschließlich über die Anwendung als Download zurückgeliefert. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO.

### Discord-Bot

Der MSK-Forms-Bot ist ein mandantenfähiger Bot, den eine Guild einladen kann. Zur Bereitstellung seiner Funktionen speichert er Discord-Kennungen für die Guild, ihre Mitglieder und Formulare, postet Formular- und Prüf-Nachrichten in von Ihnen konfigurierte Kanäle und sendet Status-Direktnachrichten an Bewerber, die sich mit Discord angemeldet haben. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Bereitstellung der gewünschten Bot-Funktionalität) und Art. 6 Abs. 1 lit. b DSGVO.

### Abo-Zahlungen (Stripe)

Kostenpflichtige Tarife (Pro, Enterprise) werden über **Stripe** (Stripe Payments Europe, Ltd.) abgewickelt. Sie geben Ihren Namen, Ihre Rechnungsadresse, E-Mail und Zahlungsdaten direkt bei Stripe ein. Wir erhalten und speichern **keine** Kartendaten; wir speichern lediglich die **Stripe-Kunden- und Abo-IDs** sowie Ihren Tarif, um den Dienst bereitzustellen. Stripe-Datenschutzerklärung: [stripe.com/privacy](https://stripe.com/privacy). **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO.

### Captcha (Cloudflare Turnstile)

Öffentliche Formulare können durch **Cloudflare Turnstile** geschützt sein, ein datenschutzfreundliches Captcha. Wenn aktiv, lädt Ihr Browser ein Skript von Cloudflare und Turnstile beurteilt, ob die Anfrage automatisiert ist. Wir erhalten lediglich ein Pass-/Fail-Token; die Beurteilung erfolgt durch Cloudflare. Cloudflare-Datenschutzerklärung: [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/). **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Schutz vor Spam und Missbrauch).

### Missbrauchsschutz (Rate Limiting)

Zum Schutz öffentlicher Endpunkte (etwa Formular-Absenden und Datei-Upload) vor automatisiertem Missbrauch verarbeitet der Server Ihre IP-Adresse vorübergehend in einem kurzlebigen In-Memory-/Redis-Zähler, um Anfragen innerhalb eines Zeitfensters zu zählen. Dieser Zähler wird nicht für Profiling oder Tracking verwendet und nach Ablauf des Fensters verworfen. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Sicherheit und Verfügbarkeit).

### Live-Statusaktualisierungen

Die Status-Seite kann sich über eine WebSocket-Verbindung live aktualisieren, damit Bewerber Statusänderungen ohne Neuladen sehen. Diese Verbindung überträgt nur die technischen Informationen, die zur Auslieferung von Aktualisierungen für die jeweilige Einreichung erforderlich sind. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO.

### Eigene Domains (ab Pro)

Konfiguriert eine Guild eine eigene Domain, wird der Domainname in unserer Datenbank gespeichert und ein Apache-VirtualHost sowie ein kostenloses Let's-Encrypt-SSL-Zertifikat eingerichtet. Ihr Domainname kann im Rahmen der standardmäßigen Web-PKI in öffentlichen **Certificate-Transparency**-Logs erscheinen. Eine Guild kann optional ihre **eigenen Discord-OAuth- und Cloudflare-Turnstile-Zugangsdaten** für ihre Domain hinterlegen; geheime Werte werden **verschlüsselt** gespeichert und nie erneut angezeigt. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b und f DSGVO.

### Was wir NICHT tun

- Wir verwenden **keine** Tracking-Cookies, Analyse-Dienste oder Werbetechnologien.
- Wir erhalten und speichern **keine** Zahlungskartendaten.
- Wir lesen Ihre Discord-Nachrichten **nicht** über das hinaus, was der Dienst zum Funktionieren benötigt (z. B. die von Ihnen ausgeführten Slash-Befehle und die von Ihnen konfigurierten Kanäle).

---

## Rechtsgrundlagen der Verarbeitung

| Verarbeitung | Rechtsgrundlage |
|---|---|
| Discord-Anmeldung, Konto, Sitzungen | Art. 6 Abs. 1 lit. b DSGVO — Bereitstellung des Dienstes |
| Formular-Einreichungen, Dateien, Status-Workflow | Art. 6 Abs. 1 lit. b DSGVO — Bereitstellung des Dienstes |
| Discord-Bot-Funktionalität | Art. 6 Abs. 1 lit. b und f DSGVO |
| Abo-Abwicklung (Stripe) | Art. 6 Abs. 1 lit. b DSGVO — Bereitstellung des Dienstes |
| Captcha (Turnstile) | Art. 6 Abs. 1 lit. f DSGVO — Spam-/Missbrauchsschutz |
| Rate Limiting | Art. 6 Abs. 1 lit. f DSGVO — Sicherheit und Verfügbarkeit |
| Server-Logs | Art. 6 Abs. 1 lit. f DSGVO — Sicherheit und Betrieb |

---

## Cookies und lokaler Speicher

Wir verwenden ausschließlich technisch notwendige Cookies — es findet **kein** Tracking statt und ein Cookie-Consent-Banner ist nicht erforderlich.

| Name | Zweck | Dauer |
|---|---|---|
| Session-Cookie | Hält Sie angemeldet (verschlüsselt, httpOnly) | Sitzung / bis zur Abmeldung |
| OAuth-State-Cookie | CSRF-Schutz während des Discord-Logins | Wenige Minuten |
| **NEXT_LOCALE** | Speichert Ihre gewählte Anzeigesprache | 1 Jahr |
| A/B-Test-Cookie (pro Formular) | Hält die A/B-Varianten-Zuordnung für einen Bewerber stabil | Begrenzt |
| Turnstile-Cookie | Von Cloudflare gesetzt, wenn das Captcha aktiv ist | Gemäß Cloudflare |

Der lokale Speicher des Browsers kann nicht-personenbezogene UI-Einstellungen enthalten (z. B. helles/dunkles Design). **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (technisch notwendig) und Art. 6 Abs. 1 lit. f DSGVO (konsistente Sprach-/UI-Einstellung).

---

## Server-Logfiles

Unser Server erfasst automatisch Zugriffs-Logs mit: IP-Adresse, Datum und Uhrzeit, aufgerufener URL, HTTP-Statuscode und Browser-/Client-Typ. Diese werden zu Sicherheits- und Betriebszwecken verwendet und automatisch nach spätestens **14 Tagen** gelöscht. **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO.

---

## Speicherdauer

| Daten | Speicherdauer |
|---|---|
| Server-Zugriffs-Logs | 14 Tage |
| Kontodaten (Discord-ID, Benutzername, Avatar, E-Mail, Sprache) | Bis zur Konto-/Datenlöschung |
| Formular-Einreichungen, Antworten, Statusverlauf | Bis zur Löschung durch Bewerber oder Guild-Betreiber bzw. Löschung des Formulars |
| Hochgeladene Dateien (Datei/Bild/Signatur) | Zusammen mit der Einreichung |
| Stripe-Referenzen (Kunden-/Abo-IDs, Tarif) | Bis zum Ende des Abos und Löschung der Kontodaten |
| Session-/OAuth-State-Cookies | Sitzung / wenige Minuten |
| Sprach-Cookie (NEXT_LOCALE) | 1 Jahr (oder bis zur Löschung) |
| Rate-Limiting-Zähler | Kurzes rollierendes Fenster |
| Eigene Domain + (verschlüsselte) Guild-Zugangsdaten | Bis zur Entfernung |

Nachdem der Bot von einem Server entfernt wurde und das Abonnement beendet ist, können wir die zugehörigen Daten löschen.

---

## Datenübermittlung in Drittländer

- **Discord** (Discord Netherlands B.V. / Discord Inc., USA): Die Verarbeitung von Discord-Identitäten erfolgt notwendigerweise über Discord. Soweit Daten in die USA übermittelt werden, erfolgt dies auf Grundlage von Standardvertragsklauseln. Siehe [discord.com/privacy](https://discord.com/privacy).
- **Stripe** (Irland): Abo-Zahlungen werden innerhalb der EU verarbeitet; Übermittlungen an die US-Muttergesellschaft erfolgen auf Grundlage von Standardvertragsklauseln. Siehe [stripe.com/privacy](https://stripe.com/privacy).
- **Cloudflare** (USA): wenn das Turnstile-Captcha aktiv ist. Übermittlungen erfolgen auf Grundlage von Standardvertragsklauseln. Siehe [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/).

Unser Server, die Datenbank und alle hochgeladenen Dateien werden innerhalb der **Europäischen Union** gespeichert.

---

## Ihre Rechte nach der DSGVO

Als betroffene Person haben Sie folgende Rechte:

- **Auskunftsrecht** (Art. 15 DSGVO)
- **Recht auf Berichtigung** (Art. 16 DSGVO)
- **Recht auf Löschung** (Art. 17 DSGVO)
- **Recht auf Einschränkung** (Art. 18 DSGVO)
- **Recht auf Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruchsrecht** (Art. 21 DSGVO)
- **Beschwerderecht** bei der zuständigen Aufsichtsbehörde

**Selbstbedienung für Bewerber:** Wenn Sie ein Formular abgesendet haben, können Sie die zentralen Rechte selbst direkt auf Ihrer Status-Seite ausüben — allein mit Ihrem Einreichungslink und ohne Anmeldung: Sie können Ihre Einreichung **widerrufen**, **exportieren** (als JSON) oder **löschen**. Beim Löschen werden auch von Ihnen hochgeladene Dateien entfernt.

Zur Ausübung Ihrer Rechte bezüglich Konto- oder Plattformdaten wenden Sie sich an: [info@msk-scripts.de](mailto:info@msk-scripts.de). Für Daten innerhalb einer konkreten Bewerbung ist der **Guild-Betreiber**, der das Formular betreibt, der primäre Ansprechpartner; wir unterstützen Sie dabei, ihn zu erreichen. Anfragen bearbeiten wir innerhalb von **30 Tagen**.

---

## Änderungen dieser Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um Änderungen unseres Dienstes oder der geltenden Rechtslage Rechnung zu tragen. Die aktuelle Version ist stets unter dieser URL verfügbar. Das oben genannte Datum gibt den Stand der letzten Aktualisierung an.`,
};
