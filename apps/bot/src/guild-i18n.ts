/**
 * Guild-facing bot i18n: command replies, review/activity-log embeds. The
 * language is per guild (`Guild.botConfig.locale`, default English) — distinct
 * from applicant DMs, which follow the applicant's own locale (see i18n.ts).
 * Built-in status labels in DMs still come from i18n.ts; this module covers the
 * text the *guild/team* sees.
 */
import { LOG_ACTIONS, type BotLocale } from "@msk-forms/shared";

export interface GuildStrings {
  // Slash-command replies
  serverOnly: string;
  notLinked: string;
  setup: string;
  noLiveForms: string;
  postNeedManage: string;
  postFormUnavailable: string;
  postCantPost: string;
  posted: string;
  languageNeedManage: string;
  languageSet: string;
  // Review embed (new submission)
  reviewTitle: string;
  applicant: string;
  anonymous: string;
  btnAccept: string;
  btnReject: string;
  btnOpenDashboard: string;
  btnOpenForm: string;
  // Accept / reject result
  reviewNeedManage: string;
  submissionNotFound: string;
  decision: string;
  decisionAccepted: string;
  decisionRejected: string;
  btnAccepted: string;
  btnRejected: string;
  // Activity-log embed field labels
  logField: { form: string; applicant: string; by: string; status: string; details: string };
  // Activity-log embed titles, one per LogAction (completeness enforced by the type)
  log: Record<(typeof LOG_ACTIONS)[number], string>;
}

/** Replace `{token}` placeholders in a localized string. */
export function fmt(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k]! : `{${k}}`));
}

const en: GuildStrings = {
  // Slash-command replies
  serverOnly: "This command can only be used inside a server.",
  notLinked: "This server isn't linked yet. Re-invite the bot or visit the dashboard.",
  setup: "🔧 Configure your forms in the dashboard: {url}",
  noLiveForms: "No live forms yet. Create one in the dashboard and set it to *live*.",
  postNeedManage: "You need the **Manage Server** permission to post forms.",
  postFormUnavailable: "That form isn't available (not found, not live, or not in this server).",
  postCantPost: "I can't post in that channel. Pick a text channel I can send messages in.",
  posted: "✅ Posted **{title}** in {channel}.",
  languageNeedManage: "You need the **Manage Server** permission to change the bot language.",
  languageSet: "✅ Bot language set to **{lang}**.",
  // Review embed (new submission)
  reviewTitle: "New submission — {form}",
  applicant: "Applicant",
  anonymous: "Anonymous",
  btnAccept: "Accept",
  btnReject: "Reject",
  btnOpenDashboard: "Open in dashboard",
  btnOpenForm: "Open form",
  // Accept / reject result
  reviewNeedManage: "You need the **Manage Server** permission to review submissions.",
  submissionNotFound: "Submission not found.",
  decision: "Decision",
  decisionAccepted: "✅ Accepted",
  decisionRejected: "❌ Rejected",
  btnAccepted: "Accepted",
  btnRejected: "Rejected",
  // Activity-log embed field labels
  logField: {
    form: "Form",
    applicant: "Applicant",
    by: "By",
    status: "Status",
    details: "Details",
  },
  // Activity-log embed titles (one per LogAction)
  log: {
    submission_created: "New submission",
    status_changed: "Status changed",
    message_sent: "Message sent to applicant",
    submission_withdrawn: "Submission withdrawn",
    submission_deleted: "Submission deleted",
    role_granted: "Role granted",
    form_created: "Form created",
    form_updated: "Form updated",
    form_deleted: "Form deleted",
    form_posted: "Form posted",
    member_added: "Member added",
    member_role_changed: "Member role changed",
    member_removed: "Member removed",
    bot_config_updated: "Bot config updated",
    branding_updated: "Branding updated",
    domain_updated: "Domain updated",
  },
};

const de: GuildStrings = {
  serverOnly: "Dieser Befehl kann nur innerhalb eines Servers verwendet werden.",
  notLinked: "Dieser Server ist noch nicht verknüpft. Lade den Bot erneut ein oder öffne das Dashboard.",
  setup: "🔧 Konfiguriere deine Formulare im Dashboard: {url}",
  noLiveForms: "Noch keine aktiven Formulare. Erstelle eines im Dashboard und stelle es auf *live*.",
  postNeedManage: "Du benötigst die Berechtigung **Server verwalten**, um Formulare zu posten.",
  postFormUnavailable: "Dieses Formular ist nicht verfügbar (nicht gefunden, nicht live oder nicht auf diesem Server).",
  postCantPost: "Ich kann in diesem Kanal nicht posten. Wähle einen Textkanal, in dem ich Nachrichten senden darf.",
  posted: "✅ **{title}** in {channel} gepostet.",
  languageNeedManage: "Du benötigst die Berechtigung **Server verwalten**, um die Bot-Sprache zu ändern.",
  languageSet: "✅ Bot-Sprache auf **{lang}** gesetzt.",
  reviewTitle: "Neue Bewerbung — {form}",
  applicant: "Bewerber",
  anonymous: "Anonym",
  btnAccept: "Annehmen",
  btnReject: "Ablehnen",
  btnOpenDashboard: "Im Dashboard öffnen",
  btnOpenForm: "Formular öffnen",
  reviewNeedManage: "Du benötigst die Berechtigung **Server verwalten**, um Bewerbungen zu bearbeiten.",
  submissionNotFound: "Einreichung nicht gefunden.",
  decision: "Entscheidung",
  decisionAccepted: "✅ Angenommen",
  decisionRejected: "❌ Abgelehnt",
  btnAccepted: "Angenommen",
  btnRejected: "Abgelehnt",
  logField: {
    form: "Formular",
    applicant: "Bewerber",
    by: "Von",
    status: "Status",
    details: "Details",
  },
  log: {
    submission_created: "Neue Einreichung",
    status_changed: "Status geändert",
    message_sent: "Nachricht an Bewerber gesendet",
    submission_withdrawn: "Einreichung zurückgezogen",
    submission_deleted: "Einreichung gelöscht",
    role_granted: "Rolle vergeben",
    form_created: "Formular erstellt",
    form_updated: "Formular aktualisiert",
    form_deleted: "Formular gelöscht",
    form_posted: "Formular gepostet",
    member_added: "Mitglied hinzugefügt",
    member_role_changed: "Mitglieder-Rolle geändert",
    member_removed: "Mitglied entfernt",
    bot_config_updated: "Bot-Konfiguration aktualisiert",
    branding_updated: "Branding aktualisiert",
    domain_updated: "Domain aktualisiert",
  },
};

const hu: GuildStrings = {
  serverOnly: "Ez a parancs csak szerveren belül használható.",
  notLinked: "Ez a szerver még nincs összekapcsolva. Hívd meg újra a botot, vagy látogass el az irányítópultra.",
  setup: "🔧 Állítsd be az űrlapjaidat az irányítópulton: {url}",
  noLiveForms: "Még nincs élő űrlap. Hozz létre egyet az irányítópulton, és állítsd *élőre*.",
  postNeedManage: "A **Szerver kezelése** jogosultság szükséges az űrlapok közzétételéhez.",
  postFormUnavailable: "Ez az űrlap nem érhető el (nem található, nem élő, vagy nem ezen a szerveren van).",
  postCantPost: "Nem tudok posztolni abba a csatornába. Válassz olyan szöveges csatornát, amelybe üzeneteket küldhetek.",
  posted: "✅ **{title}** elküldve ide: {channel}.",
  languageNeedManage: "A **Szerver kezelése** jogosultság szükséges a bot nyelvének módosításához.",
  languageSet: "✅ A bot nyelve **{lang}** lett.",
  reviewTitle: "Új jelentkezés — {form}",
  applicant: "Jelentkező",
  anonymous: "Névtelen",
  btnAccept: "Elfogadás",
  btnReject: "Elutasítás",
  btnOpenDashboard: "Megnyitás az irányítópulton",
  btnOpenForm: "Űrlap megnyitása",
  reviewNeedManage: "A **Szerver kezelése** jogosultság szükséges a jelentkezések elbírálásához.",
  submissionNotFound: "A jelentkezés nem található.",
  decision: "Döntés",
  decisionAccepted: "✅ Elfogadva",
  decisionRejected: "❌ Elutasítva",
  btnAccepted: "Elfogadva",
  btnRejected: "Elutasítva",
  logField: {
    form: "Űrlap",
    applicant: "Jelentkező",
    by: "Által",
    status: "Állapot",
    details: "Részletek",
  },
  log: {
    submission_created: "Új jelentkezés",
    status_changed: "Állapot megváltozott",
    message_sent: "Üzenet elküldve a jelentkezőnek",
    submission_withdrawn: "Jelentkezés visszavonva",
    submission_deleted: "Jelentkezés törölve",
    role_granted: "Szerep megadva",
    form_created: "Űrlap létrehozva",
    form_updated: "Űrlap frissítve",
    form_deleted: "Űrlap törölve",
    form_posted: "Űrlap közzétéve",
    member_added: "Tag hozzáadva",
    member_role_changed: "Tag szerepe megváltozott",
    member_removed: "Tag eltávolítva",
    bot_config_updated: "Bot konfiguráció frissítve",
    branding_updated: "Arculat frissítve",
    domain_updated: "Domain frissítve",
  },
};

const fr: GuildStrings = {
  serverOnly: "Cette commande ne peut être utilisée qu'à l'intérieur d'un serveur.",
  notLinked: "Ce serveur n'est pas encore lié. Réinvitez le bot ou consultez le tableau de bord.",
  setup: "🔧 Configurez vos formulaires dans le tableau de bord : {url}",
  noLiveForms: "Aucun formulaire en ligne pour l'instant. Créez-en un dans le tableau de bord et définissez-le sur *live*.",
  postNeedManage: "Vous devez disposer de la permission **Gérer le serveur** pour publier des formulaires.",
  postFormUnavailable: "Ce formulaire n'est pas disponible (introuvable, hors ligne ou absent de ce serveur).",
  postCantPost: "Je ne peux pas publier dans ce salon. Choisissez un salon textuel dans lequel je peux envoyer des messages.",
  posted: "✅ **{title}** publié dans {channel}.",
  languageNeedManage: "Vous devez disposer de la permission **Gérer le serveur** pour changer la langue du bot.",
  languageSet: "✅ Langue du bot définie sur **{lang}**.",
  reviewTitle: "Nouvelle candidature — {form}",
  applicant: "Candidat",
  anonymous: "Anonyme",
  btnAccept: "Accepter",
  btnReject: "Refuser",
  btnOpenDashboard: "Ouvrir dans le tableau de bord",
  btnOpenForm: "Ouvrir le formulaire",
  reviewNeedManage: "Vous devez disposer de la permission **Gérer le serveur** pour examiner les candidatures.",
  submissionNotFound: "Candidature introuvable.",
  decision: "Décision",
  decisionAccepted: "✅ Accepté",
  decisionRejected: "❌ Refusé",
  btnAccepted: "Accepté",
  btnRejected: "Refusé",
  logField: {
    form: "Formulaire",
    applicant: "Candidat",
    by: "Par",
    status: "Statut",
    details: "Détails",
  },
  log: {
    submission_created: "Nouvelle candidature",
    status_changed: "Statut modifié",
    message_sent: "Message envoyé au candidat",
    submission_withdrawn: "Candidature retirée",
    submission_deleted: "Candidature supprimée",
    role_granted: "Rôle attribué",
    form_created: "Formulaire créé",
    form_updated: "Formulaire mis à jour",
    form_deleted: "Formulaire supprimé",
    form_posted: "Formulaire publié",
    member_added: "Membre ajouté",
    member_role_changed: "Rôle du membre modifié",
    member_removed: "Membre retiré",
    bot_config_updated: "Configuration du bot mise à jour",
    branding_updated: "Apparence mise à jour",
    domain_updated: "Domaine mis à jour",
  },
};

const es: GuildStrings = {
  serverOnly: "Este comando solo se puede usar dentro de un servidor.",
  notLinked: "Este servidor aún no está vinculado. Vuelve a invitar al bot o visita el panel de control.",
  setup: "🔧 Configura tus formularios en el panel de control: {url}",
  noLiveForms: "Aún no hay formularios activos. Crea uno en el panel de control y ponlo en *live*.",
  postNeedManage: "Necesitas el permiso **Gestionar servidor** para publicar formularios.",
  postFormUnavailable: "Ese formulario no está disponible (no encontrado, no activo o no pertenece a este servidor).",
  postCantPost: "No puedo publicar en ese canal. Elige un canal de texto en el que pueda enviar mensajes.",
  posted: "✅ Se publicó **{title}** en {channel}.",
  languageNeedManage: "Necesitas el permiso **Gestionar servidor** para cambiar el idioma del bot.",
  languageSet: "✅ Idioma del bot configurado en **{lang}**.",
  reviewTitle: "Nueva solicitud — {form}",
  applicant: "Solicitante",
  anonymous: "Anónimo",
  btnAccept: "Aceptar",
  btnReject: "Rechazar",
  btnOpenDashboard: "Abrir en el panel de control",
  btnOpenForm: "Abrir formulario",
  reviewNeedManage: "Necesitas el permiso **Gestionar servidor** para revisar solicitudes.",
  submissionNotFound: "Solicitud no encontrada.",
  decision: "Decisión",
  decisionAccepted: "✅ Aceptado",
  decisionRejected: "❌ Rechazado",
  btnAccepted: "Aceptado",
  btnRejected: "Rechazado",
  logField: {
    form: "Formulario",
    applicant: "Solicitante",
    by: "Por",
    status: "Estado",
    details: "Detalles",
  },
  log: {
    submission_created: "Nueva solicitud",
    status_changed: "Estado cambiado",
    message_sent: "Mensaje enviado al solicitante",
    submission_withdrawn: "Solicitud retirada",
    submission_deleted: "Solicitud eliminada",
    role_granted: "Rol otorgado",
    form_created: "Formulario creado",
    form_updated: "Formulario actualizado",
    form_deleted: "Formulario eliminado",
    form_posted: "Formulario publicado",
    member_added: "Miembro añadido",
    member_role_changed: "Rol del miembro cambiado",
    member_removed: "Miembro eliminado",
    bot_config_updated: "Configuración del bot actualizada",
    branding_updated: "Marca actualizada",
    domain_updated: "Dominio actualizado",
  },
};

const pt: GuildStrings = {
  // Slash-command replies
  serverOnly: "Este comando só pode ser usado dentro de um servidor.",
  notLinked: "Este servidor ainda não está vinculado. Convide o bot novamente ou acesse o painel.",
  setup: "🔧 Configure seus formulários no painel: {url}",
  noLiveForms: "Nenhum formulário ativo ainda. Crie um no painel e defina-o como *live*.",
  postNeedManage: "Você precisa da permissão **Gerenciar servidor** para publicar formulários.",
  postFormUnavailable: "Esse formulário não está disponível (não encontrado, não está ativo ou não pertence a este servidor).",
  postCantPost: "Não consigo publicar nesse canal. Escolha um canal de texto no qual eu possa enviar mensagens.",
  posted: "✅ **{title}** publicado em {channel}.",
  languageNeedManage: "Você precisa da permissão **Gerenciar servidor** para alterar o idioma do bot.",
  languageSet: "✅ Idioma do bot definido como **{lang}**.",
  // Review embed (new submission)
  reviewTitle: "Nova inscrição — {form}",
  applicant: "Candidato",
  anonymous: "Anônimo",
  btnAccept: "Aceitar",
  btnReject: "Rejeitar",
  btnOpenDashboard: "Abrir no painel",
  btnOpenForm: "Abrir formulário",
  // Accept / reject result
  reviewNeedManage: "Você precisa da permissão **Gerenciar servidor** para avaliar inscrições.",
  submissionNotFound: "Inscrição não encontrada.",
  decision: "Decisão",
  decisionAccepted: "✅ Aceito",
  decisionRejected: "❌ Rejeitado",
  btnAccepted: "Aceito",
  btnRejected: "Rejeitado",
  // Activity-log embed field labels
  logField: {
    form: "Formulário",
    applicant: "Candidato",
    by: "Por",
    status: "Status",
    details: "Detalhes",
  },
  // Activity-log embed titles (one per LogAction)
  log: {
    submission_created: "Nova inscrição",
    status_changed: "Status alterado",
    message_sent: "Mensagem enviada ao candidato",
    submission_withdrawn: "Inscrição retirada",
    submission_deleted: "Inscrição excluída",
    role_granted: "Cargo concedido",
    form_created: "Formulário criado",
    form_updated: "Formulário atualizado",
    form_deleted: "Formulário excluído",
    form_posted: "Formulário publicado",
    member_added: "Membro adicionado",
    member_role_changed: "Cargo do membro alterado",
    member_removed: "Membro removido",
    bot_config_updated: "Configuração do bot atualizada",
    branding_updated: "Identidade visual atualizada",
    domain_updated: "Domínio atualizado",
  },
};

const pl: GuildStrings = {
  serverOnly: "To polecenie można używać tylko na serwerze.",
  notLinked: "Ten serwer nie jest jeszcze połączony. Zaproś bota ponownie lub odwiedź panel.",
  setup: "🔧 Skonfiguruj swoje formularze w panelu: {url}",
  noLiveForms: "Brak aktywnych formularzy. Utwórz jeden w panelu i ustaw go jako *live*.",
  postNeedManage: "Potrzebujesz uprawnienia **Zarządzanie serwerem**, aby publikować formularze.",
  postFormUnavailable: "Ten formularz jest niedostępny (nie znaleziono, nie jest aktywny lub nie należy do tego serwera).",
  postCantPost: "Nie mogę wysłać wiadomości na tym kanale. Wybierz kanał tekstowy, na którym mogę pisać.",
  posted: "✅ Opublikowano **{title}** w {channel}.",
  languageNeedManage: "Potrzebujesz uprawnienia **Zarządzanie serwerem**, aby zmienić język bota.",
  languageSet: "✅ Język bota ustawiony na **{lang}**.",
  reviewTitle: "Nowe zgłoszenie — {form}",
  applicant: "Zgłaszający",
  anonymous: "Anonimowy",
  btnAccept: "Akceptuj",
  btnReject: "Odrzuć",
  btnOpenDashboard: "Otwórz w panelu",
  btnOpenForm: "Otwórz formularz",
  reviewNeedManage: "Potrzebujesz uprawnienia **Zarządzanie serwerem**, aby rozpatrywać zgłoszenia.",
  submissionNotFound: "Nie znaleziono zgłoszenia.",
  decision: "Decyzja",
  decisionAccepted: "✅ Zaakceptowano",
  decisionRejected: "❌ Odrzucono",
  btnAccepted: "Zaakceptowano",
  btnRejected: "Odrzucono",
  logField: {
    form: "Formularz",
    applicant: "Kandydat",
    by: "Przez",
    status: "Status",
    details: "Szczegóły",
  },
  log: {
    submission_created: "Nowe zgłoszenie",
    status_changed: "Status zmieniony",
    message_sent: "Wiadomość wysłana do zgłaszającego",
    submission_withdrawn: "Zgłoszenie wycofane",
    submission_deleted: "Zgłoszenie usunięte",
    role_granted: "Rola przyznana",
    form_created: "Formularz utworzony",
    form_updated: "Formularz zaktualizowany",
    form_deleted: "Formularz usunięty",
    form_posted: "Formularz opublikowany",
    member_added: "Członek dodany",
    member_role_changed: "Rola członka zmieniona",
    member_removed: "Członek usunięty",
    bot_config_updated: "Konfiguracja bota zaktualizowana",
    branding_updated: "Branding zaktualizowany",
    domain_updated: "Domena zaktualizowana",
  },
};

const STRINGS: Record<BotLocale, GuildStrings> = { en, de, hu, fr, es, pt, pl };

/** Guild-facing bot strings for a guild's configured locale (defaults to English). */
export function guildStrings(locale: string | null | undefined): GuildStrings {
  return locale && locale in STRINGS ? STRINGS[locale as BotLocale] : STRINGS.en;
}
