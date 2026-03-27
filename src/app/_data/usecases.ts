import { ComponentType } from "react";
import {
    UtensilsIcon,
    ShoppingBagIcon,
    MicIcon,
    BriefcaseIcon,
    HeartPulseIcon,
    GraduationCapIcon,
} from "@/components/ui/icons";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

export type UseCase = {
    id: string;
    Icon: ComponentType<IconProps>;
    industry: string;
    title: string;
    problem: string;
    solution: string;
    outcome: string;
    qrTypes: string[];
};

export const USE_CASES: UseCase[] = [
    {
        id: "horeca",
        Icon: UtensilsIcon,
        industry: "Horeca",
        title: "Menu's die meeveranderen met het seizoen",
        problem:
            "Elke seizoenswisseling betekent nieuwe menu's drukken, of erger: verouderde kaarten op tafel.",
        solution:
            "Eén QR code op tafel die je op elk moment doorlinkt naar het actuele menu, WiFi-gegevens deelt of klanten naar je Google Reviews stuurt.",
        outcome:
            "Nooit meer herdrukken. Gasten zien altijd de juiste kaart — en je bespaart honderden euro's per jaar aan drukwerk.",
        qrTypes: ["URL", "WiFi", "Social"],
    },
    {
        id: "retail",
        Icon: ShoppingBagIcon,
        industry: "Retail & E-commerce",
        title: "Slimme verpakkingen die verkopen",
        problem:
            "Jouw product staat in het schap, maar klanten weten niet wat het bijzonder maakt.",
        solution:
            "QR codes op verpakkingen die linken naar productinfo, instructievideo's of een persoonlijke kortingsactie. Pas de bestemming aan per campagne, zonder iets opnieuw te drukken.",
        outcome:
            "Meer engagement, hogere klantloyaliteit en meetbare conversie per product — direct vanaf de verpakking.",
        qrTypes: ["URL", "vCard", "SMS"],
    },
    {
        id: "evenementen",
        Icon: MicIcon,
        industry: "Evenementen",
        title: "Van poster naar programma in één scan",
        problem:
            "Bezoekers missen updates over locatiewijzigingen, schema's of last-minute line-up changes.",
        solution:
            "Dynamische QR codes op posters, tickets en badges die altijd verwijzen naar het actuele programma, feedback-formulieren of een event-kalender (.ics).",
        outcome:
            "Real-time communicatie met je bezoekers. Zie in de analytics precies welke posters en locaties het meeste verkeer genereren.",
        qrTypes: ["URL", "Event", "Email"],
    },
    {
        id: "zakelijk",
        Icon: BriefcaseIcon,
        industry: "Zakelijke diensten",
        title: "Digitale visitekaartjes die nooit verouderen",
        problem:
            "Nieuwe functietitel, ander telefoonnummer — en 500 visitekaartjes die niet meer kloppen.",
        solution:
            "Een vCard QR code op je kaartje die altijd je actuele contactgegevens toont. Combineer met een e-mail QR code voor directe offerteaanvragen.",
        outcome:
            "Geen verspild drukwerk meer. Contacten worden direct opgeslagen in het telefoonboek van je prospect.",
        qrTypes: ["vCard", "Email", "URL"],
    },
    {
        id: "zorg",
        Icon: HeartPulseIcon,
        industry: "Gezondheidszorg",
        title: "Patiëntcommunicatie zonder papierwerk",
        problem:
            "Patiënten vergeten afspraakdetails, vullen formulieren verkeerd in of missen voorbereidingsinstructies.",
        solution:
            "QR codes in de wachtkamer of op afspraakbevestigingen die linken naar intake-formulieren, routebeschrijvingen of pre-operatieve instructies.",
        outcome:
            "Minder no-shows, volledig ingevulde formulieren vóór de afspraak en een professionelere patiëntervaring.",
        qrTypes: ["URL", "vCard", "SMS"],
    },
    {
        id: "onderwijs",
        Icon: GraduationCapIcon,
        industry: "Onderwijs",
        title: "Lesmateriaal dat altijd up-to-date is",
        problem:
            "Geprint lesmateriaal is verouderd, links in readers werken niet meer en studenten raken bronnen kwijt.",
        solution:
            "QR codes in hand-outs en op het whiteboard die naar het actuele materiaal, een feedback-enquête of WiFi-toegang linken.",
        outcome:
            "Studenten hebben altijd toegang tot de juiste bronnen. Docenten zien via analytics welk materiaal het meest wordt geraadpleegd.",
        qrTypes: ["URL", "WiFi", "Text"],
    },
];
