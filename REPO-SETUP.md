# Repo-Setup — MSK-Scripts/msk-forms

> Einmalige Schritte zum Anlegen des GitHub-Repos, Branch-Schutz und Secrets.
> Befehle für **Git Bash** (sauberes JSON via Heredoc). `gh` muss eingeloggt sein:
> `gh auth login` — Scope `repo`, `admin:org`, `workflow`.
>
> Variablen einmal setzen:
> ```bash
> ORG=MSK-Scripts
> REPO=msk-forms
> ```

---

## 0. Voraussetzungen prüfen

```bash
gh --version
gh auth status                       # eingeloggt?
gh auth refresh -s admin:org,workflow,repo   # fehlende Scopes nachholen
```

---

## 1. Lokales Git initialisieren & ersten Commit erstellen

> **Wichtig:** Commit OHNE Co-Authored-By-Trailer.

```bash
cd "/c/Users/morit/OneDrive/GitHub Repositories/FiveM Shop/msk-forms"

git init -b main
git add .
git commit -m "chore: initial repo scaffolding (Konzept, CI/CD, Lizenz)"
```

---

## 2. Repository in der Org anlegen & pushen

```bash
gh repo create "$ORG/$REPO" \
  --private \
  --source=. \
  --remote=origin \
  --push \
  --description="MSK Forms — moderne Form- & Bewerbungs-Plattform mit Status-Feedback und Discord-Bot" \
  --disable-wiki
```

`develop`-Branch anlegen:

```bash
git checkout -b develop
git push -u origin develop
git checkout main
```

---

## 3. Repo-Defaults setzen

```bash
# Squash-Merge erzwingen, andere Merge-Arten deaktivieren, Branch nach Merge löschen
gh repo edit "$ORG/$REPO" \
  --default-branch main \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false \
  --delete-branch-on-merge

# Labels für Dependabot/CI (falls noch nicht vorhanden)
gh label create dependencies -R "$ORG/$REPO" -c "#0366d6" --force
gh label create ci           -R "$ORG/$REPO" -c "#1d76db" --force
gh label create docker        -R "$ORG/$REPO" -c "#1d63ed" --force
```

---

## 4. Branch-Schutz für `main`

> Erfordert Org-Admin-Rechte. Status-Check-Namen entsprechen den **Job-Namen** in
> `ci.yml` ("Lint, Typecheck, Build & Test") und `codeql.yml` ("Analyze (javascript-typescript)").

```bash
gh api -X PUT "repos/$ORG/$REPO/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Lint, Typecheck, Build & Test",
      "Analyze (javascript-typescript)"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
JSON
```

Gleicher Schutz für `develop` (etwas lockerer — kein CODEOWNER-Zwang):

```bash
gh api -X PUT "repos/$ORG/$REPO/branches/develop/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, Typecheck, Build & Test"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": false,
    "dismiss_stale_reviews": true
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "restrictions": null
}
JSON
```

---

## 5. Security-Features aktivieren

```bash
# Secret-Scanning + Push-Protection (verhindert versehentliche Secret-Commits)
gh api -X PATCH "repos/$ORG/$REPO" \
  -H "Accept: application/vnd.github+json" \
  -f 'security_and_analysis[secret_scanning][status]=enabled' \
  -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'

# Dependabot Security-Updates aktivieren
gh api -X PUT "repos/$ORG/$REPO/automated-security-fixes" \
  -H "Accept: application/vnd.github+json"

gh api -X PUT "repos/$ORG/$REPO/vulnerability-alerts" \
  -H "Accept: application/vnd.github+json"
```

> CodeQL-Code-Scanning läuft bereits über `.github/workflows/codeql.yml` — kein
> zusätzlicher API-Call nötig. (Secret-Scanning auf privaten Repos benötigt
> GitHub Advanced Security; bei fehlender Lizenz die beiden ersten Calls überspringen.)

---

## 6. Production-Environment + Deploy-Secrets

Environment `production` anlegen (Deploy-Workflow nutzt es):

```bash
gh api -X PUT "repos/$ORG/$REPO/environments/production" \
  -H "Accept: application/vnd.github+json"
```

Deploy-Secrets als **Environment-Secrets** setzen (an `production` gebunden):

```bash
gh secret set DEPLOY_SSH_HOST --env production -R "$ORG/$REPO" --body "DEIN_SERVER_HOST_ODER_IP"
gh secret set DEPLOY_SSH_USER --env production -R "$ORG/$REPO" --body "musiker15"
gh secret set DEPLOY_SSH_PORT --env production -R "$ORG/$REPO" --body "22"

# SSH-Key aus Datei einlesen (kein Klartext im Terminal-Verlauf):
gh secret set DEPLOY_SSH_KEY --env production -R "$ORG/$REPO" < ~/.ssh/msk_forms_deploy

# Optional: Deploy-Benachrichtigung
gh secret set DEPLOY_DISCORD_WEBHOOK --env production -R "$ORG/$REPO" --body "https://discord.com/api/webhooks/..."
```

> **Deploy-Key vorbereiten** (lokal): `ssh-keygen -t ed25519 -f ~/.ssh/msk_forms_deploy -C "msk-forms-deploy"`
> → **Public**-Key (`~/.ssh/msk_forms_deploy.pub`) auf dem Server in
> `/home/musiker15/.ssh/authorized_keys` eintragen, **Private**-Key als `DEPLOY_SSH_KEY` oben setzen.

Secrets prüfen:

```bash
gh secret list --env production -R "$ORG/$REPO"
```

---

## 7. Verifizieren

```bash
gh repo view "$ORG/$REPO" --web         # Repo im Browser
gh api "repos/$ORG/$REPO/branches/main/protection" | jq '.required_status_checks.contexts'
gh workflow list -R "$ORG/$REPO"        # CI / Deploy / CodeQL sichtbar?
gh run list -R "$ORG/$REPO"             # erste Runs nach Push
```

---

## Hinweise

- **CI wird beim ersten Push rot**, solange das Monorepo-Scaffolding (package.json,
  `apps/`, Prisma-Schema) fehlt. Das ist erwartet — Workflows greifen voll ab Phase 0.
  Bis dahin können die Status-Checks im Branch-Schutz alternativ kurz entfernt werden.
- **Status-Check-Namen** müssen exakt mit den Job-Namen übereinstimmen. Ändern sich
  die Job-Namen in `ci.yml`/`codeql.yml`, hier in §4 anpassen.
- **Org-Rechte:** Schritt 4–6 brauchen Admin auf der Org bzw. dem Repo.
- **Commits immer ohne Co-Authored-By-Trailer.**
