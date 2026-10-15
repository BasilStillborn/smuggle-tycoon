const fs = require('fs');
let c = fs.readFileSync('src/core/dealer-encounters.ts', 'utf8');

// ===================== HOWARD (esp_1) TIER 1 =====================
// Pattern B — add variants array

const h1_ctx = `Howard waves you into the back of his VW camper van — beanbags, fairy lights, the faint smell of weed and old Welsh coal dust. "Sit down, butt. They've been watching the road all week — plainclothes. Supply's tight. Price went up ${Math.round(pct * 100)}%. Nothing I can do about it, mun."`;

c = c.replace(
  `context: ${h1_ctx},`,
  `context: hVars[Math.floor(Math.random() * hVars.length)],`
);

const h1_vars = `      const hVars = [
        \`Howard waves you in. "Price went up \${Math.round(pct * 100)}%, butt. Police been watching all week. Can't do fuck all about it, mun."\`,
        \`"Sit down, Angelo." Howard passes the joint. "\${Math.round(pct * 100)}% more. Plainclothes on the road. Supply's tight as a nun's cunt, mun."\`,
        \`Camper van. Beanbags. Howard exhales smoke. "\${Math.round(pct * 100)}% increase, butt. They're watching the port. Nothing I can do, you spastic."\`,
      ];
      return {`;

c = c.replace(
  'const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;\n      return {',
  'const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;\n' + h1_vars
);

// ===================== HOWARD TIER 2 =====================
// Pattern A — convert to block body with variants

const h2_ctx = `Howard's parked the camper van somewhere different tonight — further up the mountain, away from the usual spot. He gestures at a crate in the back. "Had a call from an old mate from the Valleys. He's growing something special in the Rhondda — shipped it down. Wants me to move double the usual. What do you think, butt? Feeling brave or playing safe?"`;

c = c.replace(
  `      dealerIds: ['esp_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Union Meeting',
      context: \`${h2_ctx}\`,`,
  `      dealerIds: ['esp_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => {
      const hVars2 = [
        \`"Different spot tonight." Howard gestures at a crate. "Old mate from the Valleys. Double the usual. You feeling brave or playing safe, butt?"\`,
        \`Howard's parked further up the mountain. "Rhondda special — Welsh-grown. Want double, or you happy being a small-time cunt, mun?"\`,
        \`"My mate from the pits shipped something special." Howard taps the crate. "Double the usual. Fortune or fuck-all, you spastic?"\`,
      ];
      return {
      id: nextId(),
      title: 'The Union Meeting',
      context: hVars2[Math.floor(Math.random() * hVars2.length)],`
);

// Fix closing bracket
c = c.replace(
  `        { id: 'decline', text: 'Decline. Too many red flags tonight.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: \`Howard doesn't argue. "Fair enough, butt." He scribbles something on a napkin. "That's my other number. The one the police don't know about. Call me when you're feeling bolder." Two days later you hear the Spanish Guardia raided the Rhondda shipment at the docks. Howard was one step ahead. The napkin is still in your pocket.\` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 3 — Howard (esp_1) ===`,
  `        { id: 'decline', text: 'Decline. Too many red flags tonight.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: \`Howard doesn't argue. "Fair enough, butt." He scribbles something on a napkin. "That's my other number. The one the police don't know about. Call me when you're feeling bolder." Two days later you hear the Spanish Guardia raided the Rhondda shipment at the docks. Howard was one step ahead. The napkin is still in your pocket.\` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    };
  },
  // === TIER 3 — Howard (esp_1) ===`
);

console.log("Howard done");
fs.writeFileSync('src/core/dealer-encounters.ts', c);
