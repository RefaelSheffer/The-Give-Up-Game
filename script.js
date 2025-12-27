const CARDS = [
  "ילדים",
  "בית",
  "כלב",
  "חתולים",
  "ספורט",
  "זוגיות",
  "אוכל טעים",
  "קפה",
  "לצייר",
  "ליקוט פיטריות",
  "לראות טלוויזיה",
  "יד ימין",
  "אליס-מוריס",
  "חדשות",
  "כסף",
  "בית",
  "אוטו",
  "פיסול",
  "מעיין",
  "לבנות בתים",
  "שוקולד",
  "סוכריות",
];

const NUM_PLAYERS = 7;
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
