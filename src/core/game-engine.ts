import type { GameState, GameAction, PlayerState, MarketPrice, JournalRunEntry, ChoiceEvent, EventChoice, GamePhase, TravelClass } from './types';
import { createPlayer, deductCash } from './player';
import { COUNTRIES, getCountry } from './world';
import { GOODS } from './goods';
import { generateMarketPrices } from './economy';
import { travel, generateSniffChoices, getTicketCost } from './travel';
import { getUsedCapacity, getRemainingCapacity, getInventoryValue, removeGood, addGood } from './inventory';
import { getHeatLevel } from './heat';
import { createDirector, updateDirector, getDirectorEventChance, getForcedEvent } from './director';
import { generateProceduralEvent, resolveEventChoice } from './events-procedural';
import { generateDealerEncounter, generateSellEncounter, getDealerOptions, p, KINGPIN_POOL, generateKingpinEncounter } from './dealer-encounters';
import { buyAsset, sellAsset, getAsset, getActiveOperationalBenefits } from './assets';
import { startTrip, endTrip as bankEndTrip, checkOverdraft, transferFromBank, transferToBank } from './bank-actions';
import { getChanceCard } from './chance-cards';
import { getSafehouseTier, SAFEHOUSE_ADVANCE_TITLES, SAFEHOUSE_ADVANCE_MSGS, SAFEHOUSE_DEMOTE_TITLES, SAFEHOUSE_DEMOTE_MSGS, SAFEHOUSE_LEVELS } from '../ui/visual/SafehouseState';

// ─── Constants ──────────────────────────────────────────────

const ORIGIN_COUNTRY = 'london';

const nullEffects = { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' };

const nullChoice = { odds: 1.0, successEffects: nullEffects, failEffects: nullEffects } as const;

const BEST_LOCATIONS_TEXT: Record<string, string> = {
  cocaine: 'Medellín, Colombia', heroin: 'Kabul, Afghanistan', hashish: 'Amsterdam, Netherlands',
  weed: 'Amsterdam, Netherlands', meth: 'Barcelona, Spain', ecstasy: 'Barcelona, Spain',
};

const BEST_LOCATION_ID: Record<string, string> = {
  cocaine: 'colombia', heroin: 'afghanistan', hashish: 'netherlands',
  weed: 'netherlands', meth: 'spain', ecstasy: 'spain',
};

const FORCED_SELL_TIER_1_2: string[] = [
  `You absolute helmet. You've gone and sold your storage without thinking, haven't you? Now your gear's everywhere and some street rat just got a steal. Good one, Angelo. You paid the stupid tax. Here's your money, minus a discount for the lucky bastard who picked up your slack. Try not to do it again, you spastic.`,
  `Oi, Einstein. Did you even look at the numbers before you sold that? Capacity this, inventory that — it's not fucking rocket science, you melt. Now some crackhead on Barking Road's just bought your surplus for pennies. You've lost money today. Your net worth just took a hit. And all because you couldn't do basic subtraction. Fucking count next time, you useless prick.`,
  `Well done, you daft cunt. You've just held a liquidation sale and forgot to invite yourself. Whatever you couldn't carry just got flogged to some Albanian bloke outside Lidl for about sixty pence and a half-eaten kebab. You're basically running a car boot sale out of your own inventory now. Hope the twenty quid you saved on the storage upgrade was worth the hundreds you just pissed away. Absolute state of you.`,
  `Let me get this straight. You bought storage. You filled it. Then you sold the storage. And now you're surprised your bag doesn't fit everything? What did you think was going to happen, Angelo? Did you think the extra space was going to follow you around like a loyal fucking dog? No. It's gone. And so's your product — sold off at a loss to some grinning bastard who saw you coming from a mile away. You've got the business acumen of a toddler with a Tamagotchi.`,
];

const FORCED_SELL_TIER_3: string[] = [
  `Look at the state of you. You had proper storage, actual assets, a reputation — and you've just pissed it away because you couldn't check your fucking capacity before selling. You absolute million-dollar clown. Some two-bit skaghead just got the score of his life at your expense. That's your profit walking out the door. Here's what's left after the discount. You know what to do with it? Fuck all. Next time: THINK, you useless cunt.`,
  `You had it, Angelo. You actually had it. A real setup. Proper capacity. And you threw it away because you couldn't be arsed to check your inventory weight before clicking 'sell.' That's not a mistake — that's a character flaw. Somebody at the airport just got a suitcase full of your best product for pocket change. They're probably on a beach somewhere right now, laughing at you. And they should be. Because you're a high-value low-IQ operation, and the universe just collected its tax. Enjoy the reminder.`,
  `Big man. Top tier. Look at you now. You thought you'd outgrown basic fucking logistics? Thought inventory management was for the little people? Well here you are, getting reamed by the consequences of your own stupidity like every other amateur who ever tried to play this game. Your surplus just got absorbed by the street at a firesale price. That's not a loss — that's a tuition fee for a lesson you should have already learned. You're not a kingpin, Angelo. You're a cautionary tale with a suit on.`,
];

// ─── Dialogue constants ──────────────────────────────────────

const DEALER_INTROS: Record<string, string[]> = {
  col_1: [
    `"Ah, Angelo, the western oriental gentleman," he winks! "Basil Stillborn of the West End!" He adjusts a cravat. "I'd offer you a sherry but the maid's run off in a tizzy, how was I suppose to know she was underage?! anyway, Do make yourself comfortable — mind the cat piss."`,
    `"Basil Stillborn, at your service." He puffs his chest. "Yes, of the West End. I'm semi-retired, you know. Bit of bother back in London — purely administrative. The Metropolitan Police have a simply dreadful sense of humour."`,
    `"Well, well. Basil Stillborn welcomes you to his humble abode." He gestures vaguely. "Don't mind the state of things — the cleaning girl let herself go. Again. Apparently walking around the house in nothing but a silk robe is triggering! Now, what can a man of the theatre do for a man of... whatever it is you do?"`,
  ],
  esp_3: [
    `"Snake." He adjusts his sunglasses indoors. "You must be Angelo. Sit down, stop looking so nervous — you're making my soldiers uncomfortable. Drink? No? Good, keep a clear head. Broke little mugs always want a drink on my tab."`,
    `"The one and only." He spreads his arms wide. "Welcome to Marbella, peasant. I own this city. Well, the bank owns most of it — but the watch is mine, the chain is mine, and the product's mine. You want in? Show me respect."`,
    `"Snake." He leans back, gold chain glinting. "I've been expecting you, weak man. Heard you've been running product through London. Cute. Small-time. I move weight. You want to play with the big boys? Keep up."`,
  ],
  esp_2: [
    `"Hey! Look at you, little guy. You look like you shopped at a flea market ten years ago, you cheap little wanker. Come here and sit down before your broke energy messes with my damn vibe — and don't ask for a drink; I'm not running a goddamn daycare."`,
    `"Welcome to the big leagues, you dark skinned voodoo boy. This whole city runs on cash, baby. You think showing up is enough? Nah. You gotta look like you own it, or at least, someone else did for you. Now, prove you're worth my time and this bottle of scotch."`,
    `"Listen to me, piece of junk. My money has standards; they require matching outfits, okay? I've been expecting somebody with some actual punch. You look like a guy who peaked in high school — so nothing."`,
  ],
  col_3: [
    `"Good God, come closer, peasant. And watch your shoes—you might step on a primary source of necessary thought. This flat is an archive; it requires respect, unlike your pathetic little wandering existence."`,
    `"Welcome to my private study. Do you even understand the weight of history? Have you read Mein Kampf? Because if you think this whole 'market' vibe is spontaneous chaos, you are hopelessly naive—a pure product of liberal sentimentality."`,
    `"I deal in things that require discipline, Angelo. My grandfather was a Kapo at Auschwitz; he took the job very seriously. He understood what absolute Order meant. You look like someone who thinks 'freedom' means wearing cheap clothes and having zero principles."`,
  ],
};

const FAREWELLS: Record<string, string[]> = {
  col_1: [
    `"Lovely doing business, Angelo." He kisses his teeth. "Do pop 'round again — if that bastard reporter is still lurking outside don't tell him anything. There's no law against parking outside a primary school, I was errr broken down!"`,
    `"Toodle-pip, you grubby little bollock." He waves dismissively. "If anyone asks, you've never met me. I'm a ghost, a spectre, a thespian phantom haunting the Colombian hills. Basil Stillborn of the West End does not exist."`,
    `"Splendid. Absolutely spiffing." He claps his hands. "Now if you'll excuse me, my cleaner's on her way up, I'm not saying she's underage, I did not say that! Cheerio!"`,
  ],
  col_2: [`$name counts the cash without looking up. "A pleasure doing business with you, Angelo." He pockets it. "Now fuck off before my men get bored and decide to practise on you, you nonce."`, `$name scratches a lottery ticket while talking. "Pleasure, Angelo. My men will see you out. Try not to stare at their guns — they get self-conscious, the sensitive cunts."`, `$name puts the cash in a drawer next to the machete. "Done. Come back when you've got more money and less attitude, you cheeky little spastic."`],
  col_3: [
    `"It was an academic exercise, truly. Don't mistake profit for principle. You should spend more time understanding the dialectic of power than you do spending cash on street trinkets, little fool."`,
    `"Done. The transaction is closed. Remember that true value comes from adherence to a superior system—a structure! It's nothing like the ephemeral nonsense covered in The Communist Manifesto. Now get out and read something meaningful."`,
    `"You need to stop acting like this whole world is some random mess. Everything falls into place, Angelo—there are patterns of power, as Marx outlined. Until you understand that kind of inevitability, peasant, you will always be adrift in your messy little chaos."`,
  ],
  net_1: [`$name gives you a distant wave, eyes at half-mast. "Safe man. Tell no one. I need to lie down — those fucking truffles are kicking in, man. The canal's singing to me, you spastic."`, `$name blinks slowly. "Cool. Yeah. Deals done. I'm gonna go see God now. These mushrooms are insane, Angelo. Say hi to the ducks for me, poofter."`, `$name nods off mid-sentence. "...safe... tell no one... the canal's singing..." He's already asleep. You let yourself out.`],
  net_2: [`$name blows you a kiss. "Transaction complete, dorogoy. Delete everything. You were never here, you filthy little nonce."`, `$name taps $pron phone. "They always come back. Especially the ones who look at me like you do. Now fuck off, darling."`, `$name freshens $pron drink. "Done. My girls charge more than you just paid, Angelo. Don't forget that on your way out, you sexy cunt."`],
  net_3: [`$name pockets the cash. "Safe. You're alright, Angelo — for a muggy little cunt. Now do one. You look suspicious just breathing, you poofter."`, `"Fuck off then." $name turns back to the football. "West Ham are losing again. Ruined my evening. Don't come back till you've got proper money, you spastic."`, `$name counts the cash, grunts. "Good. Now piss off. Got a delivery coming and I don't need you standing there looking like a nonce."`],
  esp_1: [`$name passes you the joint one last time. "Tidy work, butt. See you when you're back, mun."`, `$name climbs into the camper van. The Welsh dragon catches the sunset. "Don't rush the seam, Angelo. That's what we said down the pit. See you, butt."`, `$name flicks on the fairy lights. "Safe travels, Angelo. If you see my ex-wife, tell her I'm dead. Makes things easier for everyone, mun."`],
  esp_2: [
    `"It was... acceptable, buddy. Don't get any ideas about friendship, you cheap little wanker. Just try not to look so poor when you walk out the door. Some things need an investment — like a decent wardrobe."`,
    `"Done." She pockets the cash without counting. "Fast. Clean. You were barely worth the hassle of keeping tabs on, pal. Come back next time after you've actually gotten rich enough to afford some real clothes. Got it?"`,
    `"Get out! And listen: I earned this life, every single goddamn dollar of it. You look like a guy who took a dump in the corner of a Laundromat. Go find yourself some dignity, you silly little cunt!"`,
  ],
  esp_3: [
    `"Pleasure doing business, broke little mug." He slaps your shoulder too hard. "My soldiers will see you out. Try not to stare at the women — they're not for you. And try not to get lost on the way back. Weak men always need directions."`,
    `"Done." He pockets the cash without counting. "That's how real men operate. Fast. Decisive. Not like those weak little dealers in Amsterdam. Come back when you've made some real money. If you can, peasant."`,
    `"Get out of my sight, weak man." He flicks a speck off his shirt. "I've got a VIP table waiting. Champagne, models, things your little mind can't process. Cheerio!"`,
  ],
  afg_1: [`$name slams $pron ledger shut. "You paid, you cunt. Now get out before the drones spot you. Your country will burn one day. But today — today you walk, nonce." as you leave you notice a portrait of the prophet Mohamed framed in the courtyard, yep, defiantly looks like a kiddie toucher`, `$name gestures at the gate. "Go. The Prophet blessed this deal. Don't make me curse it by looking at your Western face any longer, you spastic."`, `$name's son opens the gate. "Allah watches all transactions. He saw you pay. He also saw you flinch when I mentioned the Kalashnikov. Leave before I tell him about that, cunt. as you leave you notice a portrait of the prophet Mohamed framed in the courtyard, you draw a cock on his forehead with a sharpie. and then leave.`],
  afg_2: [`$name adjusts his collar. "My ancestors ruled this land while yours painted themselves blue. Remember that as you leave, you insolent Blacky."`, `$name straightens a portrait. "The Durrani dynasty endures another day. You may go, Angelo. Try not to get shot on the way out — it would reflect poorly on my hospitality."`, `$name pours himself a drink. "Done. If anyone asks, you never met me. If the Taliban asks, I never met you. If they ask nicely, I never met either of us. Goodbye, you cheeky cunt."`],
};

const HAGGLE_WIN: Record<string, string[]> = {
  col_1: [
    `"Oh, very well!" He throws his hands up. "You drive a hard bargain, you continental sex pest. Fine, take it. A patron of the arts, not a businessman."`,
    `"Damn your eyes, Angelo!" He clutches his chest theatrically. "Basil Stillborn yields! Take your discount you black basted, and don't you go putting any Voodoo on me!"`,
    `"A shark, you are. A bloody shark in a tracksuit." He sighs. "Fine. Take it. I'll fleece some American tourist for extra cocaine money. Reminds me of my ex wife, she was an absolute slag! Took everything and ran off with a fucking Mexican! ...now go."`,
  ],
  col_2: [`$name studies you — then a slow, dangerous smile. "You've got some of what I had, Angelo. Fifteen percent off. Short me a dime and my men cut you from arsehole to breakfast time, you cheeky little cunt."`, `$name spits on the floor. "Fifteen percent. Because you remind me of myself — young, stupid, and hungry. That's the only discount you'll ever get, nonce."`, `$name laughs. "Nobody haggled with me when I sold fake lottery tickets. But you — you've got stones. Fifteen off. Don't push it again, you spastic."`],
  col_3: [
    `"Hahaha! You actually argued? It was surprisingly… textbook. Fifteen percent off. But remember, your desperate act of negotiation was merely a fleeting variable in my otherwise perfect understanding of Order. It means nothing."`,
    `"Fine. I allowed it because your lack of proper discipline made for an interesting display. Twenty-five percent off. Now go and internalize the concepts from The State—the concept of necessary hierarchy, you worthless consumer cattle."`,
    `"Ha! You thought you could outsmart a man who read Lenin? Unbelievable. Take it. The entire conversation was merely a temporary footnote to my life's grand thesis. Now get out before I critique your wardrobe choices."`,
  ],
  net_1: [`$name laughs and passes you the joint. "Safe, safe. Friendship discount. I grew these mushrooms myself — organic. They'll make you see God, you spastic."`, `$name grins. "Alright, mate. Fifteen percent off. But only because you didn't flinch when I mentioned the truffles. Most people flinch. You didn't. Respect, you nonce."`, `$name nods slowly. "Cool. Yeah. Discount. Fifteen percent. The universe provides, man. The canal provides. I provide. We're all connected, Angelo, you beautiful cunt."`],
  net_2: [`$name tilts her head — studying you. That slow Russian smile. "Fifteen percent off, Angelo. Because you're cute when you're nervous. Tell anyone and I'll ruin you. Then I'll fuck your best friend. Understood, darling?"`, `$name leans across the desk. "Ten percent off. And a kiss. If you refuse the kiss, the discount stays but I'm offended. Your choice, you sexy nonce."`, `$name laughs quietly. "You're the first man who's haggled with me and lived to tell the tale. Fifteen percent. Frame it, dorogoy. You've earned it."`],
  net_3: [`$name laughs — proper belly laugh. "You've got bare front, innit. Fifteen off. Because you remind me of my running mate from Canning Town. He was a cunt too. But loyal. You better be loyal, you mug."`, `$name shakes his head. "Fifteen percent. Not because you deserve it — because I'm in a good mood. West Ham scored. Don't get used to it, poofter."`, `$name grins. "Alright, you mouthy little prick. Ten percent off. And stop looking so smug — it makes me want to chin you."`],
  esp_1: [`$name chuckles — a warm, smoky laugh. "Go on then, Angelo. Fifteen percent off. Reminds me of the union meetings back in the Valleys. Not a cunt like the rest, you cheeky butt."`, `$name rolls a cigarette slowly. "Fifteen percent. Because you've got the gift of the gab, mun. Reminds me of my cousin Dai. He talked his way out of a police cell once. Also into a marriage he regretted. So — don't push it, you spastic."`, `$name passes you the joint. "Ten percent. And a story about the pit. Sit down, mun. This one's about a ghost the miners used to see."`],
  esp_2: [
    `"Haha! You actually argued? Okay, I'll give you that little shithead status — it was kinda funny. Fifteen percent off, you dark skinned voodoo boy. But don't get cocky. Your desperation is more entertaining than your actual worth."`,
    `"Fine! You got me working for it, jerk. Twenty-five percent off. But only because the fight was good theater. Next time, bring a better costume, alright? My standards are way higher than your bank account."`,
    `"Ha! A little hustler who actually talks his way into something? Unbelievable. Take it, you prick. Your whole miserable performance was worth the damn conversation. Now go buy some decent shoes and leave me alone!"`,
  ],
  esp_3: [
    `"Haha!" He points at you. "You've got balls, I'll give you that! Fifteen percent off. A real man respects aggression. Most people are sheep — you're not completely pathetic. Take the discount, don't let it go to your head."`,
    `"Fine!" He throws his hands up. "You twisted my arm, you broke little mug. Ten percent off. But only because I respect the hustle. My ex-wife tried to take half of everything — you remind me of her. Aggressive. Annoying. Effective."`,
    `"Ha! A weak man who actually negotiates." He shakes his head, grinning. "Unbelievable. Fifteen percent. Take it. I've made that back in the time we've been talking. Time is money, peasant. Your time is worth less, but still."`,
  ],
  afg_1: [`$name's eyes narrow. Then a flicker. "You have more spine than the last three Englishmen. Fifteen percent off. Tell anyone and I'll deny it. Then I'll find you. I was an abortionist for twenty years, cunt — I know how to cut things out."`, `$name pauses. "The Koran teaches courage. Fifteen percent. But I'm watching you, infidel. One wrong move and the discount becomes a bullet."`, `$name spits. "Fine. Ten percent. Because Allah loves a man who stands his ground. Even a Western nonce who probably drinks bacon milkshakes or whatever the fuck you people do."`],
  afg_2: [`$name studies you — a thin, aristocratic smile. "You have Durrani fire, Angelo. Fifteen percent off. You may kiss my ring." He extends a tarnished signet ring. He's serious, you cheeky cunt.`, `$name gestures grandly. "A gift from the aristocracy to the peasantry. Ten percent off. My grandfather would have liked you. Before the communists shot him, the sentimental old nonce."`, `$name laughs — rusty. "Fifteen percent. Because you remind me of my younger son. Before the Taliban took him. He argued about prices too. Right up until the end, the poor spastic."`],
};

const HAGGLE_LOSE: Record<string, string[]> = {
  col_1: [
    `"Absolutely not." He stiffens. "Basil Stillborn does not haggle with amateurs. The price is the price. You people have had me over one too many times already! Teach you to steal the day you're born do they!"`,
    `"You've mistaken me for a common tradesman, Angelo, you greedy little retard! I should have you shot!"`,
    `"Ha!" He barks laughter. "You think I'm desperate. I may live in a flat outside Villa Del Prado, and I may have pending child abuse allegations against me, but I am no less of a man!"`,
  ],
  col_2: [`$name slams the table. "Do you know who I AM? I own this street! Twenty percent more. Pay it or my men practise on your face, you fucking nonce."`, `$name's face goes dark. "You come into MY back room and try to HAGGLE? Thirty percent more. And a broken kneecap if you ask again, you cheeky cunt."`, `$name stands slowly. "I started selling fake lottery tickets in this street. I didn't haggle then. I don't haggle now. Twenty percent more. You spastic."`],
  col_3: [
    `"Are you fucking kidding me with this nonsense? This is a transaction built on the necessity of structure! My prices reflect historical mandate, Angelo—a concept clearly beyond your understanding."`,
    `"Listen to me close. Everything in this room, even the dust, has meaning and function. You cannot haggle away principle like it's cheap trinkets. Your little democracy can't comprehend Doctrine."`,
    `"You are an embarrassment! This conversation is a scandal in intellectual circles! Thirty percent more. Pay it, or leave this room and go read Mein Kampf—maybe you'll learn what true discipline means before you try to haggle again!"`,
  ],
  net_1: [`$name's whole face drops. "Bro. Not cool, man. You've ruined the vibe. Price went up. I need to recentre my chakras. Got any Valium, you fucking spastic?"`, `$name blinks at you, betrayed. "I was having a GOOD trip, Angelo. A good one. And you did THIS. Price up twenty percent. I'm going to go lie down and question my existence. Thanks for that, you nonce."`, `$name hugs himself. "Bad vibes, man. Bad vibes. The canal is angry with you. The ducks are angry with you. I'm angry with you. Twenty percent more, you cunt."`],
  net_2: [`$name's smile doesn't change — but the room gets colder. "Twenty percent more. Because you've wasted my time. My girls make more than this on a Tuesday lunchtime, you spastic."`, `$name lights a cigarette. Slow. "You want to haggle with ME? I own half this canal because I don't give discounts. Twenty-five percent more. And a warning: don't come back till you've learned manners, you cheeky nonce."`, `$name taps $pron nails on the desk. "No, dorogoy. The price is the price. Now it's thirty percent more because you're annoying. Decide before I decide for you, cunt."`],
  net_3: [`$name's smile vanishes. "Nah. Not in my gaff, poofter." He stands — bigger than you remembered. "Twenty percent more. Pay it or I make some calls. Your choice, you soft little prick."`, `$name stares you down. "You try to haggle with Micky? The bloke who put three men in hospital for looking at him wrong? Twenty percent more. And a slap if you talk back, you muggy cunt."`, `$name gestures at the door. "Twenty percent more. Or find another dealer. But none of them will touch you after I'm done. I know people, Angelo. Scary people, you spastic."`],
  esp_1: [`$name shakes his head slowly. "Fair's fair, Angelo. Twenty percent more. Welsh pit sense — you don't shortchange a man who's been underground, butt."`, `$name rolls a cigarette. "I don't haggle. My prices are honest because I'm honest. Twenty percent more. No hard feelings, mun. But also no discount, you cheeky cunt."`, `$name laughs sadly. "You sound like my ex-wife. Always negotiating. Twenty percent more. And a lecture about respect if you push again, you spastic."`],
  esp_2: [
    `"Are you fucking kidding me? I am premium. This isn't a yard sale, pal! My prices are set by my personal brand value and global demand — standards that your little brain can't comprehend. Now fuck off before I put my heel through your cheap little face."`,
    `"Listen to me closely, you silly little cunt. Every damn thing here has an appraisal price because it cost serious money to acquire or build. You think this is negotiable? No way. It's a solid number, piece of trash. Now get lost before I lose my temper."`,
    `"You know what?" She laughs loud. "This whole negotiation is hilarious. Thirty percent more. Pay up, or better yet, pay it and give me an apology for wasting my prime time with you. And if you don't — my boys will collect it from your teeth."`,
  ],
  esp_3: [
    `"Absolutely not." He stands up, towers over you. "You think this is a market stall? I'm Snake. I don't negotiate with broke little mugs. The price is the price. Pay it or get the fuck out."`,
    `"Listen here, you weak man." He pokes your chest. "I didn't build an empire by giving discounts to every peasant who walks through that door. Twenty percent more for wasting my time. My soldiers are laughing at you. I'm laughing at you."`,
    `"You know what?" He looks around at his soldiers, laughs. "This guy wants to haggle. With me. With this gold chain on. Unbelievable. Thirty percent more. Pay it or apologise. Actually, pay it AND apologise. To me. To the chain. To the whole concept of negotiation."`,
  ],
  afg_1: [`$name stands. Fast. "You come to MY mosque and try to HAGGLE?" His voice drops. "Thirty percent higher. Pay it or my sons show you what the West has done to us — on YOUR body, nonce."`, `$name's hand drifts to the Kalashnikov. "Twenty years of bombs and you haggle over price? Thirty percent. And a prayer that I don't lose my temper, you disrespectful cunt."`, `$name smiles — no warmth. "Allah is patient. I am not. Twenty-five percent more. One more word and it's fifty. And I collect in blood, you spastic."`],
  afg_2: [`$name's face flushes. "Do you know who my father WAS? Governor of three provinces! Twenty percent more. Pay it or I call in favours that make the Taliban look like choirboys, you nonce."`, `$name slams the empty liquor cabinet. "The Durrani dynasty does not haggle with spice merchants! Thirty percent more. And if you mention this to anyone, I'll deny it and have you killed, you cheeky cunt."`, `$name adjusts his collar — veins bulging. "Twenty percent more. My ancestors had men whipped for less. I would do the same but I've run out of staff. You're lucky, you insolent Blacky."`],
};

const WALK_AWAYS: Record<string, string[]> = {
  col_1: [
    `"Walking away? From Basil Stillborn?" He feigns outrage. "Your loss, monkey boy. I'll find another buyer. There's a lucrative market in novelty ashtrays and desperate divorcées. I assume that's your clientele?"`,
    `"Right then. Off you pop." He makes a grand gesture. "I've a radio spot for a Colombian tyre emporium to rehearse. 'Ruedas Rodríguez — they're not just round, they're extraordinary!' You'll hear it everywhere."`,
    `"Suit yourself, you grubby little bollock." He straightens his collar. "Well oof you fuck, I have a date tonight. She said she was 12 — I mean, 21. Definitely 21."`,
  ],
  col_2: [`$name doesn't look up. He scratches a lottery ticket. Loses. "Bogotá has many dealers. But only one Pablo. Come back when you're less stupid, you nonce."`, `$name tosses a losing scratch card. "Your choice. But remember — there's only one arsehole waiting to be cut. And I'm the one holding the knife, cunt."`, `$name picks up the machete. Polishes it. "Walking away. How brave. Come back when you need real money, you cheeky spastic."`],
  col_3: [
    `"Leaving? LOL! You think running away solves your inherent lack of structure? No, you're just retreating to the messy, un-curated chaos you call a home. There are no principles there."`,
    `"Right then. Don't look back at my books. Because they represent absolute truth and unwavering purpose. Everything behind you is soft, unstructured, and fundamentally disposable. You don't belong here."`,
    `"Suit yourself. Enjoy your chaotic mediocrity. I live by the principles of those who truly understood how to build a perfect system—men like my grandfather. Now go contaminate some other meaningless corner of society."`,
  ],
  net_1: [`$name gives you a distant wave. "No worries, man. Watch out for the ducks — I fed them hash brownies and they're still not right. Come back when you're less whatever you are, you spastic."`, `$name blinks slowly. "Cool. The canal's nice this time of year. Go stare at it for a while. Find yourself. Or don't. I'm not your mum, you nonce."`, `$name nods off. Wakes up. "Oh. You're still here? I thought you left in my dream. It was a good dream. You ruined it. Fuck off, you cunt."`],
  net_2: [`$name doesn't look up from her phone. "The door is behind you, dorogoy. If you change your mind — and you will — ask for the Russian, you nonce."`, `$name checks her nails. "Walking away. How dramatic. Come back when you've remembered who has the best product in Amsterdam, you spastic."`, `$name smiles — cold. "Men who walk away from me always come back. It's the ones who stay that worry me. See you soon, darling."`],
  net_3: [`$name doesn't get up. "Yeah. Off you fuck then. Amsterdam ain't London — can't just disappear. People know me. Now people know you, poofter."`, `$name turns back to the football. "West Ham are getting battered anyway. Ruined my evening. Piss off, you muggy cunt."`, `$name lights a spliff. "Walking away from Micky. Bold move. Let's see how long that lasts, you soft little prick."`],
  esp_1: [`$name watches you stand, exhaling smoke. "Right then, mun. The camper van's always here. Pop back when you're ready, butt."`, `$name flicks on the fairy lights. "No worries, Angelo. I've survived pit closures and police stakeouts. I'll survive you walking out, you cheeky cunt."`, `$name passes you the joint anyway. "Take this. For the road. And remember — the Welsh know how to wait. We've been waiting for England to give us independence for eight hundred years, mun. We can wait for you."`],
  esp_2: [
    `"Leaving? LMAO! You think this is a choice? Buddy, you're just running back to your sad little apartment where nothing exciting ever happens. Enjoy the beige wallpaper, you silly little cunt."`,
    `"Right then. Don't even look back at me. Because if you do, all I see is low effort and bad decisions. Go figure out how to make yourself interesting, alright? It's tough."`,
    `"Suit yourself. My life has too much style for your damn little corner of the world. Enjoy whatever garbage job you're doing tomorrow. And try not to stain the upholstery on your way out."`,
  ],
  esp_3: [
    `"Walking away?" He laughs loud. "Look at this guy! Walking away from Snake! I love it. Go on, broke little mug. Run back to whatever pit you crawled out of. My soldiers will be laughing about this all week."`,
    `"Right then." He straightens his collar. "Off you fuck, weak man. I've got a radio spot to do. 'Real Men, Real Money.' You should listen. Educate yourself. Maybe take notes, peasant."`,
    `"Suit yourself." He checks his watch. "I've got a bottle waiting and people who actually matter to impress. You've got whatever the fuck that is. A bus pass? A library card? Get out."`,
  ],
  afg_1: [`$name doesn't blink. "The door is behind you, cunt. The gate is automatic. If it doesn't open, don't knock — it means my sons are already on their way, nonce."`, `$name picks up the Kalashnikov. Cleans it. "Walking away from a deal with Mohamed el Mohamed. Brave. Stupid. But brave. Let's see if you're still walking tomorrow, you spastic."`, `$name calls after you in Pashto. You don't understand it. But you understand the click of the safety. You don't look back, cunt."`],
  afg_2: [`$name waves dismissively. "Go. Run back to your little island. The Durranis have survived empires — we'll survive you, you cheeky little cunt."`, `$name turns to a portrait. "Won't we, Father?" The portrait says nothing. "He agrees with me. He always does. Stuffed full of formaldehyde and obedience. Goodbye, Angelo, you spastic."`, `$name pours himself a drink. "Another one who couldn't handle the aristocracy. My grandfather would have had you whipped. I just have to settle for watching you leave. How the mighty have fallen, you nonce."`],
};

// ─── Phase guard ─────────────────────────────────────────────

const PHASE_ACTIONS: Record<GamePhase, string[]> = {
  home: ['START_TRIP', 'SELECT_PRODUCT', 'CONFIRM_FLIGHT', 'TRAVEL', 'TRANSFER_FROM_BANK', 'TRANSFER_TO_BANK', 'STASH_GOODS', 'RETRIEVE_GOODS', 'CONTACT_KINGPIN', 'VIEW_MARKET', 'VIEW_INVENTORY', 'WAIT', 'END_RUN', 'END_TRIP', 'BUY_ASSET', 'SELL_ASSET', 'SAVE', 'LOAD', 'RESPOND_EVENT', 'CANCEL_AIRPORT', 'SAFEHOUSE_TIER_CHANGE', 'BANK_TUTORIAL_SHOWN', 'MARKET_REFRESH_TUTORIAL', 'LIE_LOW_TUTORIAL', 'HOLDINGS_TUTORIAL', 'HEAT_TUTORIAL', 'ASSET_SELL_TUTORIAL', 'ASSET_TUTORIAL', 'FIRST_CLASS_WARNING_SHOWN'],
  selling: ['SELECT_PRODUCT', 'CONFIRM_FLIGHT', 'CONTACT_KINGPIN', 'MEET_KINGPIN', 'SELL', 'STASH_GOODS', 'RETRIEVE_GOODS', 'TRANSFER_FROM_BANK', 'TRANSFER_TO_BANK', 'VIEW_MARKET', 'VIEW_INVENTORY', 'WAIT', 'END_RUN', 'END_TRIP', 'BUY_ASSET', 'SELL_ASSET', 'SAVE', 'LOAD', 'RESPOND_EVENT', 'CANCEL_AIRPORT', 'SAFEHOUSE_TIER_CHANGE', 'BANK_TUTORIAL_SHOWN', 'MARKET_REFRESH_TUTORIAL', 'LIE_LOW_TUTORIAL', 'HOLDINGS_TUTORIAL', 'HEAT_TUTORIAL', 'ASSET_SELL_TUTORIAL', 'ASSET_TUTORIAL', 'FIRST_CLASS_WARNING_SHOWN'],
  buying: ['BUY', 'TRAVEL', 'FLY_HOME', 'CONTACT_KINGPIN', 'RESPOND_EVENT', 'HEAT_TUTORIAL'],
  selecting_dealer: ['SELECT_DEALER', 'FLY_HOME', 'CONTACT_KINGPIN', 'RESPOND_EVENT', 'HEAT_TUTORIAL'],
  arrived: ['AFTER_CUSTOMS', 'CONTACT_KINGPIN', 'RESPOND_EVENT', 'TRAVEL', 'HEAT_TUTORIAL'],
  flying_out: ['TRAVEL', 'CONTACT_KINGPIN', 'RESPOND_EVENT', 'HEAT_TUTORIAL'],
  flying_back: ['CONTACT_KINGPIN', 'RESPOND_EVENT', 'HEAT_TUTORIAL'],
  returned: ['CONTACT_KINGPIN', 'RESPOND_EVENT', 'STASH_GOODS', 'RETRIEVE_GOODS', 'HEAT_TUTORIAL'],
};

function isActionAllowed(phase: GamePhase, actionType: string): boolean {
  return PHASE_ACTIONS[phase]?.includes(actionType) ?? false;
}

// ─── Helpers ─────────────────────────────────────────────────

export function createGameState(): GameState {
  const player = createPlayer();
  const director = createDirector();
  const country = getCountry(player.currentCountryId)!;
  const marketPrices = generateMarketPrices(country, director, 0, player.heat);

  return {
    player, world: COUNTRIES, goods: GOODS, director, turn: 0,
    currentMarketPrices: marketPrices,
    lastEventMessage: 'Angelo. The network is waiting for you.',
    gameLog: [], pendingEvent: null, travelSniff: null,
    pendingSell: null, pendingBuy: null, pendingFlight: null,
    headingToAirport: false, selectedProductId: null, gamePhase: 'home',
    selectedDealer: null, selectedKingpin: null,
    dealerRapport: {}, marketMemory: {}, journalEntries: [],
    securitySniffsPassed: 0, buyDealsCompleted: 0, sellDealsCompleted: 0,
    firstRunTutorialShown: false, safehouseTier: 1, bankTutorialShown: false, marketRefreshTutorialShown: false, lieLowTutorialShown: false, holdingsTutorialShown: false, heatTutorialShown: false, assetSellTutorialShown: false, assetTutorialShown: false, firstClassWarningShown: false,
  };
}

export function getNetWorth(player: PlayerState, _marketPrices?: any): number {
  const invVal = player.inventory.reduce((sum, i) => {
    const g = GOODS.find(x => x.id === i.goodId);
    return sum + (g ? g.baseValuePerUnit * i.quantity : 0);
  }, 0);
  const stashVal = player.stash.reduce((sum, i) => {
    const g = GOODS.find(x => x.id === i.goodId);
    return sum + (g ? g.baseValuePerUnit * i.quantity : 0);
  }, 0);
  return player.bank + player.cash + invVal + stashVal;
}

function getBuyInfo(state: GameState) {
  const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
  const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
  const dealer = state.selectedDealer;
  const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (dealer ? dealer.priceModifier : 1)) : 100;
  const unit = selectedGood?.unitOfMeasure ?? 'x';
  const defQty = selectedGood?.standardDealSize ?? 10;
  const totalCost = buyPrice * defQty;
  const affordableQty = Math.floor((state.player.cash - 500) / buyPrice);
  const capRemaining = getRemainingCapacity(state.player);
  const weightLimit = selectedGood && selectedGood.weight > 0 ? Math.floor(capRemaining / selectedGood.weight) : Infinity;
  const maxQty = Math.max(1, Math.min(affordableQty, weightLimit));
  return { selectedGood, mktPrice, dealer, buyPrice, unit, defQty, totalCost, maxQty };
}

function createDealerIntro(state: GameState, title?: string): ChoiceEvent {
  const { dealer, buyPrice, unit, defQty, totalCost, selectedGood } = getBuyInfo(state);
  const introPool = dealer ? DEALER_INTROS[dealer.dealerId] : undefined;
  const introText = introPool && introPool.length > 0
    ? introPool[Math.floor(Math.random() * introPool.length)]
    : `${dealer?.name} is waiting for you at ${dealer?.location}.`;
  const dealerDesc = dealer?.description ? `\n\n<i>${dealer.description}</i>` : '';
  return {
    id: 'dealer_intro_' + Date.now().toString(36),
    title: title ?? `Meeting ${dealer?.name}`,
    context: `${introText}${dealerDesc}\n\n${selectedGood?.name ?? 'product'}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
    choices: [
      { id: 'qty_2', text: `2 ${unit}s — $${(buyPrice * 2).toLocaleString()}`, ...nullChoice },
      { id: `qty_${defQty}`, text: `${defQty} ${unit}s — $${totalCost.toLocaleString()}`, ...nullChoice },
      { id: 'custom_qty', text: 'Custom amount...', ...nullChoice },
      { id: 'back_out', text: 'Something\'s off — walk away', ...nullChoice },
    ],
  };
}

function createCustomQtyEvent(state: GameState): ChoiceEvent {
  const { dealer, selectedGood, buyPrice, unit, maxQty } = getBuyInfo(state);
  const event: ChoiceEvent = {
    id: 'custom_qty_' + Date.now().toString(36),
    title: 'Custom Amount',
    context: `${dealer?.name ?? 'Dealer'}: "${selectedGood?.name ?? 'product'} — $${buyPrice}/${unit}. How many, Angelo?"`,
    choices: [
      { id: 'confirm', text: '', ...nullChoice },
      { id: 'cancel', text: 'Cancel — go back', ...nullChoice },
    ],
  };
  (event as any)._buyPrice = buyPrice;
  (event as any)._maxQty = maxQty;
  (event as any)._unit = unit;
  (event as any)._goodName = selectedGood?.name ?? 'product';
  (event as any)._cash = state.player.cash;
  return event;
}

function warnEvent(title: string, context: string): ChoiceEvent {
  return { id: 'kingpin_warn_' + Date.now().toString(36), title, context, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
}

function withTurn(state: GameState, message: string): GameState {
  return { ...state, turn: state.turn + 1, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
}

function withDirector(state: GameState, player: PlayerState): GameState {
  return { ...state, director: updateDirector(state.director, player, state) };
}

function updatePeakNetWorth(player: PlayerState, _marketPrices: MarketPrice[]): PlayerState {
  const nw = player.bank + player.cash;
  return nw > player.peakNetWorth ? { ...player, peakNetWorth: nw } : player;
}

function journalEntry(state: GameState, entry: JournalRunEntry): GameState {
  return { ...state, journalEntries: [...state.journalEntries, entry] };
}

function getRecentTradeVolume(state: GameState): number {
  return state.marketMemory[state.player.currentCountryId]?.recentTradeVolume ?? 0;
}

function updateMarketMemory(state: GameState, volumeIncrease: number): GameState {
  const countryId = state.player.currentCountryId;
  const existing = state.marketMemory[countryId];
  return { ...state, marketMemory: { ...state.marketMemory, [countryId]: { countryId, recentTradeVolume: (existing?.recentTradeVolume ?? 0) + volumeIncrease, lastVisitedTurn: state.turn } } };
}

function tryTriggerProceduralEvent(state: GameState): GameState {
  if (state.pendingEvent) return state;
  const forcedReason = getForcedEvent(state.director, state.player);
  let eventChance = forcedReason ? 1.0 : getDirectorEventChance(state.director);
  if (Math.random() >= eventChance) return state;
  const event = generateProceduralEvent(state.player, state.director);
  return { ...state, pendingEvent: event, lastEventMessage: `EVENT: $${event.title}`, gameLog: [...state.gameLog, `[Turn $${state.turn}] EVENT: ${event.title}`], director: { ...state.director, timeSinceLastEvent: 0, eventCooldown: 3 } };
}

function handleOverdraft(player: PlayerState): PlayerState {
  if (!checkOverdraft(player)) return player;
  // Game over only when truly broke — no cash, no bank, no product anywhere
  if (player.bank + player.cash <= 0 && player.stash.length === 0 && player.inventory.length === 0) {
    return { ...player, runActive: false };
  }
  return player;
}

function generateSummaryEvent(title: string, context: string, hasGoods: boolean, idPrefix: 'summary' | 'return_summary' = 'summary'): ChoiceEvent {
  const choices = [
    { id: 'buy_more', text: 'Arrange Another Deal', ...nullChoice },
  ];
  if (hasGoods) {
    (choices as any[]).unshift({ id: 'continue', text: 'Proceed to Airport', ...nullChoice });
  }
  return { id: idPrefix + '_' + Date.now().toString(36), title, context, choices: choices as any };
}

// ─── RESPOND_EVENT Handlers ──────────────────────────────────

function handleChanceCard(state: GameState): GameState {
  const ce = state.pendingEvent!.choices[0].successEffects;
  let u = { ...state.player };
  if (ce.cashDelta !== 0) u.cash = Math.max(-1000, u.cash + ce.cashDelta);
  if (ce.heatDelta) u.heat = Math.min(100, Math.max(0, u.heat + ce.heatDelta));
  if (ce.reputationDelta) u.reputation = Math.min(100, Math.max(0, u.reputation + ce.reputationDelta));
  if (ce.credibilityDelta) u.credibility = Math.min(100, Math.max(0, u.credibility + ce.credibilityDelta));
  return { ...state, player: u, pendingEvent: null, lastEventMessage: ce.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${ce.message}`] };
}

function handleTutorial(state: GameState): GameState {
  return { ...state, pendingEvent: null, firstRunTutorialShown: true, lastEventMessage: 'Now build your stash. Book another flight.' };
}

function handleNoCash(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Go to your bank and withdraw more cash.' };
}

function handleEndTripWarn(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Resolve the issue before booking another flight.' };
}

function handleKingpinWarn(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Stash more product and try again.' };
}

function handleConfirmFlight(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'go_back') {
    return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'Flight cancelled.' };
  }
  const { toCountryId, travelClass } = state.pendingFlight!;
  const firstTimeBigCash = state.player.cash >= 20000 && state.player.peakNetWorth < 20000;
  if (firstTimeBigCash) {
    const bigTimeEvent: ChoiceEvent = {
      id: 'bigtime_' + Date.now().toString(36),
      title: 'You Have Entered the Big Leagues',
      context: [`You have purchased a ticket with $${state.player.cash.toLocaleString()} in your pocket.`, `Carrying $20,000 or more in cash changes your status. From now on, outbound flights will trigger customs checks. Security will be more suspicious. Dogs may circle your luggage. Officers may pull you aside.`, `You will need to talk your way through, bribe your way through, or get lucky. The days of walking straight through security are over.`, `This is the price of doing serious business. Welcome to the big leagues, Angelo.`].join('\n\n'),
      choices: [
        { id: 'continue', text: 'Proceed to the airport', ...nullChoice },
        { id: 'return_home', text: 'Return home — you are not ready', ...nullChoice },
      ],
    };
    return { ...state, pendingEvent: bigTimeEvent, pendingFlight: { toCountryId, travelClass }, lastEventMessage: 'You are now carrying $20,000+. Security will be tighter.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time threshold reached.`] };
  }
  return doTravel({ ...state, pendingEvent: null, pendingFlight: null }, toCountryId, travelClass);
}

function handleBigTime(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'return_home') {
    return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'You decided to postpone the trip. Your cash is safe in your pocket.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time trip postponed.`] };
  }
  const { toCountryId, travelClass } = state.pendingFlight!;
  return doTravel({ ...state, pendingEvent: null, pendingFlight: null }, toCountryId, travelClass);
}

function handleSummary(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const eventId = state.pendingEvent?.id ?? '';
  const isReturnSummary = eventId.startsWith('return_summary_');
  const isSellSummary = eventId.startsWith('sell_summary_');
  const isBustSummary = eventId.startsWith('bust_summary_');

   if ((isSellSummary || isBustSummary) && action.choiceId === 'continue') {
     const msg = state.player.currentCountryId === ORIGIN_COUNTRY
       ? 'You are in London. Stash goods or meet the kingpin.'
       : 'Back in London. Stash goods or meet the kingpin.';
     return { ...state, pendingEvent: null, headingToAirport: false, lastEventMessage: msg };
   }

   if (isReturnSummary) {
     if (action.choiceId === 'continue') {
       const msg = state.player.currentCountryId === ORIGIN_COUNTRY
         ? 'You are in London. Stash goods or meet the kingpin.'
         : 'Back in London. Stash goods or meet the kingpin.';
       return { ...state, pendingEvent: null, headingToAirport: false, lastEventMessage: msg };
     }
    if (action.choiceId === 'buy_more') {
      return { ...state, pendingEvent: null, headingToAirport: true, lastEventMessage: 'Choose your destination.' };
    }
  }

  if (action.choiceId === 'fly_home') {
    const hasGoods = state.player.inventory.length > 0;
    if (hasGoods) {
      const travelClass = state.pendingFlight?.travelClass ?? 'economy';
      return doTravel({ ...state, gamePhase: 'flying_out', pendingEvent: null, pendingBuy: null }, ORIGIN_COUNTRY, travelClass);
    }
    let u = { ...state.player, currentCountryId: ORIGIN_COUNTRY };
    return { ...state, player: u, gamePhase: 'home', pendingEvent: null, lastEventMessage: 'Back in London.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Returned home.`] };
  }
  if (action.choiceId === 'buy_more') {
    if (state.gamePhase !== 'buying') {
      return { ...state, pendingEvent: null, headingToAirport: true, lastEventMessage: 'Choose your destination.' };
    }
    if (!state.selectedDealer) return { ...state, pendingEvent: null, lastEventMessage: 'No dealer selected.' };
    return { ...state, pendingEvent: createDealerIntro(state), lastEventMessage: 'Back to the deal.' };
  }
  const isProceed = action.choiceId === 'continue';
  return { ...state, pendingEvent: null, headingToAirport: isProceed ? true : state.headingToAirport, lastEventMessage: isProceed ? 'Choose your destination.' : '' };
}

function handleTravelSniff(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'bribe') {
    const bribeCost = (((state.pendingEvent as any)?._bribeCost as number) ?? 500);
    if (state.player.cash < bribeCost) {
      return {
        ...state,
        lastEventMessage: `Not enough cash to bribe. Need $${bribeCost.toLocaleString()}, have $${state.player.cash.toLocaleString()}.`,
      };
    }
  }
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const isAbort = action.choiceId === 'abort';
  const beginnerMode = state.securitySniffsPassed < 3;
  const roll = Math.random();
  let success = (!isAbort && beginnerMode) ? true : (roll < choice.odds);
  if (action.choiceId === 'bribe') success = true;
  const effects = success ? choice.successEffects : choice.failEffects;
  if (effects.cashDelta === 0 && effects.heatDelta === 0 && effects.reputationDelta === 0 && effects.credibilityDelta === 0 && !effects.inventoryLost && effects.message === '') {
    return { ...state, pendingEvent: null, travelSniff: null, lastEventMessage: 'You walk away.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Aborted at checkpoint.`] };
  }
  let updatedPlayer = { ...state.player };
  updatedPlayer = deductCash(updatedPlayer, Math.abs(effects.cashDelta));
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  const lostAllCash = effects.inventoryLost ? updatedPlayer.cash : 0;
  const busted = !success && effects.inventoryLost;
  if (effects.inventoryLost) updatedPlayer = { ...updatedPlayer, inventory: [], cash: Math.max(0, updatedPlayer.cash) };
  const sniffToCountry = (!busted && choice.id !== 'abort') ? getCountry(state.travelSniff!.toCountryId) : null;
  if (sniffToCountry) updatedPlayer.currentCountryId = state.travelSniff!.toCountryId;
  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const message = `[${outcomeLabel}] ${effects.message}`;
  if (busted) {
    const bustVariants = ['They slam you face-first onto the counter.', 'Two officers drag you into a windowless room.', 'The dog handler grins as the sniffer sits by your bag.', 'They march you through the terminal in full view.', 'The customs officer reads from a screen.'];
    const bustContext = bustVariants[Math.floor(Math.random() * bustVariants.length)];
    const bustSummary: ChoiceEvent = {
      id: 'bust_summary_' + Date.now().toString(36),
      title: 'BUSTED',
      context: `BUSTED. Taken to police cells.\n\n${bustContext}\n\nFined: $${lostAllCash.toLocaleString()} confiscated`,
      choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
    };
    // Return to London after bust
    updatedPlayer.currentCountryId = ORIGIN_COUNTRY;
    let s = withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: bustSummary, travelSniff: null, lastEventMessage: '', gamePhase: 'selling' }, message), updatedPlayer);
    if (!s.player.runActive) return { ...s, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
    return s;
  }
  if (sniffToCountry) {
    const sniffArrivalLines = [`You pass through ${sniffToCountry.city} airport after the checkpoint. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${sniffToCountry.city}.`];
    const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${sniffToCountry.name}`, context: sniffArrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', ...nullChoice }] };
    let s = withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: arrivalEvent, travelSniff: null, gamePhase: 'arrived', lastEventMessage: '' }, message);
    s = { ...s, currentMarketPrices: generateMarketPrices(sniffToCountry, state.director, 0, updatedPlayer.heat), securitySniffsPassed: success ? state.securitySniffsPassed + 1 : state.securitySniffsPassed };
    return withDirector(s, updatedPlayer);
  }
  return withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: null, travelSniff: null, lastEventMessage: message }, message), updatedPlayer);
}

function handleArrival(state: GameState): GameState {
  if (state.player.currentCountryId === ORIGIN_COUNTRY) {
    if (!state.firstRunTutorialShown) {
      const tutorialEvent: ChoiceEvent = {
        id: 'tutorial_' + Date.now().toString(36),
        title: 'You Did It',
        context: `You made it back. You might have finally found something you're actually good at.\n\nDealers in London only buy in bulk. Each kingpin has a minimum — Quentin won't get out of bed for less than $750 worth of product. Avi wants $5,000 and Sergio wants $2,000.\n\nStash your goods after each trip. When you've built up enough, retrieve the product you want to sell and contact a kingpin.\n\nNow — book another flight and build your stash. You're going to need it.`,
        choices: [{ id: 'got_it', text: 'Got it — back to work', ...nullChoice }],
      };
      return { ...state, gamePhase: 'selling', pendingEvent: tutorialEvent, lastEventMessage: '' };
    }
    return { ...state, gamePhase: 'selling', pendingEvent: null, lastEventMessage: 'Welcome back to London. Stash goods or meet the kingpin.' };
  }
  const country = getCountry(state.player.currentCountryId);
  if (!country) return state;
  const options = getDealerOptions(country.id, state.dealerRapport);
  const firstVisit = !state.player.visitedCountries.includes(country.id);
  const dealerLines = options.map((opt) => `[${opt.profile.name}] — ${opt.profile.description}\n  ${opt.profile.location}`);
  const dealerEvent: ChoiceEvent = {
    id: 'dealer_select_' + Date.now().toString(36),
    title: `Choose Your Contact — ${country.city}`,
    context: `You need a supplier. Who do you want to meet?\n\n${dealerLines.join('\n\n')}`,
    choices: options.map(opt => ({ id: opt.profile.dealerId, text: `${opt.profile.name} — ${opt.profile.location}`, ...nullChoice })),
  };
  return {
    ...state,
    gamePhase: 'selecting_dealer',
    pendingEvent: dealerEvent,
    lastEventMessage: 'Choose your supplier.',
    player: firstVisit ? { ...state.player, visitedCountries: [...state.player.visitedCountries, country.id] } : state.player,
  };
}

function handleDealerSelect(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const country = getCountry(state.player.currentCountryId);
  if (!country) return state;
  const options = getDealerOptions(country.id, state.dealerRapport);
  const selected = options.find(o => o.profile.dealerId === action.choiceId);
  if (!selected) return { ...state, lastEventMessage: 'Invalid selection.' };
  const withDealer = { ...state, gamePhase: 'buying' as const, selectedDealer: selected.profile };
  return { ...withDealer, pendingEvent: createDealerIntro(withDealer), lastEventMessage: `Meeting ${selected.profile.name}...` };
}

function handleDealerIntroOrCustomQty(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'cancel') {
    return { ...state, pendingEvent: createDealerIntro(state), lastEventMessage: 'Back to the deal.' };
  }
  if (action.choiceId === 'back_out') {
    const dealer = state.selectedDealer;
    const walkArr = WALK_AWAYS[dealer?.dealerId ?? ''] ?? ['You walked away from the deal. Choose another contact or fly home.'];
    const walkLine = walkArr[Math.floor(Math.random() * walkArr.length)].replace('$name', dealer?.name ?? '');
    return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: walkLine };
  }
  if (action.choiceId === 'negotiate') {
    return handleNegotiate(state);
  }
  if (action.choiceId === 'custom_qty') {
    return { ...state, pendingEvent: createCustomQtyEvent(state), lastEventMessage: 'Choose your amount.' };
  }
  if (action.choiceId.startsWith('qty_')) {
    if (!state.selectedProductId) return { ...state, lastEventMessage: 'No product selected. Pick one from the Market panel.' };
    const qty = parseInt(action.choiceId.replace('qty_', ''), 10);
    if (isNaN(qty) || qty <= 0) return { ...state, lastEventMessage: 'Invalid quantity.' };
    return gameReducer(state, { type: 'BUY', goodId: state.selectedProductId, quantity: qty });
  }
  return state;
}

function handleNegotiate(state: GameState): GameState {
  const dealer = state.selectedDealer;
  const rapport = state.dealerRapport[dealer?.dealerId ?? ''] ?? 0;
  const pr = dealer ? p(dealer) : p({ gender: 'male' });
  const haggleSuccessChance = 0.3 + rapport * 0.15;
  const roll = Math.random();
  if (roll < haggleSuccessChance) {
    const winArr = HAGGLE_WIN[dealer?.dealerId ?? ''] ?? [`${dealer?.name} grins. "You drive a hard bargain. Fine — I'll knock 20% off. But you owe me a favour next time."\n\nThe price drops. ${pr.He} seems to respect the negotiation.`];
    const winText = winArr[Math.floor(Math.random() * winArr.length)].replace('$name', dealer?.name ?? 'Dealer');
    const negotiateEvent: ChoiceEvent = {
      id: 'haggle_win_' + Date.now().toString(36), title: 'Deal Sweetened', context: winText,
      choices: [{ id: 'accept_deal', text: 'Take the discounted deal', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 3, credibilityDelta: 5, message: '' }, failEffects: nullEffects }],
    };
    return { ...state, pendingEvent: negotiateEvent, lastEventMessage: 'Haggle successful — price lowered.' };
  }
  const loseArr = HAGGLE_LOSE[dealer?.dealerId ?? ''] ?? [`${dealer?.name}'s expression hardens. "You think I run a fucking charity? The price just went up 15%. Take it or leave it."`];
  const loseText = loseArr[Math.floor(Math.random() * loseArr.length)].replace('$name', dealer?.name ?? 'Dealer');
  const negotiateFail: ChoiceEvent = {
    id: 'haggle_lose_' + Date.now().toString(36), title: 'Dealer Offended', context: loseText,
    choices: [
      { id: 'accept_deal', text: 'Accept the higher price', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: -2, credibilityDelta: -3, message: '' }, failEffects: nullEffects },
      { id: 'back_out', text: 'Walk away — this deal is dead', ...nullChoice },
    ],
  };
  return { ...state, pendingEvent: negotiateFail, lastEventMessage: 'Haggle failed — price increased.' };
}

function handleHaggleWin(state: GameState, _action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const boosted = { ...state.player, reputation: Math.min(100, state.player.reputation + 3), credibility: Math.min(100, state.player.credibility + 5) };
  const goodDef = state.goods.find(g => g.id === state.selectedProductId);
  const defQty = goodDef?.standardDealSize ?? 10;
  return gameReducer({ ...state, player: boosted, pendingEvent: null }, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
}

function handleHaggleLose(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'back_out') {
    const dealer = state.selectedDealer;
    const pr = dealer ? p(dealer) : p({ gender: 'male' });
    return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: `You walked away. ${dealer?.name} mutters something under ${pr.his} breath.` };
  }
  let penalised = { ...state.player, reputation: Math.max(0, state.player.reputation - 2), credibility: Math.max(0, state.player.credibility - 3) };
  const goodDef = state.goods.find(g => g.id === state.selectedProductId);
  const defQty = goodDef?.standardDealSize ?? 10;
  return gameReducer({ ...state, player: penalised, pendingEvent: null }, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
}

function handleBuyEncounter(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const beginnerMode = state.buyDealsCompleted < 3;
  const roll = Math.random();
  const success = beginnerMode ? true : (roll < choice.odds);
  const effects = success ? choice.successEffects : choice.failEffects;
  let updatedPlayer = { ...state.player };
  if (effects.cashDelta !== 0) {
    if (effects.cashDelta < 0) updatedPlayer.cash = Math.max(-1000, updatedPlayer.cash - Math.abs(effects.cashDelta));
    else updatedPlayer.cash += effects.cashDelta;
  }
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  if (effects.inventoryLost) updatedPlayer = { ...updatedPlayer, inventory: [] };

  let buySummaryMsg: string | null = null;
  let s = { ...state };
  // DEAL_SETTLEMENT_BUY:
  // Apply agreed purchase settlement from pendingBuy context first.
  // This keeps cash/product bookkeeping deterministic regardless of narrative text.
  if (s.pendingBuy) {
    if (success) {
      updatedPlayer = deductCash(updatedPlayer, s.pendingBuy.totalCost);
      updatedPlayer = addGood(updatedPlayer, s.pendingBuy.goodId, s.pendingBuy.quantity);
      const goodDef = s.goods.find(g => g.id === s.pendingBuy!.goodId);
      buySummaryMsg = `BOUGHT ${s.pendingBuy.quantity} ${goodDef?.unitOfMeasure ?? 'unit'}${s.pendingBuy.quantity > 1 ? 's' : ''} of ${goodDef?.name ?? 'product'} FOR $${s.pendingBuy.totalCost.toLocaleString()}.`;
      const dealerId = s.selectedDealer?.dealerId;
      if (dealerId) {
        const current = s.dealerRapport[dealerId] ?? 0;
        s = { ...s, dealerRapport: { ...s.dealerRapport, [dealerId]: current + 1 } };
      }
    } else {
      buySummaryMsg = 'The deal fell through.';
    }
    s = { ...s, pendingBuy: null };
  }

  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const messageText = effects.message ? `[${outcomeLabel}] ${effects.message}` : '';

  const hasGoods = updatedPlayer.inventory.length > 0;
  const flyLines = [messageText];
  if (buySummaryMsg) flyLines.push(buySummaryMsg);
  if (success && s.selectedDealer) {
    const farewellArr = FAREWELLS[s.selectedDealer.dealerId];
    if (farewellArr && farewellArr.length > 0) {
      const farewellLine = farewellArr[Math.floor(Math.random() * farewellArr.length)]
        .replace(/\$name/g, s.selectedDealer.name)
        .replace(/\$pron/g, p(s.selectedDealer).his);
      flyLines.push(farewellLine);
    }
  }
  flyLines.push(`Remaining Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`);
  const flyChoices: ChoiceEvent = {
    id: 'buy_summary_' + Date.now().toString(36),
    title: buySummaryMsg ? (success ? 'Deal Successful' : 'Deal Failed') : 'Deal Failed',
    context: flyLines.join('\n\n'),
    choices: [
      { id: 'fly_home', text: hasGoods ? 'Fly home with product' : 'Fly home empty-handed', ...nullChoice },
      ...(hasGoods ? [{ id: 'buy_more', text: 'Try to buy more', ...nullChoice }] : []),
    ],
  };
  return withDirector(withTurn({ ...s, player: updatePeakNetWorth(updatedPlayer, s.currentMarketPrices), pendingEvent: flyChoices, lastEventMessage: '', buyDealsCompleted: success ? s.buyDealsCompleted + 1 : s.buyDealsCompleted }, messageText), updatedPlayer);
}

function handleSellEncounter(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const beginnerMode = state.sellDealsCompleted < 3;
  const roll = Math.random();
  const success = beginnerMode ? true : (roll < choice.odds);
  const effects = success ? choice.successEffects : choice.failEffects;
  let updatedPlayer = { ...state.player };
  if (effects.cashDelta !== 0) {
    if (effects.cashDelta < 0) updatedPlayer.cash = Math.max(-1000, updatedPlayer.cash - Math.abs(effects.cashDelta));
    else updatedPlayer.cash += effects.cashDelta;
  }
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  // DEAL_SETTLEMENT_SELL:
  // Resolve product transfer and payout from pendingSell context.
  // Revenue only applies when the product is actually transferred.
  if (effects.inventoryLost) {
    if (success) updatedPlayer.cash += state.pendingSell!.baseSellPrice * state.pendingSell!.quantity;
    updatedPlayer = removeGood(updatedPlayer, state.pendingSell!.goodId, state.pendingSell!.quantity);
  }
  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const messageText = effects.message ? `[${outcomeLabel}] ${effects.message}` : '';
  const revenue = success && effects.inventoryLost ? state.pendingSell!.baseSellPrice * state.pendingSell!.quantity : 0;
  const sellLines = success
    ? [messageText, `SOLD $${state.pendingSell!.quantity} units FOR $${revenue.toLocaleString()}.`, `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'The deal is done. You head back to your safehouse.']
    : [messageText, 'The deal failed. No payment received.', `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'You slink back to your safehouse empty-handed.'];
  const sellSummary: ChoiceEvent = {
    id: 'sell_summary_' + Date.now().toString(36), title: success ? 'Deal Successful' : 'Deal Failed', context: sellLines.join('\n\n'),
    choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
  };
  return withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: sellSummary, pendingSell: null, lastEventMessage: '', sellDealsCompleted: success ? state.sellDealsCompleted + 1 : state.sellDealsCompleted }, messageText), updatedPlayer);
}

function handleFallbackEvent(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const { player, message } = resolveEventChoice(state.player, state.pendingEvent!, action.choiceId);
  const playerWithPeak = updatePeakNetWorth(player, state.currentMarketPrices);
  const nw = getNetWorth(playerWithPeak, state.currentMarketPrices);
  const updated = handleOverdraft(playerWithPeak);
  let s = journalEntry(withTurn({ ...state, player: updated, pendingEvent: null, lastEventMessage: message }, message), { turn: state.turn + 1, type: 'event', title: `Event: $${state.pendingEvent!.title}`, description: message, cash: updated.cash, netWorth: nw, heat: updated.heat, reputation: updated.reputation });
  if (!s.player.runActive) return { ...s, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
  return withDirector(s, updated);
}

function dispatchEventResponse(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (!state.pendingEvent) return state;
  const id = state.pendingEvent.id;
  if (id.startsWith('chance_card_')) return handleChanceCard(state);
  if (id.startsWith('tutorial_')) return handleTutorial(state);
  if (id.startsWith('no_cash_')) return handleNoCash(state);
  if (id.startsWith('no_buyer_')) return { ...state, pendingEvent: null, lastEventMessage: '' };
  if (id.startsWith('end_trip_warn_')) return handleEndTripWarn(state);
  if (id.startsWith('kingpin_warn_')) return handleKingpinWarn(state);
  if (id.startsWith('empty_return_')) {
    return { ...state, pendingEvent: null, selectedDealer: null, pendingBuy: null, lastEventMessage: 'Back in London. Better luck next time.' };
  }
  if (id.startsWith('safehouse_promote_') || id.startsWith('safehouse_demote_')) {
    const nw = state.player.bank + state.player.cash;
    const newTier = getSafehouseTier(nw, state.safehouseTier);
    return { ...state, pendingEvent: null, safehouseTier: newTier, lastEventMessage: '' };
  }
  if (id.startsWith('refresh_tutorial_')) {
    return { ...state, pendingEvent: null, lastEventMessage: '' };
  }
  if (id.startsWith('lielow_tutorial_')) {
    return { ...state, pendingEvent: null, lastEventMessage: '' };
  }
  if (id.startsWith('holdings_tutorial_')) {
    return { ...state, pendingEvent: null, lastEventMessage: '' };
  }
  if (id.startsWith('heat_tutorial_')) {
    return { ...state, pendingEvent: null, heatTutorialShown: true, lastEventMessage: '' };
  }
  if (id.startsWith('assetsell_tutorial_')) {
    return { ...state, pendingEvent: null, lastEventMessage: '' };
  }
  if (id.startsWith('asset_tutorial_')) {
    return { ...state, pendingEvent: null, assetTutorialShown: true, lastEventMessage: '' };
  }
  if (id.startsWith('high_cap_')) {
    if (action.choiceId === 'go_back') {
      return { ...state, pendingEvent: createDealerIntro(state), pendingBuy: null, lastEventMessage: 'Choose a smaller quantity.' };
    }
    // risk_it — generate encounter directly (avoid BUY handler re-triggering warning)
    const pb = state.pendingBuy;
    if (!pb) return state;
    const buyCountry = getCountry(state.player.currentCountryId);
    if (!buyCountry || !state.selectedDealer) return { ...state, lastEventMessage: 'Cannot proceed with purchase.' };
    const price = state.currentMarketPrices.find(p => p.goodId === pb.goodId);
    const effectiveBuyPrice = price ? Math.floor(price.buyPrice * state.selectedDealer!.priceModifier) : 100;
    const totalCost = effectiveBuyPrice * pb.quantity;
    if (state.player.cash < totalCost) return { ...state, pendingEvent: createDealerIntro(state), pendingBuy: null, lastEventMessage: `Not enough cash. Need $${totalCost.toLocaleString()}.` };
    const encounter = generateDealerEncounter(state.player, buyCountry, state.selectedDealer, { pricePerUnit: effectiveBuyPrice, quantity: pb.quantity, totalCost });
    return { ...state, pendingEvent: encounter, pendingBuy: { goodId: pb.goodId, quantity: pb.quantity, totalCost }, lastEventMessage: `Meeting ${state.selectedDealer.name}...` };
  }
  if (id.startsWith('confirm_flight_') && state.pendingFlight) return handleConfirmFlight(state, action);
  if (id.startsWith('bigtime_') && state.pendingFlight) return handleBigTime(state, action);
  if (id.startsWith('summary_') || id.startsWith('buy_summary_') || id.startsWith('sell_summary_') || id.startsWith('return_summary_') || id.startsWith('bust_summary_')) return handleSummary(state, action);
  if (id === 'travel_sniff' && state.travelSniff) return handleTravelSniff(state, action);
  if (id.startsWith('arrival_')) return handleArrival(state);
  if (id.startsWith('dealer_select_')) return handleDealerSelect(state, action);
  if (id.startsWith('dealer_intro_') || id.startsWith('custom_qty_')) return handleDealerIntroOrCustomQty(state, action);
  if (id.startsWith('haggle_win_') && action.choiceId === 'accept_deal') return handleHaggleWin(state, action);
  if (id.startsWith('haggle_lose_')) return handleHaggleLose(state, action);
  if (id.startsWith('enc_')) return handleBuyEncounter(state, action);
  if ((id.startsWith('sell_enc_') || id.startsWith('kingpin_')) && state.pendingSell) return handleSellEncounter(state, action);
  return handleFallbackEvent(state, action);
}

// ─── Direct TRAVEL dispatch (no recursion) ───────────────────

function doTravel(state: GameState, toCountryId: string, travelClass: TravelClass): GameState {
  if (state.gamePhase !== 'home' && state.gamePhase !== 'buying' && state.gamePhase !== 'flying_out') {
    return { ...state, lastEventMessage: 'You cannot travel right now.' };
  }

  const isReturnLeg = state.gamePhase === 'buying' || state.gamePhase === 'flying_out';
  const { player: travelPlayer, result } = travel(state.player, toCountryId, travelClass, isReturnLeg);
  let player = travelPlayer;

  if (!result.success) return { ...state, player: handleOverdraft(player), lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };

  if (result.success && !result.securitySniffTriggered && travelClass === 'first_class') {
    player = { ...player, credibility: Math.min(100, player.credibility + 2) };
  }

  if (result.securitySniffTriggered) {
    const sniffEvent = generateSniffChoices(player, isReturnLeg);
    return { ...state, player: handleOverdraft(player), pendingEvent: sniffEvent, travelSniff: { toCountryId, cost: result.cost }, lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };
  }

  player.currentCountryId = toCountryId;
  const newCountry = getCountry(toCountryId)!;
  const tradeVol = getRecentTradeVolume({ ...state, player });
  const newMarketPrices = generateMarketPrices(newCountry, state.director, tradeVol, player.heat);
  const playerWithPeak = updatePeakNetWorth(player, newMarketPrices);
  const nw = getNetWorth(playerWithPeak, newMarketPrices);
  let s: GameState = withDirector(withTurn(journalEntry({ ...state, player: playerWithPeak, currentMarketPrices: newMarketPrices, lastEventMessage: result.message }, { turn: state.turn + 1, type: 'travel', title: `Traveled to ${newCountry.name}`, description: result.message, cash: playerWithPeak.cash, netWorth: nw, heat: playerWithPeak.heat, reputation: playerWithPeak.reputation }), result.message), playerWithPeak);

  if (isReturnLeg) {
    s = { ...s, gamePhase: 'selling' };
    const emptyReturnEvent: ChoiceEvent = {
      id: 'empty_return_' + Date.now().toString(36),
      title: 'Back in London',
      context: `you have arrived back in London. you had no product on you so customs was no trouble, but I bet you feel like a right useless tit after that failed run, you're a fucking bottle job, just like your old man!`,
      choices: [{ id: 'agree', text: '(I agree)', ...nullChoice }],
    };
    s.pendingEvent = emptyReturnEvent;
    s.lastEventMessage = '';
    s.selectedDealer = null;
    s.pendingBuy = null;
    return s;
  }

  const arrivalLines = [`You pass through ${newCountry.city} airport security with no trouble. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${newCountry.city}.`];
  const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${newCountry.name}`, context: arrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', ...nullChoice }] };
  return { ...s, gamePhase: 'arrived', pendingEvent: arrivalEvent, lastEventMessage: `Cleared customs in ${newCountry.city}.` };
}

// ─── Main Reducer ────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.pendingEvent && action.type !== 'RESPOND_EVENT' && action.type !== 'STASH_GOODS' && action.type !== 'RETRIEVE_GOODS' && action.type !== 'CONTACT_KINGPIN' && action.type !== 'BUY') return state;

  if (action.type !== 'RESPOND_EVENT' && !isActionAllowed(state.gamePhase, action.type)) {
    return { ...state, lastEventMessage: `Cannot ${action.type.toLowerCase()} in ${state.gamePhase} phase.` };
  }

  switch (action.type) {

    case 'START_TRIP': {
      const { player, success, message } = startTrip(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message };
      const country = getCountry(player.currentCountryId)!;
      const marketPrices = generateMarketPrices(country, state.director, 0, player.heat);
      const chanceCard = getChanceCard();
      if (chanceCard) {
        const isPositive = chanceCard.effects.cashDelta >= 0;
        const cardEvent: ChoiceEvent = {
          id: 'chance_card_' + Date.now().toString(36), title: isPositive ? 'Good Luck' : 'Bad Luck', context: chanceCard.text,
          choices: [{ id: 'acknowledge', text: 'Continue', odds: 1.0, successEffects: chanceCard.effects, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } }],
        };
        return { ...state, player, currentMarketPrices: marketPrices, pendingEvent: cardEvent, lastEventMessage: chanceCard.text, gameLog: [...state.gameLog, `[Turn $${state.turn}] Chance card: ${chanceCard.text}`] };
      }
      return { ...state, player, currentMarketPrices: marketPrices, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }

    case 'SELECT_PRODUCT': {
      return { ...state, selectedProductId: action.goodId, lastEventMessage: action.goodId ? `Selected ${state.goods.find(g => g.id === action.goodId)?.name ?? ''}.` : 'Product deselected.' };
    }

    case 'CONFIRM_FLIGHT': {
      if (!state.selectedProductId) {
        return { ...state, lastEventMessage: 'Select a product first by clicking on it in the Market panel.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flight blocked: no product selected.`] };
      }
      if (state.gamePhase !== 'home') {
        const atOrigin = state.player.currentCountryId === ORIGIN_COUNTRY;
        const hasInv = state.player.inventory.length > 0;
        if (state.gamePhase === 'selling' && atOrigin && !hasInv) {
          state = { ...state, gamePhase: 'home' };
        } else {
          const guidance = !atOrigin ? "You're abroad. Fly home first." : hasInv ? "You're carrying goods. Stash them first, then book another flight." : "Use the DEPOSIT & RETURN button to end your current trip.";
          const we: ChoiceEvent = { id: 'end_trip_warn_' + Date.now().toString(36), title: 'End Current Trip First', context: `You can't book a flight right now.\n\n${guidance}\n\nThen withdraw fresh cash if needed and book a new flight.`, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
          return { ...state, pendingEvent: we, lastEventMessage: guidance };
        }
      }
      const destCountry = getCountry(action.toCountryId);
      if (!destCountry) return { ...state, lastEventMessage: 'Invalid destination.' };
      const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
      const bestLoc = selectedGood ? BEST_LOCATIONS_TEXT[selectedGood.id] : 'the destination';
      const bestCountryId = selectedGood ? BEST_LOCATION_ID[selectedGood.id] : null;
      const isBestSource = bestCountryId === action.toCountryId;
      const estCost = getTicketCost(getCountry(state.player.currentCountryId)!, destCountry, action.travelClass);
      const goodName = selectedGood?.name ?? 'product';
      const minProdCost = selectedGood ? (state.currentMarketPrices.find(p => p.goodId === state.selectedProductId)?.buyPrice ?? 100) * selectedGood.standardDealSize : 200;
      const BRIBE_RESERVE = 500;
      const totalNeeded = estCost + minProdCost + BRIBE_RESERVE;

      if (state.player.cash < totalNeeded) {
        const reason = state.player.cash < estCost
          ? `You don't have enough cash to buy this ticket.\n\nTicket: $${estCost}\nCash on hand: $${state.player.cash.toLocaleString()}`
          : `You have enough for the ticket — but not enough to make this trip worthwhile.\n\nTicket: $${estCost}\nMinimum product: $${minProdCost.toLocaleString()} (${selectedGood?.standardDealSize ?? 10} ${selectedGood?.unitOfMeasure ?? 'unit'}${(selectedGood?.standardDealSize ?? 10) > 1 ? 's' : ''} of ${goodName})\nBuffer for expenses: $${BRIBE_RESERVE} — potential bribes can be costly, you'll want at least this spare.\n\nTotal needed: $${totalNeeded.toLocaleString()}\nCash on hand: $${state.player.cash.toLocaleString()}`;
        const we: ChoiceEvent = { id: 'no_cash_' + Date.now().toString(36), title: 'Not Enough Cash', context: `${reason}\n\nGo to the ATM at the top of the screen and withdraw more cash.`, choices: [{ id: 'understood', text: 'I understand', ...nullChoice }] };
        return { ...state, pendingEvent: we, lastEventMessage: 'Not enough cash to make this trip.' };
      }

      // Buyer check — can the player actually sell this product back home?
      let buyerNote = '';
      if (selectedGood) {
        const buyers = KINGPIN_POOL.filter(k => k.buys.includes(selectedGood.id));
        const cheapestBuyer = buyers.length > 0 ? buyers.reduce((a, b) => a.minStashValue < b.minStashValue ? a : b) : null;
        const mktPrice = state.currentMarketPrices.find(p => p.goodId === selectedGood.id);
        const baseVal = selectedGood.baseValuePerUnit;
        const unit = selectedGood.unitOfMeasure ?? 'unit';
        if (!cheapestBuyer) {
          const allBuys = [...new Set(KINGPIN_POOL.flatMap(k => k.buys))].map(id => state.goods.find(g => g.id === id)?.name ?? id).join(', ');
          const we: ChoiceEvent = { id: 'no_buyer_' + Date.now().toString(36), title: 'No Buyer', context: `Nobody in London wants ${goodName}, Angelo. The kingpins are fussy cunts — Avi only does ecstasy and cocaine, Sergio does heroin and meth, and Quentin's too busy doing lines off his chaise longue to deal in anything besides cocaine, hashish, and weed. They'll buy: ${allBuys}. Pick something else, you daft prick.`, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
          return { ...state, pendingEvent: we, lastEventMessage: 'No London buyer for this product.' };
        }
        const minQty = Math.ceil(cheapestBuyer.minStashValue / baseVal);
        const estDealerPrice = (mktPrice?.buyPrice ?? baseVal);
        const estCost = minQty * estDealerPrice;
        if (state.player.cash < estCost) {
          const we: ChoiceEvent = { id: 'no_buyer_' + Date.now().toString(36), title: 'Not Enough For Minimum', context: `You'd need at least ${minQty} ${unit}${minQty > 1 ? 's' : ''} of ${goodName} to meet ${cheapestBuyer.name}'s $${cheapestBuyer.minStashValue.toLocaleString()} minimum. That's gonna cost you about $${estCost.toLocaleString()}. You've only got $${state.player.cash.toLocaleString()} on hand, you overambitious little cunt. Withdraw more or pick something else.`, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
          return { ...state, pendingEvent: we, lastEventMessage: 'Not enough to meet minimum.' };
        }
        buyerNote = `\n\nMinimum for ${cheapestBuyer.name}: ${minQty} ${unit}s (~$${estCost.toLocaleString()})`;
      }

      const confirmEvent: ChoiceEvent = {
        id: 'confirm_flight_' + Date.now().toString(36), title: 'Confirm Flight',
        context: `Fly to ${destCountry.city}, ${destCountry.name} to buy ${goodName}?\n\n${isBestSource ? `You're heading to the best source for ${goodName}.` : `Your best source for ${goodName} is ${bestLoc}.`}\nTicket: $${estCost} (${action.travelClass === 'first_class' ? 'First Class' : 'Economy'})\nCash on hand: $${state.player.cash.toLocaleString()}${buyerNote ?? ''}\n\n${selectedGood ? `Current dealer price: $${(state.currentMarketPrices.find(p => p.goodId === selectedGood.id)?.buyPrice ?? 0).toFixed(0)}/${selectedGood.unitOfMeasure}` : ''}\n\nClick a different product in the Market panel to change your choice.`,
        choices: [
          { id: 'continue', text: 'Book flight', ...nullChoice },
          { id: 'go_back', text: 'Go back', ...nullChoice },
        ],
      };
      return { ...state, pendingEvent: confirmEvent, pendingFlight: { toCountryId: action.toCountryId, travelClass: action.travelClass }, lastEventMessage: 'Confirm your flight.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flight confirmation for ${destCountry.name}.`] };
    }

    case 'TRAVEL': return doTravel(state, action.toCountryId, action.travelClass);

    case 'AFTER_CUSTOMS': {
      if (state.gamePhase !== 'arrived') return state;
      const country = getCountry(state.player.currentCountryId)!;
      const options = getDealerOptions(country.id, state.dealerRapport);
      if (options.length === 0) return { ...state, lastEventMessage: 'No dealers available in this country. Try another destination.' };
      const firstVisit = !state.player.visitedCountries.includes(country.id);
      const dealerLines = options.map((opt, i) => {
        const rapportLabel = opt.rapportLevel > 0 ? ` (familiar: ${opt.rapportLevel})` : '';
        return `[${i + 1}] ${opt.profile.name} — ${opt.profile.description}${rapportLabel}\n  ${opt.profile.location}`;
      });
      const dealerEvent: ChoiceEvent = {
        id: 'dealer_select_' + Date.now().toString(36), title: `Choose Your Contact — ${country.city}`,
        context: `You need a supplier. Who do you want to meet?\n\n${dealerLines.join('\n\n')}`,
        choices: options.map(opt => ({ id: opt.profile.dealerId, text: `${opt.profile.name} — ${opt.profile.location}`, ...nullChoice })),
      };
      return {
        ...state,
        gamePhase: 'selecting_dealer',
        pendingEvent: dealerEvent,
        lastEventMessage: 'Choose your supplier.',
        player: firstVisit ? { ...state.player, visitedCountries: [...state.player.visitedCountries, country.id] } : state.player,
      };
    }

    case 'SELECT_DEALER': {
      if (state.gamePhase !== 'selecting_dealer') return state;
      const country = getCountry(state.player.currentCountryId);
      if (!country) return state;
      const options = getDealerOptions(country.id, state.dealerRapport);
      const selected = options.find(o => o.profile.dealerId === action.dealerId);
      if (!selected) return { ...state, lastEventMessage: 'Invalid dealer selection.' };
      const withDealer = { ...state, gamePhase: 'buying' as const, selectedDealer: selected.profile };
      return { ...withDealer, pendingEvent: createDealerIntro(withDealer), lastEventMessage: `Meeting ${selected.profile.name}...` };
    }

    case 'BUY': {
      if (state.gamePhase !== 'buying') return { ...state, lastEventMessage: 'You can only buy product from a dealer abroad.' };
      if (!state.selectedDealer) return { ...state, lastEventMessage: 'No dealer selected.' };
      const buyCountry = getCountry(state.player.currentCountryId);
      if (!buyCountry) return { ...state, lastEventMessage: 'Cannot buy here.' };
      const buyGoodDef = state.goods.find(g => g.id === action.goodId);
      if (!buyGoodDef) return { ...state, lastEventMessage: 'Unknown good.' };
      const price = state.currentMarketPrices.find(p => p.goodId === action.goodId);
      if (!price) return { ...state, lastEventMessage: 'Good not available.' };
      const effectiveBuyPrice = Math.floor(price.buyPrice * state.selectedDealer.priceModifier);
      const totalCost = effectiveBuyPrice * action.quantity;
      if (state.player.cash < totalCost) return { ...state, lastEventMessage: `Need $${totalCost.toLocaleString()}, have $${state.player.cash.toLocaleString()}.` };
      const weightNeeded = buyGoodDef.weight * action.quantity;
      if (weightNeeded > getRemainingCapacity(state.player)) return { ...state, lastEventMessage: 'Not enough inventory capacity.' };
      // High-capacity warning — ≥70% of remaining weight
      const remCap = getRemainingCapacity(state.player);
      if (remCap > 0 && weightNeeded / remCap >= 0.7) {
        const unit = buyGoodDef.unitOfMeasure ?? 'x';
        const capPct = Math.round((weightNeeded / remCap) * 100);
        const capMsgs = [
          `You're buying ${action.quantity} ${unit}s of ${buyGoodDef.name}? That's ${capPct}% of your carry capacity, Angelo. Customs will absolutely notice this much product on you, you greedy little cunt. You'll be sweating at the checkpoint. Dogs will sit. Officers will pull you aside. You might get through — but it's a fucking gamble.`,
          `${capPct}% of your bag space, Angelo. You're not smuggling anymore, you're moving house. Customs are going to take one look at you waddling through the terminal like a pregnant fucking mule and pull you straight into secondary. "Anything to declare, sir?" Yeah mate — that you're a greedy little prick who doesn't know when to stop. It's your funeral.`,
          `${action.quantity} fucking ${unit}s, Angelo? Really? You look like you're trying to supply the whole of Greater London single-handedly. They've got dogs at Heathrow, mate — German Shepherds, not chihuahuas. They will ABSOLUTELY smell this. You're gonna be the easiest bust they've had all week. The customs officer's already practising his "well done team" speech. Risk it if you want, you overambitious cunt.`,
          `You're carrying ${action.quantity} ${unit}s of ${buyGoodDef.name}. That's not a personal stash, Angelo — that's a distribution network. ${capPct}% of your capacity. If they catch you with this much weight, they don't give you a fine. They give you a cellmate called Barry who wants to show you his stamp collection. Every. Single. Night. Are you SURE you want to go through customs looking like a Colombian freight ship? Your call, you mad bastard.`,
          `Angelo, my son. ${action.quantity} ${unit}s. That is ${capPct}% of everything you can carry. You are not a smuggler anymore. You are a logistics company with a pulse. Customs will look at you the way a fat kid looks at the last slice of cake — they're going to GET you. They'll strip search you. They'll find things you didn't even know you had. And then they'll find the ${buyGoodDef.name}. And then you're going to prison. Where they'll call you "Fish." Because that's what happens to pretty boys like you, you daft little prick.`,
        ];
        const capMsg = capMsgs[Math.floor(Math.random() * capMsgs.length)];
        const riskEvent: ChoiceEvent = {
          id: 'high_cap_' + Date.now().toString(36),
          title: 'Risk Warning',
          context: capMsg,
          choices: [
            { id: 'risk_it', text: 'Risk it — buy anyway', odds: 1.0, successEffects: nullEffects, failEffects: nullEffects },
            { id: 'go_back', text: 'Go back — lower quantity', odds: 1.0, successEffects: nullEffects, failEffects: nullEffects },
          ],
        };
        return { ...state, pendingEvent: riskEvent, pendingBuy: { goodId: action.goodId, quantity: action.quantity, totalCost }, lastEventMessage: `Warning: ${capPct}% of capacity.` };
      }
      const dealContext = { pricePerUnit: effectiveBuyPrice, quantity: action.quantity, totalCost };
      const encounter = generateDealerEncounter(state.player, buyCountry, state.selectedDealer, dealContext);
      return { ...state, pendingEvent: encounter, pendingBuy: { goodId: action.goodId, quantity: action.quantity, totalCost }, lastEventMessage: `Meeting ${state.selectedDealer.name}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Buying from ${state.selectedDealer.name}.`] };
    }

    case 'CONTACT_KINGPIN': {
      if (state.gamePhase !== 'selling') return { ...state, pendingEvent: warnEvent('Not Available', 'You can only contact kingpins once you meet the minimum stash threshold. Fly abroad, do some deals, and build up your stash first.') };
      const kingpin = KINGPIN_POOL.find(k => k.id === action.kingpinId);
      if (!kingpin) return { ...state, pendingEvent: warnEvent('Error', 'Invalid kingpin selection.') };
      if (state.player.inventory.length === 0) return { ...state, pendingEvent: warnEvent('No Product', `You've got nothing on you, Angelo. Empty pockets, empty bag. You need to retrieve product from your stash first. The kingpins aren't going to buy fresh air, you daft little cunt. Go to the Inventory panel, click what you want to sell, bring it out — THEN make the call. fuck me they said you were lazy this takes the piss!`), lastEventMessage: 'No product to sell.' };
      if (state.player.inventory.length > 1) {
        const names = state.player.inventory.map(i => state.goods.find(g => g.id === i.goodId)?.name ?? i.goodId).join(', ');
        return { ...state, pendingEvent: warnEvent('One At A Time', `You can only sell one type of product at a time.\n\nYou're carrying: ${names}\n\nStash the ones you're not selling first.`), lastEventMessage: 'Sell one product at a time.' };
      }
      const sellGood = state.player.inventory[0];
      const goodDef = state.goods.find(g => g.id === sellGood.goodId);
      const sellPriceData = state.currentMarketPrices.find(p => p.goodId === sellGood.goodId);
      if (!sellPriceData) return { ...state, pendingEvent: warnEvent('No Buyer', 'No buyer for this product right now. Check the market prices first.') };
      if (kingpin.buys && !kingpin.buys.includes(sellGood.goodId)) {
        const accepted = kingpin.buys.map(id => state.goods.find(g => g.id === id)?.name ?? id).join(', ');
        const gName = goodDef?.name ?? sellGood.goodId;
        return { ...state, pendingEvent: warnEvent('Wrong Product', `${kingpin.name} doesn't deal in ${gName}. ${kingpin.name} only buys ${accepted}. Take that shit somewhere else.`) };
      }
      const productValue = sellPriceData.sellPrice * sellGood.quantity;
      if (productValue < kingpin.minStashValue) {
        return { ...state, pendingEvent: warnEvent('Below Minimum', `These kingpins don't get out of bed for pocket change, Angelo, you lazy coon. You've got to build up your stash first — make a few runs, stack some product, THEN give them a bell. You can't walk into Hatton Garden with a tenner and expect Avi to roll out the red carpet, that covetous Jew will take everything you've got, even if you've got nothing. So start small with the chav behind Chicken Cottage. Build up. Then go big. When you've got enough product, the big boys will take your call. Until then, you're just another wannabe with a bag of nothing. You cant fuck about here, Angelo, youre not in Zimbabwe anymore!`), lastEventMessage: 'Need more product.' };
      }
      const goodName = goodDef?.name ?? 'goods';
      const adjustedPrice = Math.floor(sellPriceData.sellPrice * kingpin.sellPriceMod);
      const kingpinEvent = generateKingpinEncounter(state.player, kingpin, goodName, productValue);
      return { ...state, selectedKingpin: kingpin, pendingEvent: kingpinEvent, pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: adjustedPrice, countryId: 'london' }, lastEventMessage: `Calling ${kingpin.name}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Contacted kingpin: ${kingpin.name}.`] };
    }

    case 'MEET_KINGPIN': {
      if (state.gamePhase !== 'selling') return { ...state, lastEventMessage: 'No kingpin available now.' };
      if (state.player.inventory.length === 0) return { ...state, lastEventMessage: 'No product to sell. Retrieve goods from stash first.' };
      const sellGood = state.player.inventory[0];
      const sellPriceData = state.currentMarketPrices.find(p => p.goodId === sellGood.goodId);
      if (!sellPriceData) return { ...state, lastEventMessage: 'No buyer for this product right now.' };
      const goodName = GOODS.find(g => g.id === sellGood.goodId)?.name ?? 'goods';
      const country = getCountry(state.player.currentCountryId)!;
      const kingpinEvent = generateSellEncounter(state.player, country, goodName);
      return { ...state, pendingEvent: kingpinEvent, pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: sellPriceData.sellPrice, countryId: country.id }, lastEventMessage: `Meeting kingpin in ${country.city}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Kingpin meeting.`] };
    }

    case 'SELL': {
      if (state.gamePhase !== 'selling') return { ...state, lastEventMessage: 'You can only sell through the kingpin.' };
      return { ...state, lastEventMessage: 'Use MEET_KINGPIN to arrange a sale.' };
    }

    case 'STASH_GOODS': {
      if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot stash goods now.' };
      if (state.player.inventory.length === 0) return { ...state, lastEventMessage: 'Nothing to stash.' };
      const stashWeight = state.player.inventory.reduce((sum, item) => { const g = state.goods.find(x => x.id === item.goodId); return sum + (g ? g.weight * item.quantity : 0); }, 0);
      const stashFree = state.player.stashCapacity - state.player.stash.reduce((sum, item) => { const g = state.goods.find(x => x.id === item.goodId); return sum + (g ? g.weight * item.quantity : 0); }, 0);
      if (stashWeight > stashFree) return { ...state, lastEventMessage: `Not enough stash space. Need $${stashWeight.toFixed(1)}kg, have ${stashFree.toFixed(1)}kg free.` };
      let updatedStash = state.player.stash.map(s => ({ ...s }));
      for (const item of state.player.inventory) {
        const idx = updatedStash.findIndex(s => s.goodId === item.goodId);
        if (idx >= 0) { updatedStash[idx] = { ...updatedStash[idx], quantity: updatedStash[idx].quantity + item.quantity }; }
        else { updatedStash.push({ goodId: item.goodId, quantity: item.quantity }); }
      }
      return { ...state, player: { ...state.player, inventory: [], stash: updatedStash }, lastEventMessage: `Stashed $${state.player.inventory.reduce((s, i) => s + i.quantity, 0)} units in your storage.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Goods stashed.`] };
    }

case 'RETRIEVE_GOODS': {
       if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot retrieve goods now.' };
       const stashItem = state.player.stash.find(s => s.goodId === action.goodId);
       if (!stashItem || stashItem.quantity < action.quantity) return { ...state, lastEventMessage: 'Not enough in stash.' };
       const g = state.goods.find(x => x.id === action.goodId);
       const weightNeeded = g ? g.weight * action.quantity : 0;
       const capFree = state.player.inventoryCapacity - state.player.inventory.reduce((sum, item) => { const gi = state.goods.find(x => x.id === item.goodId); return sum + (gi ? gi.weight * item.quantity : 0); }, 0);
       if (weightNeeded > capFree) return { ...state, lastEventMessage: 'Not enough inventory space.' };
       let newStash = state.player.stash.map(s => s.goodId === action.goodId ? { ...s, quantity: s.quantity - action.quantity } : s).filter(s => s.quantity > 0);
       let newInv = state.player.inventory.map(i => ({ ...i }));
       const existing = newInv.find(i => i.goodId === action.goodId);
       if (existing) { newInv = newInv.map(i => i.goodId === action.goodId ? { ...i, quantity: i.quantity + action.quantity } : i); }
       else { newInv.push({ goodId: action.goodId, quantity: action.quantity }); }
       return { ...state, player: { ...state.player, stash: newStash, inventory: newInv }, lastEventMessage: `Retrieved $${action.quantity}x from stash.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Retrieved from stash.`] };
     }

    case 'FLY_HOME': {
      if (state.gamePhase !== 'buying') return { ...state, lastEventMessage: 'Cannot fly home now.' };
      let updatedPlayer = { ...state.player, currentCountryId: ORIGIN_COUNTRY, cash: Math.max(0, state.player.cash) };
      updatedPlayer = handleOverdraft(updatedPlayer);
      return { ...state, player: updatedPlayer, gamePhase: 'home', lastEventMessage: 'You flew home empty-handed. Better luck next time.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flew home empty.`] };
    }

    case 'RESPOND_EVENT': return dispatchEventResponse(state, action as GameAction & { type: 'RESPOND_EVENT'; choiceId: string });

    case 'VIEW_MARKET': {
      const country = getCountry(state.player.currentCountryId)!;
      const tradeVol = getRecentTradeVolume(state);
      const prices = generateMarketPrices(country, state.director, tradeVol, state.player.heat);
      const priceList = prices.map(p => `${p.goodName}: Buy=$${p.buyPrice} Sell=$${p.sellPrice} (Demand:${p.demand})`).join('\n  ');
      const updatedPlayer = { ...state.player, reputation: Math.max(0, state.player.reputation - 2) };
      return { ...state, player: updatedPlayer, currentMarketPrices: prices, lastEventMessage: `Market prices in ${country.name}:\n  ${priceList}` };
    }

    case 'MARKET_REFRESH_TUTORIAL': {
      const country = getCountry(state.player.currentCountryId)!;
      const tradeVol = getRecentTradeVolume(state);
      const prices = generateMarketPrices(country, state.director, tradeVol, state.player.heat);
      const updatedPlayer = { ...state.player, reputation: Math.max(0, state.player.reputation - 2) };
      const refreshEvt: ChoiceEvent = {
        id: 'refresh_tutorial_' + Date.now().toString(36),
        title: 'Refreshing Prices',
        context: `You're basically hanging around waiting for the market to shift, Angelo. Every time you refresh prices, dealers notice you lurking — you look desperate. Loses you a bit of street rep. Not much — just enough that people start thinking you're a bit of a melt. Every refresh: -2 reputation. Don't spam it, you needy little prick.`,
        choices: [{ id: 'understood', text: 'Understood', ...nullChoice }],
      };
      return { ...state, player: updatedPlayer, currentMarketPrices: prices, marketRefreshTutorialShown: true, pendingEvent: refreshEvt, lastEventMessage: 'Prices refreshed (-2 rep).' };
    }

    case 'VIEW_INVENTORY': {
      const used = getUsedCapacity(state.player);
      const remaining = getRemainingCapacity(state.player);
      const invValue = getInventoryValue(state.player, state.currentMarketPrices);
      let invList = 'Empty';
      if (state.player.inventory.length > 0) { invList = state.player.inventory.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  '); }
      let stashList = 'Empty';
      if (state.player.stash.length > 0) { stashList = state.player.stash.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  '); }
      return { ...state, lastEventMessage: `INVENTORY (${used.toFixed(3)}/${state.player.inventoryCapacity}kg)\n  ${invList}\nEstimated value: $${invValue.toLocaleString()}\n\nSTASH (${state.player.stash.reduce((s, i) => { const g = state.goods.find(x => x.id === i.goodId); return s + (g ? g.weight * i.quantity : 0); }, 0).toFixed(1)}/${state.player.stashCapacity}kg)\n  ${stashList}` };
    }

    case 'LIE_LOW_TUTORIAL': {
      let updatedPlayer: PlayerState = { ...state.player };
      const ops = getActiveOperationalBenefits(updatedPlayer);
      const decay = Math.floor((5 + Math.random() * 10) * (1 + ops.heatDecayBonus));
      updatedPlayer.heat = Math.max(0, updatedPlayer.heat - decay);
      updatedPlayer.credibility = Math.max(0, updatedPlayer.credibility - 5);
      const repDecay = Math.floor(1 + Math.random() * 2);
      updatedPlayer.reputation = Math.max(0, updatedPlayer.reputation - repDecay);
      const lieLowEvt: ChoiceEvent = {
        id: 'lielow_tutorial_' + Date.now().toString(36),
        title: 'Lying Low',
        context: `You want to disappear for a bit, Angelo? Lie low — keep your head down, let the heat die off. But here's the thing: the same racist cops who'd happily fit you up for a parking ticket are out there wondering why some black cunt who looks like you has suddenly gone quiet. They notice. People talk. Your street rep takes a hit every time you vanish — a couple of points off your credibility too, because you look like you're running. And around here, looking like you're running is worse than actually running. Every lie-low: -5 credibility, -1 to 3 reputation. Heat drops faster if you've got operational assets. Don't hide too long, chocolate boy — they'll think you've been nicked.`,
        choices: [{ id: 'understood', text: 'Understood', ...nullChoice }],
      };
      let s: GameState = withTurn({ ...state, player: updatedPlayer, pendingEvent: lieLowEvt, lastEventMessage: `You wait and lie low. Heat -$${decay}. Cred -5. Rep -${repDecay}.`, lieLowTutorialShown: true }, `Waited. Heat -${decay}. Cred -5. Rep -${repDecay}.`);
      return tryTriggerProceduralEvent(withDirector(s, updatedPlayer));
    }

    case 'HOLDINGS_TUTORIAL': {
      const holdEvt: ChoiceEvent = {
        id: 'holdings_tutorial_' + Date.now().toString(36),
        title: 'Product Valuation',
        context: `Your Holdings panel shows the STREET VALUE of your product — what it's worth at current market prices. This is the number that matters. The kingpins work off street value too, you daft wanker — not some theoretical "base price" from a textbook.\n\nSo if your Holdings say $9,900 and Quentin wants $750 minimum, you're well over. But if demand crashes and the same product is worth $400, you're fucked — that's below his minimum.\n\nWatch the market. Wait for demand. Sell when the price is right.\n\nPRICE IS THE PRICE, DEEP STATE, NO FUCKING ABOUT!`,
        choices: [{ id: 'understood', text: 'Understood', ...nullChoice }],
      };
      return { ...state, pendingEvent: holdEvt, holdingsTutorialShown: true, lastEventMessage: '' };
    }

    case 'HEAT_TUTORIAL': {
      if (state.heatTutorialShown) return state;
      const heatEvt: ChoiceEvent = {
        id: 'heat_tutorial_' + Date.now().toString(36),
        title: 'Heat',
        context: `Heat is your "how close am I to getting nicked" meter.\nWhen it rises, the law starts paying attention — more checks, more pressure, more risk.\nUse Lie Low to cool things down and get the fuzz off your back, but being off the scene costs you a little reputation.`,
        choices: [{ id: 'understood', text: 'I understand', ...nullChoice }],
      };
      return { ...state, pendingEvent: heatEvt, lastEventMessage: '' };
    }

    case 'ASSET_SELL_TUTORIAL': {
      const sellEvt: ChoiceEvent = {
        id: 'assetsell_tutorial_' + Date.now().toString(36),
        title: 'Selling Assets',
        context: `Things must've gone really wrong if you're having to sell some of this stuff to make ends meet, Angelo. You buy a gold watch for five grand — you'll get two and a half back if you're lucky. It's worse for cars and boats. Forty percent of what you paid. Operational gear? Thirty percent. You're basically paying a stupidity tax. So before you sell, ask yourself: is this REALLY the moment you became the kind of cunt who pawns his own watch to buy product?\n\nSell at your own risk, you desperate little prick.`,
        choices: [{ id: 'understood', text: 'Understood', ...nullChoice }],
      };
      return { ...state, pendingEvent: sellEvt, assetSellTutorialShown: true, lastEventMessage: '' };
    }

    case 'ASSET_TUTORIAL': {
      if (state.assetTutorialShown) return state;
      const assetEvt: ChoiceEvent = {
        id: 'asset_tutorial_' + Date.now().toString(36),
        title: 'Sort Your Status Out',
        context: `Listen here, you melt. This is where you buy things that make you look less like a council-estate bell end. Watches, jewelry, cars, property — each one gives you a bit of street cred. The more you own, the more people think you're legit. And when the feds are sniffing around, looking like you belong somewhere is half the battle.\n\nBut that's not all. Certain bits of kit actually do something useful: storage space for your product, extra carry capacity on your person, contacts in new countries, even mates on the inside who can reduce scrutiny at customs. Read the fine print on each item — you're not just buying a watch, you're buying a whole new level of operation.\n\nNow the bad news: if you ever need to flog this stuff, you'll take a kicking. Fifty percent if you're lucky. Thirty or forty for the flashier stuff. You're basically paying a stupidity tax for needing the cash. So don't buy what you can't hold onto, you desperate little prick.\n\nRight — get shopping, you nonce. Just don't come crying when you sell at a loss.`,
        choices: [{ id: 'understood', text: 'I get it', ...nullChoice }],
      };
      return { ...state, pendingEvent: assetEvt, assetTutorialShown: true, lastEventMessage: '' };
    }

    case 'FIRST_CLASS_WARNING_SHOWN': return { ...state, firstClassWarningShown: true };

    case 'WAIT': {
      let updatedPlayer: PlayerState = { ...state.player };
      const ops = getActiveOperationalBenefits(updatedPlayer);
      const decay = Math.floor((5 + Math.random() * 10) * (1 + ops.heatDecayBonus));
      updatedPlayer.heat = Math.max(0, updatedPlayer.heat - decay);
      updatedPlayer.credibility = Math.max(0, updatedPlayer.credibility - 5);
      const repDecay = Math.floor(1 + Math.random() * 2);
      updatedPlayer.reputation = Math.max(0, updatedPlayer.reputation - repDecay);
      let s: GameState = withTurn({ ...state, player: updatedPlayer, lastEventMessage: `You wait and lie low. Heat -$${decay}. Credibility -5. Reputation -${repDecay}.` }, `Waited. Heat -${decay}. Cred -5. Rep -${repDecay}.`);
      return tryTriggerProceduralEvent(withDirector(s, updatedPlayer));
    }

    case 'END_RUN': {
      const nw = getNetWorth(state.player, state.currentMarketPrices);
      return journalEntry({ ...state, player: { ...state.player, runActive: false }, lastEventMessage: 'Run ended. Game over.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Run ended.`] }, { turn: state.turn, type: 'run_end', title: 'Run Concluded', description: `Final tally: $${state.player.cash.toLocaleString()} cash · $${state.player.bank.toLocaleString()} bank · ${state.player.totalTrips} trips · ${state.player.totalBusts} busts`, cash: state.player.cash, netWorth: nw, heat: state.player.heat, reputation: state.player.reputation });
    }

    case 'END_TRIP': {
      const { player, message } = bankEndTrip(state.player, ORIGIN_COUNTRY);
      let s: GameState = withTurn({ ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: message, gamePhase: 'home' }, message);
      return withDirector(s, player);
    }

    case 'TRANSFER_FROM_BANK': {
      const { player, success, message } = transferFromBank(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
      return { ...state, player: handleOverdraft(player), lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }
    case 'TRANSFER_TO_BANK': {
      const { player, success, message } = transferToBank(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
      return { ...state, player, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }

    case 'BUY_ASSET': {
      const asset = getAsset(action.assetId);
      if (!asset) return { ...state, lastEventMessage: 'Asset not found.' };
      const { player, success } = buyAsset(state.player, asset);
      if (!success) return { ...state, lastEventMessage: 'Cannot afford or already owned.' };
      const nw = getNetWorth(player, state.currentMarketPrices);
      return journalEntry({ ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: `Purchased $${asset.name} for $${asset.price.toLocaleString()}. Credit +${asset.creditValue}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Bought asset: ${asset.name}.`] }, { turn: state.turn, type: 'purchase', title: `Bought $${asset.name}`, description: asset.description, cash: player.cash, netWorth: nw, heat: player.heat, reputation: player.reputation });
    }

    case 'SELL_ASSET': {
      const asset = getAsset(action.assetId);
      if (!asset) return { ...state, lastEventMessage: 'Asset not found.' };
      const oldCap = state.player.inventoryCapacity;
      const { player: playerAfterSell, payout: assetPayout, success } = sellAsset(state.player, action.assetId);
      if (!success) return { ...state, lastEventMessage: 'Asset not found or not owned.' };
      const usedAfter = getUsedCapacity(playerAfterSell);
      const newCap = playerAfterSell.inventoryCapacity;
      if (usedAfter > newCap && oldCap !== newCap) {
        const overflowKg = usedAfter - newCap;
        let remainingKg = overflowKg;
        let liquidationTotal = 0;
        let soldDesc: string[] = [];
        let updatedInv = [...playerAfterSell.inventory];
        for (let i = 0; i < updatedInv.length && remainingKg > 0; i++) {
          const item = updatedInv[i];
          const good = GOODS.find(g => g.id === item.goodId);
          if (!good || good.weight <= 0) continue;
          const itemKg = good.weight * item.quantity;
          if (itemKg <= 0) continue;
          const kgToTake = Math.min(remainingKg, itemKg);
          const unitsToSell = Math.ceil(kgToTake / good.weight);
          const actualKg = good.weight * unitsToSell;
          const newQty = item.quantity - unitsToSell;
          const sellAmount = Math.floor(good.baseValuePerUnit * unitsToSell * 0.3);
          liquidationTotal += sellAmount;
          remainingKg -= actualKg;
          soldDesc.push(`${unitsToSell} ${good.unitOfMeasure} of ${good.name} for $${sellAmount}`);
          if (newQty <= 0) updatedInv[i] = { ...item, quantity: 0 };
          else updatedInv[i] = { ...item, quantity: newQty };
        }
        updatedInv = updatedInv.filter(i => i.quantity > 0);
        const mockeryPool = state.safehouseTier >= 3 ? FORCED_SELL_TIER_3 : FORCED_SELL_TIER_1_2;
        const mockery = mockeryPool[Math.floor(Math.random() * mockeryPool.length)];
        const seriousNote = `\n\n[Your inventory capacity dropped from ${oldCap}kg to ${newCap}kg because you sold ${asset.name}. You were carrying ${usedAfter.toFixed(1)}kg of product. We've auto-sold excess at 30% of base value to bring you within the new limit. You received $${liquidationTotal.toLocaleString()} for the liquidated goods. Sold items: ${soldDesc.join('; ')}.]`;
        const evt: ChoiceEvent = {
          id: 'forced_sell_' + Date.now().toString(36),
          title: 'Inventory Overflow',
          context: mockery + seriousNote,
          choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
        };
        const finalPlayer = {
          ...playerAfterSell,
          inventory: updatedInv,
          cash: playerAfterSell.cash + liquidationTotal,
        };
        return {
          ...state,
          player: updatePeakNetWorth(finalPlayer, state.currentMarketPrices),
          pendingEvent: evt,
          lastEventMessage: '',
        };
      }
      return { ...state, player: updatePeakNetWorth(playerAfterSell, state.currentMarketPrices), lastEventMessage: `Sold ${asset.name} for $${assetPayout.toLocaleString()}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Sold ${asset.name} for $${assetPayout.toLocaleString()}.`] };
    }

    case 'SAVE': {
      try { localStorage.setItem('angelo_save', JSON.stringify(state)); return { ...state, lastEventMessage: 'Game saved successfully.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Game saved.`] }; }
      catch { return { ...state, lastEventMessage: 'Failed to save game.' }; }
    }

    case 'LOAD': {
      try {
        const saveData = localStorage.getItem('angelo_save');
        if (!saveData) return { ...state, lastEventMessage: 'No save data found.' };
        return { ...JSON.parse(saveData), lastEventMessage: 'Game loaded successfully.', gameLog: [...JSON.parse(saveData).gameLog, `[Turn $${JSON.parse(saveData).turn}] Game loaded.`] };
      } catch { return { ...state, lastEventMessage: 'Failed to load save. Corrupted data.' }; }
    }

    case 'CANCEL_AIRPORT': return { ...state, headingToAirport: false, lastEventMessage: 'Flight cancelled.' };

    case 'BANK_TUTORIAL_SHOWN': return { ...state, bankTutorialShown: true };

    case 'SAFEHOUSE_TIER_CHANGE': {
      const nw = state.player.bank + state.player.cash;
      const newTier = getSafehouseTier(nw, state.safehouseTier);
      if (newTier === state.safehouseTier) return state;
      const isPromotion = newTier > state.safehouseTier;
      const tier = isPromotion ? newTier : state.safehouseTier - 1;
      let seriousNote: string;
      if (isPromotion) {
        const newLevel = SAFEHOUSE_LEVELS[newTier - 1];
        seriousNote = `\n\n[Your liquid wealth (cash + bank = $${nw.toLocaleString()}) is now above the $${newLevel.advanceAt.toLocaleString()} threshold required for ${newLevel.name}. Your safehouse has been upgraded.]`;
      } else {
        const oldLevel = SAFEHOUSE_LEVELS[state.safehouseTier - 1];
        seriousNote = `\n\n[Your liquid wealth (cash + bank = $${nw.toLocaleString()}) dropped below the $${oldLevel.demoteAt.toLocaleString()} threshold required for ${oldLevel.name}. Your safehouse has been downgraded.]`;
      }
      const baseContext = isPromotion ? (SAFEHOUSE_ADVANCE_MSGS[tier] ?? '') : (SAFEHOUSE_DEMOTE_MSGS[tier] ?? '');
      const evt: ChoiceEvent = {
        id: (isPromotion ? 'safehouse_promote_' : 'safehouse_demote_') + Date.now().toString(36),
        title: isPromotion ? (SAFEHOUSE_ADVANCE_TITLES[tier] ?? 'New Safehouse') : (SAFEHOUSE_DEMOTE_TITLES[tier] ?? 'Downgraded'),
        context: baseContext + seriousNote,
        choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
      };
      return { ...state, pendingEvent: evt, lastEventMessage: '' };
    }
    default: return state;
  }
}

export function getStatusReport(state: GameState): string {
  const country = getCountry(state.player.currentCountryId)!;
  const heatLevel = getHeatLevel(state.player);
  const used = getUsedCapacity(state.player);
  const remaining = getRemainingCapacity(state.player);
  return [
    `=== ANGELO: THE CHRONICLES OF CRIME ===`,
    `Turn: ${state.turn}    Phase: ${state.gamePhase}`,
    `Location: ${country.name} (${country.region})`,
    `Bank: $${state.player.bank.toLocaleString()}`,
    `Cash: $${state.player.cash.toLocaleString()}`,
    `Heat: ${state.player.heat}/100 [${heatLevel.toUpperCase()}]`,
    `Credit: ${state.player.credit}    Credibility: ${state.player.credibility}/100`,
    `Reputation: ${state.player.reputation}/100`,
    `Inventory: ${used.toFixed(3)}/${state.player.inventoryCapacity}kg used, ${remaining.toFixed(3)}kg free`,
    `Stash: ${state.player.stash.reduce((s, i) => s + i.quantity, 0)} units / ${state.player.stashCapacity}kg`,
    `Trips: ${state.player.totalTrips}  Busts: ${state.player.totalBusts}`,
    `Director: Tension=${state.director.tension} Boredom=${state.director.boredom} Attn=${state.director.enforcementAttention}`,
    `Last event: ${state.lastEventMessage.substring(0, 80)}`,
    `========================`,
  ].join('\n');
}
