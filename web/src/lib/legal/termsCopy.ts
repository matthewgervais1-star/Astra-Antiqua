import type { LegalCopy } from "@/lib/legal/legalTypes";

/**
 * The terms of service, in both languages.
 *
 * French is not optional here either, and for a stronger reason than the
 * privacy policy. The Charter of the French Language s. 55 reaches contracts
 * pre-determined by one party with NO payment condition, so a free service's
 * click-through terms are already caught. Charter s. 204.21 then removes the
 * usual burden: a party invoking nullity does not have to prove injury, and
 * the court must grant the application unless the other side shows there was
 * none.
 *
 * These are the terms for the service as it stands today, which is free. The
 * distance-contract disclosures the Consumer Protection Act requires at
 * checkout (s. 54.4 and following) are not here because there is no checkout.
 * They go in, with a lawyer, before the first payment. See
 * docs/law25-checklist.md.
 *
 * Tokens in braces are substituted at render from policyFacts.ts.
 */
export const TERMS_EN: LegalCopy = {
  lang: "en-CA",
  metaTitle: "Terms of Service",
  metaDescription:
    "The agreement for using Astra Antiqua: what the service is, what it is not, your account, and the limits of what we promise.",
  context: "THE AGREEMENT FOR USING THIS SERVICE",
  heading: "TERMS OF SERVICE",
  dateLine: "In effect {effective} · Last updated {updated}",
  intro:
    "These terms are the agreement between you and {legalName} for the use of Astra Antiqua, on the website and in the Android app. Using the service means you accept them. If you do not, please do not use it.",
  crossSentence: "How we handle your information is set out separately in our {link}.",
  crossLinkText: "privacy policy",
  crossLinkHref: "/privacy",
  otherLanguageHref: "/conditions",
  otherLanguageLabel: "Ces conditions sont aussi disponibles en français.",

  sections: [
    {
      label: "WHAT THIS IS",
      paras: [
        "Astra Antiqua computes an astrological chart from a birth date, time and place, and writes a reading of it in the voice of one of five ancient cultures. The positions are real astronomy, computed from an ephemeris. The interpretation is a cultural reading we wrote.",
        "It is offered for interest and reflection.",
      ],
    },
    {
      label: "WHAT THIS IS NOT",
      paras: [
        "Nothing here is advice, and nothing here is a prediction. It is not medical, psychological, legal, financial or professional advice of any kind, and it is not a substitute for any of them. No reading diagnoses anything, treats anything, or tells you what will happen.",
        "Do not make a decision that matters on the strength of a reading. If something in your life needs a doctor, a lawyer or an accountant, please go to one.",
        "We promise no outcome, no accuracy and no result. That is not a disclaimer hedging a claim; it is the honest description of what an astrological reading is.",
      ],
    },
    {
      label: "AGE",
      paras: [
        "You must be at least 14 to use this service or to have an account. If you are under 14, please do not sign up. If we learn of an account belonging to a child under 14 without parental consent, we delete it.",
      ],
    },
    {
      label: "YOUR ACCOUNT",
      paras: [
        "You do not need an account to use Astra Antiqua. An account exists so your chart follows you to another device, and nothing more.",
        "Keep your password to yourself, and tell us if you think someone else has it. You are responsible for what happens under your account. Give us an email address that reaches you, because it is the only way we have of contacting you.",
        "You can delete your account at any time from your account settings. That removes it and the chart attached to it.",
      ],
    },
    {
      label: "BIRTH DETAILS YOU ENTER",
      paras: [
        "We keep one chart: your own. When you compare it with someone else's, their details are used for that calculation and then discarded, never stored on your device or ours.",
        "Even so, please only enter another person's birth details if you have a good reason to and they would not object. It costs you nothing to use a nickname rather than their name, and the reading comes out identical.",
        "You agree not to use the service to build a record about someone who would not want one.",
      ],
    },
    {
      label: "WHAT YOU MAY NOT DO",
      paras: [
        "Do not try to break, overload or get around the security of the service. Do not scrape it, resell it, or pass the readings off as your own work. Do not use it to harass anyone.",
        "The reading text, the cultural material and the design are ours, and using the service does not transfer them to you. Your own birth details remain yours.",
      ],
    },
    {
      label: "AVAILABILITY",
      paras: [
        "We make no promise about uptime. The service may be unavailable, may change, and may stop. We will give notice of a permanent shutdown where we reasonably can, and your data export works for as long as the service does.",
        "We may change or remove features. Where a change materially reduces what the service does, we will say so.",
      ],
    },
    {
      label: "PAYING FOR ANYTHING",
      paras: [
        "The service is free today and there is nothing to buy. If that changes, we will publish the price, the payment terms, and the cancellation and refund conditions before anyone can pay, and we will update these terms first.",
      ],
    },
    {
      label: "WHERE WE STAND IF SOMETHING GOES WRONG",
      paras: [
        "We provide the service as it is. To the extent the law allows, we are not liable for indirect loss, or for any decision you make after reading something here.",
        "That limit does not take away rights you have under consumer protection law, and in Quebec it cannot. If a court finds part of these terms unenforceable, the rest still stands.",
      ],
    },
    {
      label: "ENDING",
      paras: [
        "You can stop at any time by deleting your account. We may suspend or close an account that is being used to attack the service or to harm someone, and we will tell you why unless the law prevents us.",
      ],
    },
    {
      label: "THE LAW THAT APPLIES",
      paras: [
        "These terms are governed by the law of Quebec and the laws of Canada that apply there, and the courts of Quebec have jurisdiction.",
        "If you live somewhere else, the consumer protections of your own country may apply to you regardless of what this section says. We are not trying to take those away, and in most places we could not.",
      ],
    },
    {
      label: "CHANGES TO THESE TERMS",
      paras: [
        "If we change these terms we update the date at the top. If a change materially affects your rights, we tell account holders by email before it takes effect, and continuing to use the service afterwards means you accept the new version.",
      ],
    },
  ],

  closing: "Questions about these terms go to {email}.",
};

export const TERMS_FR: LegalCopy = {
  lang: "fr-CA",
  metaTitle: "Conditions d'utilisation",
  metaDescription:
    "L'entente régissant l'utilisation d'Astra Antiqua : ce qu'est le service, ce qu'il n'est pas, votre compte et les limites de nos engagements.",
  context: "L'ENTENTE RÉGISSANT L'UTILISATION DU SERVICE",
  heading: "CONDITIONS D'UTILISATION",
  dateLine: "En vigueur le {effective} · Dernière mise à jour le {updated}",
  intro:
    "Les présentes conditions constituent l'entente entre vous et {legalName} concernant l'utilisation d'Astra Antiqua, sur le site Web et dans l'application Android. Utiliser le service signifie que vous les acceptez. Si ce n'est pas le cas, veuillez ne pas l'utiliser.",
  crossSentence: "Le traitement de vos renseignements est décrit séparément dans notre {link}.",
  crossLinkText: "politique de confidentialité",
  crossLinkHref: "/confidentialite",
  otherLanguageHref: "/terms",
  otherLanguageLabel: "These terms are also available in English.",

  sections: [
    {
      label: "CE QU'EST LE SERVICE",
      paras: [
        "Astra Antiqua calcule un thème astrologique à partir d'une date, d'une heure et d'un lieu de naissance, puis en rédige une lecture dans la voix de l'une de cinq cultures anciennes. Les positions relèvent de l'astronomie réelle, calculées à partir d'une éphéméride. L'interprétation est une lecture culturelle que nous avons rédigée.",
        "Le service est offert à des fins d'intérêt et de réflexion.",
      ],
    },
    {
      label: "CE QUE LE SERVICE N'EST PAS",
      paras: [
        "Rien ici ne constitue un conseil, et rien ici ne constitue une prédiction. Il ne s'agit pas d'un avis médical, psychologique, juridique, financier ou professionnel de quelque nature que ce soit, et cela ne remplace aucun d'entre eux. Aucune lecture ne diagnostique quoi que ce soit, ne traite quoi que ce soit, ni ne vous dit ce qui arrivera.",
        "Ne prenez pas une décision importante en vous fondant sur une lecture. Si une situation exige un médecin, un avocat ou un comptable, veuillez consulter l'un d'eux.",
        "Nous ne promettons aucun résultat, aucune exactitude et aucune issue. Il ne s'agit pas d'une clause visant à atténuer une promesse : c'est la description honnête de ce qu'est une lecture astrologique.",
      ],
    },
    {
      label: "ÂGE",
      paras: [
        "Vous devez avoir au moins 14 ans pour utiliser ce service ou pour détenir un compte. Si vous avez moins de 14 ans, veuillez ne pas vous inscrire. Si nous apprenons l'existence du compte d'un enfant de moins de 14 ans sans le consentement de ses parents, nous le supprimons.",
      ],
    },
    {
      label: "VOTRE COMPTE",
      paras: [
        "Vous n'avez pas besoin d'un compte pour utiliser Astra Antiqua. Un compte sert uniquement à ce que votre thème vous suive d'un appareil à l'autre.",
        "Gardez votre mot de passe pour vous et avisez-nous si vous croyez qu'une autre personne le détient. Vous êtes responsable de ce qui se produit sous votre compte. Fournissez-nous une adresse courriel valide : c'est notre seul moyen de vous joindre.",
        "Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre compte. Cela efface le compte et le thème qui y est rattaché.",
      ],
    },
    {
      label: "LES DONNÉES DE NAISSANCE QUE VOUS SAISISSEZ",
      paras: [
        "Nous conservons un seul thème : le vôtre. Lorsque vous le comparez à celui d'une autre personne, ses données servent à ce calcul puis sont écartées, sans jamais être conservées sur votre appareil ni sur le nôtre.",
        "Cela dit, veuillez ne saisir les données de naissance d'une autre personne que si vous avez une bonne raison de le faire et qu'elle n'y verrait pas d'objection. Utiliser un surnom plutôt que son nom ne vous coûte rien, et la lecture est identique.",
        "Vous convenez de ne pas utiliser le service pour constituer un dossier sur une personne qui n'en voudrait pas.",
      ],
    },
    {
      label: "CE QUI EST INTERDIT",
      paras: [
        "N'essayez pas de briser le service, de le surcharger ni de contourner sa sécurité. Ne l'extrayez pas automatiquement, ne le revendez pas et ne présentez pas les lectures comme votre propre travail. Ne l'utilisez pas pour harceler qui que ce soit.",
        "Le texte des lectures, le matériel culturel et le design nous appartiennent, et l'utilisation du service ne vous les transfère pas. Vos propres données de naissance demeurent les vôtres.",
      ],
    },
    {
      label: "DISPONIBILITÉ",
      paras: [
        "Nous ne promettons aucune disponibilité. Le service peut être indisponible, peut changer et peut cesser. Nous donnerons un préavis en cas d'arrêt définitif lorsque cela nous sera raisonnablement possible, et l'exportation de vos données fonctionne aussi longtemps que le service.",
        "Nous pouvons modifier ou retirer des fonctions. Lorsqu'un changement réduit sensiblement ce que fait le service, nous le dirons.",
      ],
    },
    {
      label: "LE PAIEMENT",
      paras: [
        "Le service est gratuit aujourd'hui et il n'y a rien à acheter. Si cela change, nous publierons le prix, les modalités de paiement ainsi que les conditions d'annulation et de remboursement avant que quiconque puisse payer, et nous mettrons d'abord les présentes conditions à jour.",
      ],
    },
    {
      label: "EN CAS DE PROBLÈME",
      paras: [
        "Nous fournissons le service tel quel. Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects ni d'une décision que vous prenez après avoir lu quelque chose ici.",
        "Cette limite ne retire pas les droits que vous confère la législation sur la protection du consommateur, et au Québec elle ne le pourrait pas. Si un tribunal juge une partie des présentes conditions inapplicable, le reste demeure en vigueur.",
      ],
    },
    {
      label: "LA FIN DE L'ENTENTE",
      paras: [
        "Vous pouvez cesser à tout moment en supprimant votre compte. Nous pouvons suspendre ou fermer un compte utilisé pour attaquer le service ou pour nuire à autrui, et nous vous en dirons la raison sauf si la loi nous en empêche.",
      ],
    },
    {
      label: "LE DROIT APPLICABLE",
      paras: [
        "Les présentes conditions sont régies par le droit du Québec et par les lois du Canada qui y sont applicables, et les tribunaux du Québec ont compétence.",
        "Si vous résidez ailleurs, les protections du consommateur de votre propre pays peuvent s'appliquer malgré la présente section. Nous ne cherchons pas à les écarter, et dans la plupart des ressorts nous ne le pourrions pas.",
      ],
    },
    {
      label: "MODIFICATIONS AUX PRÉSENTES CONDITIONS",
      paras: [
        "Si nous modifions les présentes conditions, nous mettons à jour la date indiquée en haut de la page. Si une modification touche sensiblement vos droits, nous en informons les titulaires de compte par courriel avant son entrée en vigueur, et continuer d'utiliser le service par la suite vaut acceptation de la nouvelle version.",
      ],
    },
  ],

  closing: "Toute question sur les présentes conditions peut être adressée à {email}.",
};
