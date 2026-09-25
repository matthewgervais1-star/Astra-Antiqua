/**
 * The privacy policy text, in both languages.
 *
 * Two reasons this is data rather than JSX.
 *
 * First, the French version is not a courtesy. The Charter of the French
 * Language reaches a commercial service offered to Quebec consumers, and the
 * Consumer Protection Act (s. 26) resolves any discrepancy between versions in
 * the consumer's favour. Keeping both in one typed structure means a section
 * cannot exist in English and quietly go missing in French.
 *
 * Second, the French text needs review by someone who writes French
 * professionally, and the statutory standard of "clear and simple language"
 * applies to it as much as to the English. A reviewer should be able to read
 * and correct the prose without touching a component.
 *
 * Tokens in braces are substituted at render from src/lib/legal/policyFacts.ts:
 *   {email} {postal} {officer} {appHost} {dbHost} {dbRegion}
 *   {dormantMonths} {backupDays}
 */

import type { LegalCopy, LegalSection } from "@/lib/legal/legalTypes";

/** The privacy policy is a legal document plus one section whose wording
 *  depends on where the database physically sits. */
export interface PrivacyCopy extends LegalCopy {
  storage: {
    label: string;
    outside: string;
    outsideAssessed: string;
    inQuebec: string;
  };
}

/**
 * Builds the storage section for the region actually configured.
 *
 * The assessment sentence appears only once the assessment exists. s. 17
 * requires it BEFORE the information leaves the province, so a page that
 * claimed one that had never been done would breach s. 17 and the accuracy
 * s. 8 demands of the policy itself.
 */
export function storageSection(
  copy: PrivacyCopy,
  outsideQuebec: boolean,
  assessmentCompleted: boolean,
): LegalSection {
  const paras = outsideQuebec
    ? [copy.storage.outside, ...(assessmentCompleted ? [copy.storage.outsideAssessed] : [])]
    : [copy.storage.inQuebec];
  return { label: copy.storage.label, paras };
}

export const PRIVACY_EN: PrivacyCopy = {
  metaTitle: "Privacy Policy",
  metaDescription:
    "What Astra Antiqua collects, why, where it is stored, how long it is kept, and how to see, correct or delete it.",
  context: "HOW YOUR INFORMATION IS HANDLED",
  heading: "PRIVACY POLICY",
  dateLine: "In effect {effective} · Last updated {updated}",
  intro:
    "This policy explains what Astra Antiqua collects about you, why, where it is kept, how long for, and what you can make us do about it. It covers the website and the Android app.",
  crossSentence: "Our {link} are a separate document.",
  crossLinkText: "terms of service",
  crossLinkHref: "/terms",
  otherLanguageHref: "/confidentialite",
  otherLanguageLabel: "Cette politique est aussi disponible en français.",

  sections: [
    {
      label: "WHO IS RESPONSIBLE",
      paras: [
        "The person in charge of protecting personal information at Astra Antiqua is the {officer}. Write to them at {email}, or by post at {postal}.",
        "Send any request to see, correct or delete your information to that address, and any complaint about how we have handled it. We answer in writing within 30 days.",
      ],
    },
    {
      label: "WHAT WE COLLECT AND WHY",
      lead: "We collect it through the sign-up form, the chart form, and the Android app. Nobody collects it on our behalf.",
      items: [
        {
          term: "Your email address",
          text: "To identify your account, sign you in, and send you messages about the service. Required to have an account.",
        },
        {
          term: "Your password",
          text: "Stored only as a bcrypt hash, never as the password itself. We cannot read it and we cannot tell you what it is. Required.",
        },
        {
          term: "A display name",
          text: "Only to address you by name. Optional. Leaving it blank costs you nothing.",
        },
        {
          term: "The birth date, time and place on each chart",
          text: "To compute the chart and write the reading. The time is to the minute because the rising sign and the house cusps move within the hour, so a rounded time produces a different chart. Required to create a chart.",
        },
        {
          term: "Your IP address",
          text: "Used at the moment of a request to limit how often anyone can try to sign in, which is what stops someone guessing your password. It is not written to our database.",
        },
      ],
      paras: [
        "That is the whole list. We do not ask for anything we do not need to produce the reading you came for.",
      ],
    },
    {
      label: "COMPARING WITH SOMEONE ELSE",
      paras: [
        "We hold one chart: yours. When you compare it with another person's, you type their birth details, we compute the comparison, and the details are discarded. They are never written to your device and never sent to our server. Close the page and they are gone.",
        "That is deliberate, and it is a decision about the database rather than a promise about behaviour. Quebec law says information about a person should be collected from that person, and someone whose chart you are curious about has not agreed to anything. The cleanest way to respect that is to have nowhere to put their details, so we removed the place we used to put them.",
        "It means nobody has to write to us asking what we hold about them, because the answer is nothing unless they have their own account.",
      ],
    },
    {
      label: "COOKIES",
      paras: [
        "One cookie, called astra_session. It holds a signed token containing your user id and email address, and it is what keeps you signed in. It is marked httpOnly and SameSite=Lax, it is sent only over HTTPS in production, and it lasts 30 days. Delete it and you are signed out.",
        "There are no other cookies, and no third-party cookies. Nothing here tracks you across other websites, so there is nothing for a cookie banner to ask you about.",
      ],
    },
    {
      label: "WHAT WE DO NOT DO",
      paras: [
        "There is no Google Analytics, no gtag, no Plausible, no PostHog, no Mixpanel, no Segment, no Sentry, no Vercel Analytics, no Speed Insights, no Meta pixel, no Hotjar, and no third-party script of any kind on this site.",
        "We do not sell your information. We do not rent it. We do not advertise to you, and we do not use your chart data for anything other than producing the readings you asked for.",
      ],
    },
    {
      label: "HOW YOUR READING IS PRODUCED",
      paras: [
        "Planetary positions are computed from your birth moment and place by an astronomical library running on our own server. The words are assembled from a fixed corpus we wrote. No artificial intelligence service is involved, and your birth data is never sent to a language model or any other outside system to generate the text.",
        "Nothing the app produces is a decision about you. It does not decide your price, your eligibility, or your access to anything. It is a reading, offered for interest, and it is not advice about your health, your money, or your life.",
      ],
    },
    {
      label: "WHO ELSE HANDLES YOUR INFORMATION",
      paras: [
        "{appHost} runs the application. {dbHost} hosts the database. Both act on our instructions under a written agreement, and neither may use your information for their own purposes.",
        "When you type a birth place, our server asks OpenStreetMap to turn that place name into coordinates. Your browser never contacts them, so your IP address is not disclosed. The only thing that leaves our server is the place name you typed.",
      ],
    },
    {
      label: "HOW LONG WE KEEP IT",
      paras: [
        "Your account: while it is open. If you have not signed in for {dormantMonths} months we email you a warning, and if you do not come back we delete the account and everything in it.",
        "Your chart: until you replace it, delete it, or delete your account. Casting again replaces it rather than adding a second one.",
        "When you delete: your account record and the chart attached to it are removed from our live database immediately. Copies inside our database provider's encrypted backups age out within {backupDays} days, which is the length of their backup window.",
        "We destroy information when we no longer need it. We do not claim to anonymize it: a name with an exact birth minute and a set of coordinates is close to unique, and calling that anonymous would not be honest.",
      ],
    },
    {
      label: "HOW WE PROTECT IT",
      paras: [
        "Passwords are stored as bcrypt hashes. The connection to this site is encrypted, and so is the database and its backups. The session cookie cannot be read by scripts in your browser. Sign-in attempts are rate limited per account and per address. Requests that change your account are checked to make sure they came from this site.",
      ],
    },
    {
      label: "WHO CAN SEE IT",
      paras: [
        "Astra Antiqua is run by one person, who is the only human with access to the database, and who looks at individual records only to answer a request from you or to fix a fault you have reported.",
      ],
    },
    {
      label: "YOUR RIGHTS",
      paras: [
        "See and download everything. Open your account settings and choose Export. You get a file containing your account record and every chart you have saved. No form and no waiting. If you would rather have it as a readable document, ask and we will send one.",
        "Correct something. Edit a chart in the app. If you cannot fix it yourself, write to us. When we correct something we send you a copy of the corrected version, or written confirmation that we deleted it.",
        "Take it elsewhere. The export file is in a structured, commonly used format. This right covers what you gave us. The planetary positions and the reading text are things we compute rather than collect, so strictly they fall outside it, but they are in the export anyway.",
        "Delete your account. Account settings, Delete account. This removes your account and every chart attached to it.",
        "We answer within 30 days. Seeing your information is free. If a request needs transcription, reproduction or transmission that costs us something, we tell you the amount before we start, and you can withdraw the request. If we refuse a request we tell you why, which part of the law we rely on, and how to challenge it.",
      ],
    },
    {
      label: "COMPLAINTS",
      paras: [
        "Complain to us first, at {email}. If you are not satisfied with the answer, or we do not answer within 30 days, you can take it to the Commission d'accès à l'information du Québec, which supervises this law and can review our decision.",
      ],
    },
    {
      label: "HOW WE GOVERN THIS",
      paras: [
        "We collect only what a reading needs, and we decide why we need something before we ask for it. Access to the database is held by one person. Retention is on the clocks set out above, and deletion runs automatically rather than on request alone. Before any new feature that would collect something new, we work out whether it is necessary and what it would expose, and we assess any project that would send personal information out of the province before it ships.",
        "If we have a security incident we record it in a register, judge whether it risks serious injury, and where it does we notify both the Commission d'accès à l'information and the people affected promptly.",
      ],
    },
    {
      label: "AGE",
      paras: [
        "This service is for people aged 14 and over. If you are under 14, please do not create an account. If we learn that we hold an account belonging to a child under 14 without parental consent, we delete it.",
      ],
    },
    {
      label: "CHANGES",
      paras: [
        "If we change this policy we update the date at the top. If the change affects what we collect, why, or who handles it, we tell account holders by email before it takes effect.",
      ],
    },
  ],

  storage: {
    label: "WHERE IT IS STORED",
    outside:
      "Your information is stored outside Quebec. Our database is hosted by {dbHost} in {dbRegion}, which means your account record and every chart you save are held there.",
    outsideAssessed:
      "Before sending any personal information outside Quebec we completed a privacy impact assessment for each provider, concluded that the information receives adequate protection, and put a written agreement in place with each of them reflecting that assessment.",
    inQuebec:
      "Your information stays in Quebec. Our database is hosted by {dbHost} in {dbRegion}, and your account record and charts do not leave the province.",
  },

  closing: "Questions about any of this go to {email}.",
};

export const PRIVACY_FR: PrivacyCopy = {
  metaTitle: "Politique de confidentialité",
  metaDescription:
    "Ce qu'Astra Antiqua recueille, pourquoi, où l'information est conservée, combien de temps, et comment la consulter, la corriger ou la supprimer.",
  context: "COMMENT VOS RENSEIGNEMENTS SONT TRAITÉS",
  heading: "POLITIQUE DE CONFIDENTIALITÉ",
  dateLine: "En vigueur le {effective} · Dernière mise à jour le {updated}",
  intro:
    "Cette politique explique ce qu'Astra Antiqua recueille à votre sujet, pourquoi, où ces renseignements sont conservés, combien de temps, et ce que vous pouvez nous demander de faire. Elle vise le site Web et l'application Android.",
  crossSentence: "Nos {link} font l'objet d'un document distinct.",
  crossLinkText: "conditions d'utilisation",
  crossLinkHref: "/conditions",
  otherLanguageHref: "/privacy",
  otherLanguageLabel: "This policy is also available in English.",

  sections: [
    {
      label: "QUI EST RESPONSABLE",
      paras: [
        "La personne responsable de la protection des renseignements personnels chez Astra Antiqua est le {officer}. Vous pouvez lui écrire à {email}, ou par la poste à {postal}.",
        "Adressez à cette personne toute demande de consultation, de correction ou de suppression de vos renseignements, ainsi que toute plainte sur la façon dont nous les avons traités. Nous répondons par écrit dans les 30 jours.",
      ],
    },
    {
      label: "CE QUE NOUS RECUEILLONS ET POURQUOI",
      lead: "Nous recueillons ces renseignements au moyen du formulaire d'inscription, du formulaire de thème et de l'application Android. Personne ne les recueille pour notre compte.",
      items: [
        {
          term: "Votre adresse courriel",
          text: "Pour identifier votre compte, vous connecter et vous transmettre des messages concernant le service. Nécessaire pour avoir un compte.",
        },
        {
          term: "Votre mot de passe",
          text: "Conservé uniquement sous forme d'empreinte bcrypt, jamais en clair. Nous ne pouvons pas le lire et nous ne pouvons pas vous le communiquer. Nécessaire.",
        },
        {
          term: "Un nom d'affichage",
          text: "Uniquement pour nous adresser à vous par votre nom. Facultatif. Ne rien inscrire ne vous prive de rien.",
        },
        {
          term: "La date, l'heure et le lieu de naissance de chaque thème",
          text: "Pour calculer le thème et rédiger la lecture. L'heure est précise à la minute parce que l'ascendant et les cuspides des maisons changent à l'intérieur d'une même heure : une heure arrondie donne un autre thème. Nécessaire pour créer un thème.",
        },
        {
          term: "Votre adresse IP",
          text: "Utilisée au moment de la requête pour limiter le nombre de tentatives de connexion, ce qui empêche quelqu'un de deviner votre mot de passe. Elle n'est pas inscrite dans notre base de données.",
        },
      ],
      paras: [
        "C'est la liste complète. Nous ne demandons rien dont nous n'avons pas besoin pour produire la lecture que vous êtes venu chercher.",
      ],
    },
    {
      label: "LA COMPARAISON AVEC UNE AUTRE PERSONNE",
      paras: [
        "Nous conservons un seul thème : le vôtre. Lorsque vous le comparez à celui d'une autre personne, vous saisissez ses données de naissance, nous calculons la comparaison, puis ces données sont écartées. Elles ne sont jamais inscrites sur votre appareil ni transmises à notre serveur. Fermez la page et elles ont disparu.",
        "C'est délibéré, et il s'agit d'une décision sur la base de données plutôt que d'une promesse de bonne conduite. La loi québécoise prévoit que les renseignements concernant une personne doivent être recueillis auprès d'elle, et la personne dont le thème vous intrigue n'a consenti à rien. La façon la plus nette de respecter cela est de n'avoir nulle part où consigner ses données : nous avons donc supprimé l'endroit où nous les consignions.",
        "Personne n'a ainsi à nous écrire pour savoir ce que nous détenons à son sujet, puisque la réponse est : rien, à moins d'avoir son propre compte.",
      ],
    },
    {
      label: "TÉMOINS (COOKIES)",
      paras: [
        "Un seul témoin, nommé astra_session. Il contient un jeton signé comprenant votre identifiant d'utilisateur et votre adresse courriel, et c'est lui qui vous garde connecté. Il est marqué httpOnly et SameSite=Lax, il n'est transmis qu'en HTTPS en production, et il dure 30 jours. Si vous le supprimez, vous êtes déconnecté.",
        "Il n'y a aucun autre témoin, ni aucun témoin tiers. Rien ici ne vous suit d'un site à l'autre, et il n'y a donc rien qu'une bannière de témoins pourrait vous demander.",
      ],
    },
    {
      label: "CE QUE NOUS NE FAISONS PAS",
      paras: [
        "Il n'y a sur ce site ni Google Analytics, ni gtag, ni Plausible, ni PostHog, ni Mixpanel, ni Segment, ni Sentry, ni Vercel Analytics, ni Speed Insights, ni pixel Meta, ni Hotjar, ni aucun script tiers.",
        "Nous ne vendons pas vos renseignements. Nous ne les louons pas. Nous ne vous adressons aucune publicité et nous n'utilisons les données de vos thèmes que pour produire les lectures que vous avez demandées.",
      ],
    },
    {
      label: "COMMENT VOTRE LECTURE EST PRODUITE",
      paras: [
        "Les positions planétaires sont calculées à partir de votre moment et de votre lieu de naissance par une bibliothèque astronomique qui s'exécute sur notre propre serveur. Le texte est assemblé à partir d'un corpus fixe que nous avons rédigé. Aucun service d'intelligence artificielle n'intervient, et vos données de naissance ne sont jamais transmises à un modèle de langage ni à aucun autre système externe pour produire ce texte.",
        "Rien de ce que produit l'application ne constitue une décision vous concernant. Elle ne détermine ni votre prix, ni votre admissibilité, ni votre accès à quoi que ce soit. Il s'agit d'une lecture offerte à titre d'intérêt, et non d'un conseil concernant votre santé, votre argent ou votre vie.",
      ],
    },
    {
      label: "QUI D'AUTRE TRAITE VOS RENSEIGNEMENTS",
      paras: [
        "{appHost} héberge l'application. {dbHost} héberge la base de données. Ces deux fournisseurs agissent suivant nos instructions en vertu d'une entente écrite, et ni l'un ni l'autre ne peut utiliser vos renseignements à ses propres fins.",
        "Lorsque vous saisissez un lieu de naissance, notre serveur demande à OpenStreetMap de convertir ce nom de lieu en coordonnées. Votre navigateur ne communique jamais avec eux, de sorte que votre adresse IP ne leur est pas divulguée. La seule chose qui quitte notre serveur est le nom de lieu que vous avez saisi.",
      ],
    },
    {
      label: "COMBIEN DE TEMPS NOUS LES CONSERVONS",
      paras: [
        "Votre compte : tant qu'il est ouvert. Si vous ne vous êtes pas connecté depuis {dormantMonths} mois, nous vous envoyons un avertissement par courriel, et si vous ne revenez pas, nous supprimons le compte et tout ce qu'il contient.",
        "Votre thème : jusqu'à ce que vous le remplaciez, le supprimiez ou supprimiez votre compte. Un nouveau calcul remplace le précédent au lieu d'en ajouter un second.",
        "Lorsque vous supprimez : votre fiche de compte et tous les thèmes qui y sont rattachés sont retirés immédiatement de notre base de données active. Les copies qui subsistent dans les sauvegardes chiffrées de notre fournisseur disparaissent dans un délai de {backupDays} jours, soit la durée de leur fenêtre de sauvegarde.",
        "Nous détruisons les renseignements lorsque nous n'en avons plus besoin. Nous ne prétendons pas les anonymiser : un nom accompagné d'une minute de naissance exacte et de coordonnées géographiques est presque unique, et les qualifier d'anonymes ne serait pas honnête.",
      ],
    },
    {
      label: "COMMENT NOUS LES PROTÉGEONS",
      paras: [
        "Les mots de passe sont conservés sous forme d'empreintes bcrypt. La connexion à ce site est chiffrée, tout comme la base de données et ses sauvegardes. Le témoin de session ne peut pas être lu par les scripts de votre navigateur. Les tentatives de connexion sont limitées par compte et par adresse. Les requêtes qui modifient votre compte sont vérifiées pour confirmer qu'elles proviennent bien de ce site.",
      ],
    },
    {
      label: "QUI PEUT LES CONSULTER",
      paras: [
        "Astra Antiqua est exploité par une seule personne, qui est le seul être humain ayant accès à la base de données, et qui ne consulte une fiche individuelle que pour répondre à une demande de votre part ou corriger une anomalie que vous avez signalée.",
      ],
    },
    {
      label: "VOS DROITS",
      paras: [
        "Consulter et télécharger l'ensemble de vos renseignements. Ouvrez les paramètres de votre compte et choisissez Exporter. Vous obtenez un fichier contenant votre fiche de compte et tous les thèmes que vous avez enregistrés. Aucun formulaire, aucun délai. Si vous préférez un document lisible, demandez-le et nous vous l'enverrons.",
        "Faire corriger un renseignement. Modifiez un thème directement dans l'application. Si vous ne pouvez pas le corriger vous-même, écrivez-nous. Lorsque nous effectuons une correction, nous vous en transmettons une copie, ou une confirmation écrite de la suppression.",
        "Emporter vos renseignements ailleurs. Le fichier d'exportation est dans un format structuré et couramment utilisé. Ce droit vise les renseignements que vous nous avez fournis. Les positions planétaires et le texte de la lecture sont calculés par nous plutôt que recueillis auprès de vous, et n'en font donc pas strictement partie, mais ils figurent tout de même dans l'exportation.",
        "Supprimer votre compte. Paramètres du compte, Supprimer le compte. Cette opération efface votre compte et tous les thèmes qui y sont rattachés.",
        "Nous répondons dans les 30 jours. La consultation de vos renseignements est gratuite. Si une demande exige une transcription, une reproduction ou une transmission qui entraîne des frais, nous vous en indiquons le montant approximatif avant de commencer, et vous pouvez retirer votre demande. Si nous refusons une demande, nous vous expliquons pourquoi, sur quelle disposition de la loi nous nous appuyons, et comment contester ce refus.",
      ],
    },
    {
      label: "PLAINTES",
      paras: [
        "Adressez-nous d'abord votre plainte, à {email}. Si la réponse ne vous satisfait pas, ou si nous ne répondons pas dans les 30 jours, vous pouvez vous adresser à la Commission d'accès à l'information du Québec, qui surveille l'application de cette loi et peut réviser notre décision.",
      ],
    },
    {
      label: "NOTRE GOUVERNANCE",
      paras: [
        "Nous ne recueillons que ce qu'une lecture exige, et nous déterminons pourquoi un renseignement est nécessaire avant de le demander. L'accès à la base de données est détenu par une seule personne. La conservation suit les délais énoncés ci-dessus, et la suppression s'effectue automatiquement et non seulement sur demande. Avant toute nouvelle fonction qui recueillerait un nouveau renseignement, nous évaluons si elle est nécessaire et ce qu'elle exposerait, et nous évaluons tout projet qui communiquerait des renseignements personnels hors du Québec avant sa mise en service.",
        "En cas d'incident de confidentialité, nous l'inscrivons dans un registre, nous évaluons s'il présente un risque de préjudice sérieux et, le cas échéant, nous en avisons promptement la Commission d'accès à l'information ainsi que les personnes concernées.",
      ],
    },
    {
      label: "ÂGE",
      paras: [
        "Ce service s'adresse aux personnes de 14 ans et plus. Si vous avez moins de 14 ans, veuillez ne pas créer de compte. Si nous apprenons que nous détenons le compte d'un enfant de moins de 14 ans sans le consentement de ses parents, nous le supprimons.",
      ],
    },
    {
      label: "MODIFICATIONS",
      paras: [
        "Si nous modifions cette politique, nous mettons à jour la date indiquée en haut de la page. Si la modification touche ce que nous recueillons, pourquoi, ou qui traite ces renseignements, nous en informons les titulaires de compte par courriel avant son entrée en vigueur.",
      ],
    },
  ],

  storage: {
    label: "OÙ LES RENSEIGNEMENTS SONT CONSERVÉS",
    outside:
      "Vos renseignements sont conservés à l'extérieur du Québec. Notre base de données est hébergée par {dbHost} à {dbRegion}, ce qui signifie que votre fiche de compte et chacun des thèmes que vous enregistrez y sont conservés.",
    outsideAssessed:
      "Avant de communiquer tout renseignement personnel à l'extérieur du Québec, nous avons réalisé une évaluation des facteurs relatifs à la vie privée pour chaque fournisseur, conclu que les renseignements y bénéficient d'une protection adéquate, et conclu avec chacun une entente écrite tenant compte de cette évaluation.",
    inQuebec:
      "Vos renseignements demeurent au Québec. Notre base de données est hébergée par {dbHost} à {dbRegion}, et votre fiche de compte ainsi que vos thèmes ne quittent pas la province.",
  },

  closing: "Toute question à ce sujet peut être adressée à {email}.",
};
