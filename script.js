const CARDS = [
  "לוותר על שוקולד לשבוע",
  "לוותר על קפה הפוך בבוקר",
  "לוותר על גלילת אינסטגרם",
  "לוותר על טיול לשופינג",
  "לוותר על פרק אחרון בסדרה",
  "לוותר על משלוח פיצה",
  "לוותר על התראה מיותרת בטלפון",
  "לוותר על נהיגה במקום ללכת ברגל",
  "לוותר על מוזיקה בזמן עבודה",
  "לוותר על משחק מחשב בערב",
  "לוותר על נשנוש לילי",
  "לוותר על שתייה מתוקה",
  "לוותר על קולה קרה",
  "לוותר על טלוויזיה לשבוע",
  "לוותר על קינוח במסעדה",
  "לוותר על פרסומת ולנצל את הזמן",
  "לוותר על לישון על הספה",
  "לוותר על בדיקת חדשות בבוקר",
  "לוותר על קניות אונליין",
  "לוותר על אפליקציה חדשה",
  "לוותר על טוסט בלילה",
  "לוותר על דחיית משימות",
  "לוותר על סנוז בבוקר",
  "לוותר על נס קפה אחר הצהריים",
  "לוותר על שיחת טלפון מיותרת",
  "לוותר על להישאר ער עד מאוחר",
  "לוותר על חטיף בדרכים",
  "לוותר על מוזיקה באוזניות",
  "לוותר על עוד פרק נטפליקס",
  "לוותר על משלוח מוולט",
  "לוותר על גלידה באמצע היום",
  "לוותר על קניות לא מתוכננות",
  "לוותר על קופון שלא צריך",
  "לוותר על ללחוץ סתם על התראות",
  "לוותר על ישיבה ארוכה בלי לזוז",
  "לוותר על לעדכן סטטוס בוואטסאפ",
  "לוותר על לפתח שיחה בקבוצת משפחה",
  "לוותר על לראות חתולים ביוטיוב",
  "לוותר על תזכורת דחופה שלא קיימת",
  "לוותר על להתווכח על מזג האוויר",
  "לוותר על לשתות מים בטעם",
  "לוותר על לשמור 400 טאבים פתוחים",
  "לוותר על משחק מילים גרוע",
  "לוותר על לפקוח עין על המבצע הבא",
  "לוותר על לסדר שוב את השולחן",
  "לוותר על לקום לשאול מי שם מוזיקה",
  "לוותר על להתלונן על פקקים",
  "לוותר על עוד סיבוב בסופר",
  "לוותר על לחפש מטען במקום לטעון מראש",
  "לוותר על לקרוא תגובות ברשת",
  "לוותר על לשים תזכורת על תזכורת",
  "לוותר על לפתוח את המקרר בלי רעב",
  "לוותר על לספר בדיחה של אבא",
  "לוותר על לחפש את השלט 20 דקות",
  "לוותר על לקנות עטים שלא עובדים",
  "לוותר על לשים עוד פילטר",
  "לוותר על לחפש חניה קרובה מדי",
  "לוותר על לזפזפ לפני השינה",
  "לוותר על לבדוק מזג אוויר כשכבר בחוץ",
  "לוותר על להתעצבן על טעינה איטית",
];

const NUM_PLAYERS = 10;
const CARDS_PER_PLAYER = 3;
const STORAGE_KEY = "give-up-game";

const screens = {
  setup: document.getElementById("screen-setup"),
  players: document.getElementById("screen-players"),
  player: document.getElementById("screen-player"),
};

const dealButton = document.getElementById("deal-button");
const dealError = document.getElementById("deal-error");
const resetButtons = [
  document.getElementById("reset-button"),
  document.getElementById("reset-button-players"),
];
const playerButtons = document.querySelectorAll(".player-button");
const playerTitle = document.getElementById("player-title");
const cardsContainer = document.getElementById("cards");
const backButton = document.getElementById("back-button");

const requiredCards = NUM_PLAYERS * CARDS_PER_PLAYER;

const defaultState = {
  shuffledDeck: [],
  hands: [],
  isDealt: false,
};

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...defaultState };
  }

  try {
    return { ...defaultState, ...JSON.parse(stored) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showScreen(screenKey) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenKey].classList.add("active");
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck) {
  const hands = [];
  for (let i = 0; i < NUM_PLAYERS; i += 1) {
    const start = i * CARDS_PER_PLAYER;
    const hand = deck.slice(start, start + CARDS_PER_PLAYER);
    hands.push(hand);
  }
  return hands;
}

function renderPlayerCards(playerIndex, hands) {
  const hand = hands[playerIndex] || [];
  cardsContainer.innerHTML = "";

  hand.forEach((cardText) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = cardText;
    cardsContainer.appendChild(card);
  });
}

function handleDeal(state) {
  dealError.textContent = "";

  if (CARDS.length < requiredCards) {
    dealError.textContent = "צריך לפחות 30 קלפים";
    return;
  }

  const shuffledDeck = shuffleDeck(CARDS);
  const hands = dealCards(shuffledDeck);
  const nextState = {
    shuffledDeck,
    hands,
    isDealt: true,
  };

  saveState(nextState);
  showScreen("players");
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  dealError.textContent = "";
  showScreen("setup");
}

function init() {
  const state = loadState();

  if (state.isDealt) {
    showScreen("players");
  } else {
    showScreen("setup");
  }

  dealButton.addEventListener("click", () => {
    handleDeal(state);
  });

  resetButtons.forEach((button) => {
    button.addEventListener("click", resetGame);
  });

  playerButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const playerIndex = Number(event.currentTarget.dataset.player);
      const freshState = loadState();
      if (!freshState.isDealt) {
        showScreen("setup");
        return;
      }

      playerTitle.textContent = `Player ${playerIndex + 1}`;
      renderPlayerCards(playerIndex, freshState.hands);
      showScreen("player");
    });
  });

  backButton.addEventListener("click", () => {
    const freshState = loadState();
    if (!freshState.isDealt) {
      showScreen("setup");
      return;
    }
    showScreen("players");
  });
}

init();
