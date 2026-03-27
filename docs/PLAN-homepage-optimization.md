# PLAN: Homepage Optimization — Benelux Commerciële Positionering
**Slug:** `homepage-optimization`  
**Project Type:** WEB  
**Primary Agent:** `frontend-specialist`  
**Skills:** `frontend-design`, `clean-code`, `react-best-practices`

---

## Overview

De huidige homepage (`/`) bestaat uit slechts vier dunne onderdelen:
`HomeNav` → `HeroSection` (met 3 stats) → `FeaturesSection` (6 grid-kaarten) → `HomeFooter`.

Dit is **commercieel onvolledig**. Op basis van de strategische Benelux-analyse ontbreken drie kritieke conversiemechanismen:

1. **Radicale Transparantie / Prijssectie** — Geen enkele prijsvermelding. Dit is het grootste wapenfeit vs. concurrenten (Egoditor, Trueqrcode, Flowcode).
2. **Vertrouwen & Trust-signalen** — Geen testimonials, geen "gratis blijft gratis"-verbintenis, geen vergelijkingstabel.
3. **Sociale Bewijs & Lokalisatie** — Geen Benelux-specifieke context (ZZP/MKB terminologie, € prijzen, Nederlandse copy die vertrouwen schept).

---

## Strategische Analyse (Input → Plan)

### Commercieel falen concurrenten (kansen)
| Concurrent | Pijnpunt | Onze Kans |
|---|---|---|
| Egoditor / QR Code Generator PRO | Codes uitschakelen na proef | "Gratis codes blijven gratis" garantie |
| Trueqrcode (€17,95/m) | Onduidelijke prijzen, buiten Pro | Starter €14,99 — zichtbaar lager |
| Flowcode | Dure enterprise-focus | MKB-first positionering |
| Gratisqrcode.nl | Geen analytics, geen dynamisch | Technologisch superieure middenweg |

### Drie prijsniveaus (te implementeren)
| Tier | Prijs | Doelgroep | Kernfeatures |
|---|---|---|---|
| **Starter** | €14,99/m | ZZP / kleine horeca | Dynamisch, design, basisanalytics |
| **Pro** | €24,99/m | MKB | Device analytics, WhatsApp/Events, bulk 500, landingspagina's |
| **Business** | €44,99/m | Bureau / Volume | Onbeperkt, API, white-label, multi-user |

---

## Success Criteria

- [ ] Pricing sectie zichtbaar op de homepage zonder te scrollen (of met 1 scroll)
- [ ] "Gratis blijft gratis" trust-badge aanwezig in hero of boven pricing
- [ ] Drie prijsniveaus met Starter duidelijk gemarkeerd als "Populair"
- [ ] Benelux-specifieke copy (ZZP/MKB terminologie, €-teken, Nederlandse tekst)
- [ ] Geen broken TypeScript, geen lint errors
- [ ] `npm run build` succesvol

---

## Tech Stack

| Technologie | Keuze | Reden |
|---|---|---|
| Framework | Next.js App Router (bestaand) | — |
| Styling | Vanilla CSS + CSS vars (bestaand) | Geen nieuwe libraries |
| Icons | Eigen SVG-systeem `@/components/ui/icons` (bestaand) | — |
| Data | Nieuwe `pricing.ts` & uitbreiding `homepage.ts` | Clean separation of concerns |

---

## Huidig Bestandsoverzicht

```
src/app/
├── page.tsx                      ← Hoofdpagina (orchestratie)
├── _components/
│   ├── HomeNav.tsx               ← Navigatie (glas, vast)
│   ├── HeroSection.tsx           ← Hero + stats (WIJZIGEN: copy, trust-badge)
│   ├── FeaturesSection.tsx       ← Features grid (BEHOUDEN)
│   ├── HomeFooter.tsx            ← Footer (UITBREIDEN: pricing links)
│   ├── PricingSection.tsx        ← [NIEUW]
│   └── TrustSection.tsx          ← [NIEUW]
└── _data/
    ├── homepage.ts               ← Stats + features (AANPASSEN: stats versterken)
    └── pricing.ts                ← [NIEUW] Pricing data
```

---

## Proposed Changes

### Component 1 — Data Layer

#### [MODIFY] `homepage.ts` — `src/app/_data/homepage.ts`
- **Wat:** Stats versterken met commercieel krachtigere waarden (bijv. "`∞ Wijzigingen`" → "`Nooit opnieuw afdrukken`", of een 4e stat "Codes blijven actief").
- **Waarom:** Huidige stats zijn technisch, niet emotioneel. Emotie converteert.

#### [NEW] `pricing.ts` — `src/app/_data/pricing.ts`
- **Wat:** Type-safe pricing data met 3 niveaus (Starter, Pro, Business).
- **Inhoud:** `name`, `price`, `period`, `description`, `features: string[]`, `cta`, `highlighted: boolean`, `badge?: string`

---

### Component 2 — Nieuwe Secties

#### [NEW] `PricingSection.tsx` — `src/app/_components/PricingSection.tsx`
**Design Commitment: "Functioneel Brutalist — Transparantie als Architectuur"**
- **Topologische keuze:** GEEN 3-koloms symmetrische bento-grid. Gebruik een staggered verticale layout met de Pro-kaart die visueel uitsteekt (groter, anders border, badge).
- **Geometry:** Sharp edges (0-2px radius) voor prijskaarten — dit communiceert betrouwbaarheid, niet "speelsheid".
- **Kleur:** Geen default blauw. De "Populair" badge in Signal Orange of Gold — contrasteer met de neutrale achtergrond.
- **Elementen:**
  - Section header: `"Transparante prijzen. Geen verrassingen."` (copy van onze USP)
  - 3 prijskaarten (Starter / Pro / Business) met features checklist
  - Trust-microtext onder de cards: `"Annuleer elke maand. Geen creditcard vereist voor Starter."`
  - FAQ-toggle (accordeon) voor de 2 meestgestelde vragen (optional, Phase 2)

#### [NEW] `TrustSection.tsx` — `src/app/_components/TrustSection.tsx`
**Design: "Social Proof Banner — Vertrouwensbreker"**
- **Doel:** Directe reactie op markttrauma (Egoditor). Positionering als transparant alternatief.
- **Elementen:**
  - `"Uw QR-code werkt. Altijd."` — grote typografische verklaring
  - 3 vergelijkingspunten met ✓/✗ vs. "typische QR-tools": Geen verrassingen bij verlenging / Codes blijven actief / Prijzen altijd zichtbaar
  - Optioneel: 1-2 korte testimonials (placeholder-ready)

---

### Component 3 — Page Orchestration

#### [MODIFY] `page.tsx` — `src/app/page.tsx`
- Nieuwe volgorde: `HomeNav` → `HeroSection` → `FeaturesSection` → `TrustSection` → `PricingSection` → `HomeFooter`
- Import van 2 nieuwe componenten

#### [MODIFY] `HeroSection.tsx` — `src/app/_components/HeroSection.tsx`
- Copy update: voeg trust-mini-badge toe onder de CTA (bijv. `"✓ Gratis codes nooit uitgeschakeld"`).
- Stats: eventueel uitbreiden van 3 naar 4 stats, of tekst aanpassen voor Benelux-context.

#### [MODIFY] `HomeFooter.tsx` — `src/app/_components/HomeFooter.tsx`
- Voeg `/pricing` anker-link toe in footer nav.

---

## Task Breakdown

| ID | Task | Agent | Skills | Prioriteit | Dependencies |
|----|------|-------|--------|-----------|--------------|
| T1 | Maak `pricing.ts` data file (3 niveaus, TypeScript types) | frontend-specialist | clean-code | P0 | — |
| T2 | Update `homepage.ts` stats (Benelux-copy, emotionele waarden) | frontend-specialist | clean-code | P0 | — |
| T3 | Bouw `PricingSection.tsx` component | frontend-specialist | frontend-design, react-best-practices | P1 | T1 |
| T4 | Bouw `TrustSection.tsx` component | frontend-specialist | frontend-design | P1 | — |
| T5 | Update `HeroSection.tsx` (trust micro-copy + stats) | frontend-specialist | clean-code | P2 | T2 |
| T6 | Update `page.tsx` (importeer nieuwe componenten, volgorde) | frontend-specialist | react-best-practices | P2 | T3, T4 |
| T7 | Update `HomeFooter.tsx` (pricing link) | frontend-specialist | clean-code | P3 | T1 |

### INPUT → OUTPUT → VERIFY per Task

**T1 — pricing.ts**
- INPUT: Benelux pricing strategie (€14,99 / €24,99 / €44,99)
- OUTPUT: `_data/pricing.ts` met `PRICING_TIERS` array, volledig typed
- VERIFY: `npx tsc --noEmit` passed

**T3 — PricingSection.tsx**
- INPUT: `PRICING_TIERS` data
- OUTPUT: Staggered pricing layout, brutalist kaarten, Pro gemarkeerd
- VERIFY: Render op `/`, 3 kaarten zichtbaar, geen overflow op 375px viewport

**T4 — TrustSection.tsx**
- INPUT: Concurrentie-analyse (Egoditor pijnpunten)
- OUTPUT: Vergelijkingstabel of statement-blok met USP's
- VERIFY: Tekst leesbaar zonder bugs op mobile

---

## Phase X: Verification Checklist

### Automated
```bash
# Lint & Type check
npm run lint && npx tsc --noEmit

# Build
npm run build
```

### Manual (browser)
1. Start `npm run dev`, open `http://localhost:3000`
2. Scroll de volledige pagina op desktop (1920px) — alle secties zichtbaar?
3. Open DevTools → mobile view (375px iPhone SE) — geen horizontale overflow?
4. Controleer: Prijzen zichtbaar zonder scrollen op tablet (768px)?
5. Klik "Gratis starten" → redirect naar `/sign-up`?

### Rule Compliance Check
- [ ] Geen purple/violet accenten (#5B21B6, violet-*, indigo-* als primaire kleur)
- [ ] Geen generieke copy ("Empower", "Seamless", "Elevate")
- [ ] Geen bento-grid met gelijke 3-kolommen voor pricing
- [ ] Alle copy in het Nederlands

---

## Risico's

| Risico | Kans | Mitigatie |
|---|---|---|
| PricingSection voelt generiek (bento trap) | Hoog | Expliciete staggered layout, Pro-kaart alternatief ontwerp |
| CSS vars conflicten met bestaand design system | Laag | Gebruik uitsluitend bestaande `--color-*` vars |
| CTA flow onduidelijk (free vs. paid) | Medium | Pro CTA → `/sign-up?plan=pro`, Starter → `/sign-up` |
