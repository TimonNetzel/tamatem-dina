# Bildprompts – Tamatem & Dina

15. Oktober 2026 · Integrierte Bildgenerierung; kein CLI-/API-Fallback.

## Bild 1: Figurenblatt

Ausgabe: 04_Figurenblatt_Tamatem_Dina_v1.png

Neuer Entwurf auf Grundlage der festgelegten Figurenmerkmale und des beschriebenen Storyboard-Stils.

```text
Use case: stylized-concept
Asset type: production character model sheet for a narrative point-and-click comic adventure for adults, landscape 3:2 composition.
Primary request: Establish two consistent original characters, Tamatem age six and Dina age about thirty, in a colored ink comic style reminiscent of the user's black-and-white storyboard illustrations: expressive manga-influenced eyes combined with European adventure-comic staging, rich fine ink hatching, confident dark blue-black outlines, restrained flat watercolor-like colors and clear readable silhouettes. Mature graphic-novel art direction, inviting and intelligent, not a preschool cartoon, not photorealistic, not 3D.
Scene/backdrop: warm plain ivory paper with very subtle grain, plenty of clean separation between views.
Composition/framing: Two clearly separated vertical character columns in ONE coherent model sheet. Left column Tamatem: one full-body three-quarter standing view, one smaller side-profile head, and three close-up facial expressions (thoughtful, worried, quietly relieved). Right column Dina: one full-body three-quarter standing view at a realistic adult scale, one smaller side-profile head, and three close-up facial expressions (attentive, concerned, warmly amused). Keep every face large enough to read eye and eyebrow colors. Arrange with editorial precision and generous margins. Their full bodies are visible including shoes.
Character invariants, highest priority:
TAMATEM: a SIX-YEAR-OLD BOY, visibly a small child with age-appropriate proportions and a precociously serious, intelligent expression. Very light platinum-blond hair, soft side-swept fringe with individually inked strands. DISTINCT BROWN EYEBROWS and BROWN IRISES, clearly different from his blond hair. Light pale skin. Never blue/green eyes, never blond eyebrows, never black hair. Not chibi, not a teenager. Clothing: ivory collared shirt, muted deep petrol knitted vest, narrow subdued rust-colored tie, light beige practical open field jacket, charcoal shorts, pale socks and brown lace-up shoes. Small simple canvas satchel. No medical badge or stethoscope. No glasses in this base design.
DINA: an adult WOMAN about THIRTY, mature face, shoulder-length abundant DARK CURLY HAIR with distinct curls, DARK EYEBROWS, DARK EYES, WARM BEIGE SKIN visibly warmer and deeper than Tamatem's pale skin. Never straight hair, never light eyes, never a teenage face. Clothing: dark petrol blouse, muted terracotta cardigan, charcoal high-waisted trousers and practical dark shoes. Holds a small reporter's notebook and pencil. No glasses in this base design.
Lighting/mood: neutral soft daylight so all character colors can be assessed, thoughtful warmth, natural human gestures.
Color palette: blue-black ink #17212B, ivory #F4EBDD, muted petrol, soft terracotta, restrained amber; hair and skin colors exactly as specified.
Text (verbatim): only the two simple unobtrusive headings "TAMATEM · 6" and "DINA · 30". No other text, speech bubbles, logos or watermark.
Constraints: exactly these two character identities in multiple views, coherent faces, costume and colors in every view, anatomically convincing hands; the child is much shorter than the adult. This is an art-development model sheet, not a game menu.
```

## Bild 2: Der gemeinsame Arbeitstisch

Ausgabe: 05_Arbeitstisch_Tamatem_Dina_v1.png

Identitäts- und Stilreferenz: 04_Figurenblatt_Tamatem_Dina_v1.png. Diese Referenz wurde vor der Verwendung visuell geprüft.

```text
Use case: identity-preserve
Asset type: narrative scene concept artwork for the opening scene of a colored point-and-click comic adventure for adult players.
Input image: the referenced character model sheet is the identity, costume and rendering reference. Transform the model-sheet presentation into ONE unified illustrated scene. Preserve these two exact character identities, facial features, hair, eye colors and outfits; remove the model-sheet headings and layout.
Primary request: Tamatem, a precociously intelligent six-year-old boy, and Dina, an experienced investigative journalist about thirty, compare botanical research at their shared worktable shortly before Dina falls ill.
Scene/backdrop: a cozy lived-in workroom with a wooden research table in the foreground, a tall window to one side, bookshelves, botanical drawings, a few simple glass vessels and a reading lamp. On the table: a small notebook, a folded travel map, several separately recognizable research papers, a botanical drawing of a five-petaled flower with a dark ring, a simple magnifying glass, and a small unusual pale flower with one gray-marked petal in a little specimen jar. These objects support the opening sources puzzle; do not clutter them with many duplicate props.
Subjects and action: Dina sits at the table, actively comparing two papers, pencil in one hand, her expression alert and a little dryly amused. Tamatem sits or kneels on a sturdy chair beside the table, visibly much smaller than her, carefully examining the botanical drawing with the magnifying glass and glancing toward Dina. Natural collaboration and warm familiarity, not a posed portrait, not a mother lecturing a toddler. Both faces and hands fully visible, anatomically believable hands, intelligent attentive expressions.
Identity invariants: Tamatem has very light platinum-blond side-swept hair, DISTINCT BROWN EYEBROWS, BROWN EYES, pale skin, a visibly six-year-old face and child proportions. His clothes match the model sheet: ivory shirt, petrol vest, muted rust tie, beige field jacket, charcoal shorts. Dina has abundant dark shoulder-length CURLY hair, DARK EYEBROWS, DARK EYES, warm BEIGE skin, a mature adult face. Her clothes match the sheet: dark petrol blouse, terracotta cardigan and dark trousers. No eyewear in this scene. Hair and eye colors must not drift.
Style/medium: match the reference sheet's refined hand-inked colored comic illustration: fine line hatching, confident blue-black contours, restrained flat watercolor-like color fields and subtle paper texture. A mature European adventure graphic novel with expressive manga-influenced eyes. No photorealism, no glossy 3D, no excessively cute chibi styling.
Composition/framing: a single wide landscape panel approximately 16:9, medium-wide view at table height. Both characters and all five principal tabletop research objects form a clear central grouping suitable for later responsive adaptation. Background is richly observed but quieter than the subjects. Include the table edge and a little surrounding room. Leave a quiet lower margin for a future separate interface, without drawing any interface now. Do not create split panels, borders, portrait insets or a model sheet.
Lighting/mood: warm amber afternoon window light and muted petrol shadows, believable soft shadows, calm intimacy with a subtle hint of unease from the gray petal. Both characters are healthy enough to research; do not show collapse, magic explosions or a hospital.
Color palette: deep blue-black #17212B, warm ivory #F4EBDD, amber, muted teal, terracotta and brown wood, preserving specified skin and hair.
Constraints: no legible or illegible decorative text, no captions, no names, no speech bubbles, no lettering on paper (only line diagrams and blank writing areas), no UI, no logos, no watermark. Exactly these two people. This is a painted scene for later UI overlays, not a screenshot of a playable game.
```

