// Convex-ready structure: replace with Convex query when FAQ management is needed.
export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
    {
        id: "gratis-codes",
        question: "Blijven mijn Starter QR codes altijd actief?",
        answer:
            "Ja. Codes die je aanmaakt op het Starter-plan blijven permanent actief, ook als je later downgradet of je abonnement beëindigt. Wij schakelen nooit codes uit op actief geprinte materialen. Je behoudt volledige controle.",
    },
    {
        id: "annuleren",
        question: "Kan ik mijn abonnement op elk moment opzeggen?",
        answer:
            "Absoluut. Je annuleert via je dashboard — geen formulieren, geen wachttijd. Je behoudt toegang tot het einde van je betaalde periode. Daarna worden je codes niet verwijderd; ze blijven scanbaar.",
    },
    {
        id: "betaalmethoden",
        question: "Welke betaalmethoden accepteren jullie?",
        answer:
            "Wij accepteren iDEAL, creditcard (Visa/Mastercard), SEPA-incasso en Bancontact. Alle betalingen verlopen via een beveiligde PCI-DSS compliant omgeving. Facturen zijn altijd beschikbaar in je account.",
    },
    {
        id: "starter-vs-pro",
        question: "Wat is het verschil tussen Starter en Pro?",
        answer:
            "Starter geeft je toegang tot 6 QR types (URL, vCard, WiFi, E-mail, SMS, Tekst) met basisanalytics. Pro voegt daar device-, OS- en locatieanalytics aan toe, plus de extra QR types WhatsApp, Agenda, Bestand en Social media — ideaal als je meer inzicht wilt in je scans.",
    },
] as const;
