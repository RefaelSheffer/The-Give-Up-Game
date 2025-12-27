const CARDS_PER_PLAYER = 3;
const STORAGE_KEY = "give-up-game";
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

const SAMPLE_CARDS = [
  "מוותר על שוקולד",
  "מוותר על יד ימין",
  "מוותר על שיניים",
  "מוותר על קינוח שבועי",
  "מוותר על שעת שינה",
  "מוותר על קפה בבוקר",
  "מוותר על טלוויזיה לשבוע",
  "מוותר על אימון כושר",
  "מוותר על בילוי במסעדה",
  "מוותר על נסיעה ברכב",
];

const screens = {
  setup: document.getElementById("screen-setup"),
  players: document.getElementById("screen-players"),
  player: document.getElementById("screen-player"),
};

const sessionNameInput = document.getElementById("session-name");
const numPlayersSelect = document.getElementById("num-players");
const cardsInput = document.getElementById("cards-input");
const addSamplesButton = document.getElementById("add-samples");
const clearCardsButton = document.getElementById("clear-cards");
const saveDealButton = document.getElementById("save-deal");
const dealError = document.getElementById("deal-error");
const resetButtons = [
  document.getElementById("reset-button"),
  document.getElementById("reset-button-players"),
];
const playerButtonsContainer = document.getElementById("player-buttons");
const backToSetupButton = document.getElementById("back-to-setup");
const redealButton = document.getElementById("redeal-button");
const playerTitle = document.getElementById("player-title");
const cardsContainer = document.getElementById("cards");
const backButton = document.getElementById("back-button");

const defaultData = {
  gameConfig: null,
  gameState: {
    shuffledDeck: [],
    hands: [],
    dealtAt: null,
    isDealt: false,
  },
};

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...defaultData };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      gameConfig: parsed.gameConfig ?? defaultData.gameConfig,
      gameState: { ...defaultData.gameState, ...parsed.gameState },
    };
  } catch (error) {
    return { ...defaultData };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearStoredData() {
  localStorage.removeItem(STORAGE_KEY);
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

function dealCards(deck, numPlayers) {
  const hands = [];
  for (let i = 0; i < numPlayers; i += 1) {
    const start = i * CARDS_PER_PLAYER;
    const hand = deck.slice(start, start + CARDS_PER_PLAYER);
    hands.push(hand);
  }
  return hands;
}

function normalizeCards(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderPlayerButtons(numPlayers) {
  playerButtonsContainer.innerHTML = "";
  for (let i = 0; i < numPlayers; i += 1) {
    const button = document.createElement("button");
    button.className = "player-button";
    button.dataset.player = String(i);
    button.type = "button";
    button.textContent = `Player ${i + 1}`;
    button.addEventListener("click", () => handlePlayerSelection(i));
    playerButtonsContainer.appendChild(button);
  }
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

function updateForm(config) {
  sessionNameInput.value = config?.sessionName ?? "";
  numPlayersSelect.value = String(config?.numPlayers ?? 5);
  cardsInput.value = config?.cardsList?.join("\n") ?? "";
}

function validateCards(cardsList, numPlayers) {
  const minCards = numPlayers * CARDS_PER_PLAYER;
  if (cardsList.length < minCards) {
    return {
      ok: false,
      message: `יש ${cardsList.length} קלפים, צריך לפחות ${minCards} (${CARDS_PER_PLAYER} לכל שחקן).`,
    };
  }
  return { ok: true };
}

function buildGameConfig() {
  const numPlayers = Number(numPlayersSelect.value);
  const cardsList = normalizeCards(cardsInput.value);
  return {
    sessionName: sessionNameInput.value.trim(),
    numPlayers,
    cardsPerPlayer: CARDS_PER_PLAYER,
    cardsList,
  };
}

function dealFromConfig(config) {
  const shuffledDeck = shuffleDeck(config.cardsList);
  const hands = dealCards(shuffledDeck, config.numPlayers);
  return {
    shuffledDeck,
    hands,
    dealtAt: Date.now(),
    isDealt: true,
  };
}

function handleDeal() {
  dealError.textContent = "";
  const config = buildGameConfig();
  const validation = validateCards(config.cardsList, config.numPlayers);
  if (!validation.ok) {
    dealError.textContent = validation.message;
    return;
  }

  const gameState = dealFromConfig(config);
  saveData({ gameConfig: config, gameState });
  renderPlayerButtons(config.numPlayers);
  showScreen("players");
}

function handlePlayerSelection(playerIndex) {
  const { gameState, gameConfig } = loadData();
  if (!gameState.isDealt || !gameConfig) {
    showScreen("setup");
    return;
  }

  playerTitle.textContent = `Player ${playerIndex + 1}`;
  renderPlayerCards(playerIndex, gameState.hands);
  showScreen("player");
}

function handleRedeal() {
  dealError.textContent = "";
  const { gameConfig } = loadData();
  if (!gameConfig) {
    showScreen("setup");
    return;
  }

  const validation = validateCards(gameConfig.cardsList, gameConfig.numPlayers);
  if (!validation.ok) {
    dealError.textContent = validation.message;
    showScreen("setup");
    return;
  }

  const gameState = dealFromConfig(gameConfig);
  saveData({ gameConfig, gameState });
  renderPlayerButtons(gameConfig.numPlayers);
  showScreen("players");
}

function resetGame() {
  clearStoredData();
  dealError.textContent = "";
  updateForm(null);
  showScreen("setup");
}

function populatePlayersSelect() {
  for (let i = MIN_PLAYERS; i <= MAX_PLAYERS; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = String(i);
    if (i === 5) {
      option.selected = true;
    }
    numPlayersSelect.appendChild(option);
  }
}

function init() {
  populatePlayersSelect();
  const { gameConfig, gameState } = loadData();

  updateForm(gameConfig);

  if (gameState.isDealt && gameConfig) {
    renderPlayerButtons(gameConfig.numPlayers);
    showScreen("players");
  } else {
    showScreen("setup");
  }

  addSamplesButton.addEventListener("click", () => {
    cardsInput.value = SAMPLE_CARDS.join("\n");
  });

  clearCardsButton.addEventListener("click", () => {
    cardsInput.value = "";
  });

  saveDealButton.addEventListener("click", handleDeal);

  resetButtons.forEach((button) => {
    button.addEventListener("click", resetGame);
  });

  backToSetupButton.addEventListener("click", () => {
    const { gameConfig: currentConfig } = loadData();
    updateForm(currentConfig);
    showScreen("setup");
  });

  redealButton.addEventListener("click", handleRedeal);

  backButton.addEventListener("click", () => {
    const { gameState: freshState, gameConfig: freshConfig } = loadData();
    if (!freshState.isDealt || !freshConfig) {
      showScreen("setup");
      return;
    }
    showScreen("players");
  });
}

init();
