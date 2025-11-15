// Mock API functions for game backend with live API fallback

export interface GameStatus {
  health: number;
  happiness: number;
  money: number;
  energy: number;
  social: number;
  career: number;
}

export interface GameEvent {
  status: GameStatus;
  event_message: string;
  options: string[];
}

export interface GameState {
  game_id: string;
  day: number;
  status: GameStatus;
  currentEvent: GameEvent | null;
  time_allocation: number;
  max_time_allocation: number;
}

type SubmitChoiceResponse = {
  status: GameStatus;
  result_message: string;
};

type ApiSource = 'api' | 'mock';

let currentGame: GameState | null = null;
let lastResponseSource: ApiSource = 'api';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'https://sample.com';
const FORCE_MOCK_API = import.meta.env?.VITE_USE_MOCK_API === 'true';
const API_TIMEOUT = 3000;

export function getApiSource(): ApiSource {
  return lastResponseSource;
}

function setApiSource(source: ApiSource) {
  lastResponseSource = source;
}

interface StartGameResponse {
  game_id: string;
  day: number;
  status: GameStatus;
}

async function requestWithTimeout<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// POST /api/game/start - Start new game
export async function startNewGame(): Promise<GameState> {
  if (FORCE_MOCK_API) {
    return startNewGameMock();
  }

  try {
    const data = await requestWithTimeout<StartGameResponse>('/api/game/start', {
      method: 'POST',
    });

    const game: GameState = {
      game_id: data.game_id,
      day: data.day,
      status: data.status,
      currentEvent: null,
      time_allocation: 8,
      max_time_allocation: 8,
    };

    currentGame = game;
    setApiSource('api');
    return game;
  } catch (error) {
    console.warn('startNewGame failed, using mock data', error);
    return startNewGameMock();
  }
}

// GET /api/game/{game_id}/day/{day_number} - Get event for specified day
export async function getDayEvent(gameId: string, dayNumber: number): Promise<GameEvent> {
  if (FORCE_MOCK_API) {
    return getDayEventMock(gameId, dayNumber);
  }

  try {
    const event = await requestWithTimeout<GameEvent>(`/api/game/${gameId}/day/${dayNumber}`);

    if (!currentGame || currentGame.game_id !== gameId) {
      currentGame = {
        game_id: gameId,
        day: dayNumber,
        status: event.status,
        currentEvent: event,
        time_allocation: 8,
        max_time_allocation: 8,
      };
    } else {
      currentGame.currentEvent = event;
      currentGame.status = event.status;
    }

    setApiSource('api');
    return event;
  } catch (error) {
    console.warn('getDayEvent failed, using mock data', error);
    return getDayEventMock(gameId, dayNumber);
  }
}

// POST /api/game/{game_id}/choice - Select choice and update parameters
export async function submitChoice(
  gameId: string,
  choiceIndex: number
): Promise<SubmitChoiceResponse> {
  if (FORCE_MOCK_API) {
    return submitChoiceMock(gameId, choiceIndex);
  }

  try {
    const result = await requestWithTimeout<SubmitChoiceResponse>(`/api/game/${gameId}/choice`, {
      method: 'POST',
      body: JSON.stringify({ choice_index: choiceIndex }),
    });

    if (currentGame && currentGame.game_id === gameId) {
      currentGame.status = result.status;
      currentGame.day += 1;
    }

    setApiSource('api');
    return result;
  } catch (error) {
    console.warn('submitChoice failed, using mock data', error);
    return submitChoiceMock(gameId, choiceIndex);
  }
}

// GET /api/game/{game_id}/status - Get current status
export async function getGameStatus(gameId: string): Promise<GameStatus> {
  if (FORCE_MOCK_API) {
    return getGameStatusMock(gameId);
  }

  try {
    const status = await requestWithTimeout<GameStatus>(`/api/game/${gameId}/status`);

    if (currentGame && currentGame.game_id === gameId) {
      currentGame.status = status;
    }

    setApiSource('api');
    return status;
  } catch (error) {
    console.warn('getGameStatus failed, using mock data', error);
    return getGameStatusMock(gameId);
  }
}

// Mock implementations (fallback)
async function startNewGameMock(): Promise<GameState> {
  await simulateDelay();

  const game: GameState = {
    game_id: generateGameId(),
    day: 1,
    status: {
      health: 70,
      happiness: 70,
      money: 70,
      energy: 70,
      social: 70,
      career: 70,
    },
    currentEvent: null,
    time_allocation: 8,
    max_time_allocation: 8,
  };

  currentGame = game;
  setApiSource('mock');
  return game;
}

async function getDayEventMock(gameId: string, dayNumber: number): Promise<GameEvent> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId) {
    throw new Error('Game not found');
  }

  const event = generateEventForDay(dayNumber, currentGame.status);
  currentGame.currentEvent = event;
  setApiSource('mock');
  return event;
}

async function submitChoiceMock(
  gameId: string,
  choiceIndex: number
): Promise<SubmitChoiceResponse> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId || !currentGame.currentEvent) {
    throw new Error('Invalid game state');
  }

  const statusChanges = calculateStatusChanges(currentGame.day, choiceIndex);

  const newStatus = { ...currentGame.status };
  Object.keys(statusChanges).forEach(key => {
    const statKey = key as keyof GameStatus;
    newStatus[statKey] = Math.max(0, Math.min(100, newStatus[statKey] + statusChanges[statKey]));
  });

  currentGame.status = newStatus;
  currentGame.day += 1;

  const resultMessage = generateResultMessage(choiceIndex, statusChanges);
  setApiSource('mock');

  return {
    status: newStatus,
    result_message: resultMessage,
  };
}

async function getGameStatusMock(gameId: string): Promise<GameStatus> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId) {
    throw new Error('Game not found');
  }

  setApiSource('mock');
  return currentGame.status;
}

// Helper functions
function simulateDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 300));
}

function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function generateEventForDay(day: number, status: GameStatus): GameEvent {
  const events = getEventPool(day, status);
  const selectedEvent = events[Math.floor(Math.random() * events.length)];

  return {
    status: status,
    event_message: selectedEvent.message,
    options: selectedEvent.options,
  };
}

function calculateStatusChanges(day: number, choiceIndex: number): GameStatus {
  const eventType = (day % 5) + 1;

  const changes: GameStatus = {
    health: 0,
    happiness: 0,
    money: 0,
    energy: 0,
    social: 0,
    career: 0,
  };

  switch (eventType) {
    case 1: // Subscription event
      if (choiceIndex === 0) {
        changes.happiness = 8;
        changes.money = -10;
      } else if (choiceIndex === 1) {
        changes.happiness = 3;
        changes.money = 5;
      } else if (choiceIndex === 2) {
        changes.happiness = -2;
        changes.money = 10;
        changes.career = 3;
      } else {
        changes.money = 8;
        changes.energy = -3;
      }
      break;

    case 2: // Social pressure event
      if (choiceIndex === 0) {
        changes.social = 10;
        changes.happiness = 8;
        changes.money = -10;
      } else if (choiceIndex === 1) {
        changes.social = 5;
        changes.money = -3;
      } else if (choiceIndex === 2) {
        changes.social = -5;
        changes.money = 8;
        changes.health = 3;
      } else {
        changes.social = 3;
        changes.career = 5;
      }
      break;

    case 3: // Work-life balance event
      if (choiceIndex === 0) {
        changes.career = 10;
        changes.money = 8;
        changes.health = -8;
        changes.energy = -10;
      } else if (choiceIndex === 1) {
        changes.career = 5;
        changes.health = 5;
        changes.energy = 3;
      } else if (choiceIndex === 2) {
        changes.health = 10;
        changes.happiness = 8;
        changes.career = -5;
      } else {
        changes.energy = 8;
        changes.health = 5;
      }
      break;

    case 4: // Health/Wellness event
      if (choiceIndex === 0) {
        changes.health = 10;
        changes.energy = 8;
        changes.money = -8;
      } else if (choiceIndex === 1) {
        changes.health = 8;
        changes.happiness = 5;
      } else if (choiceIndex === 2) {
        changes.money = 5;
        changes.health = -5;
      } else {
        changes.energy = -3;
        changes.career = 5;
      }
      break;

    case 5: // Financial decision event
      if (choiceIndex === 0) {
        changes.money = -10;
        changes.happiness = 10;
        changes.social = 5;
      } else if (choiceIndex === 1) {
        changes.money = 5;
        changes.happiness = 3;
      } else if (choiceIndex === 2) {
        changes.money = 10;
        changes.happiness = -3;
      } else {
        changes.money = 8;
        changes.career = 3;
      }
      break;
  }

  return changes;
}

function generateResultMessage(choiceIndex: number, changes: GameStatus): string {
  const messages = [
    "You chose immediate satisfaction. The happiness boost feels great, but consider the long-term impact.",
    "A balanced approach! You're finding ways to enjoy life while protecting your resources.",
    "You prioritized long-term benefits. It's tough now, but future you will thank you.",
    "Strategic thinking! You're investing in areas that compound over time.",
  ];

  return messages[choiceIndex] || messages[1];
}

function getEventPool(day: number, status: GameStatus): Array<{ message: string; options: string[] }> {
  const eventPool = [
    {
      message: "A premium streaming service launches with exclusive content everyone's talking about. The subscription is $15/month with a 30-day free trial.",
      options: [
        "Subscribe immediately - I can't miss out on this content!",
        "Start free trial with a calendar reminder to cancel",
        "Wait and see reviews before committing",
        "Research free alternatives instead"
      ]
    },
    {
      message: "Your friends are planning an expensive weekend trip. Everyone's going, but it will cost $300 and you have bills due soon.",
      options: [
        "Go on the trip - experiences with friends are priceless",
        "Suggest a cheaper alternative activity instead",
        "Skip this one and save for the next gathering",
        "Go but set strict spending limits for yourself"
      ]
    },
    {
      message: "Your boss offers you overtime work this weekend that pays well but you're already exhausted and had plans with family.",
      options: [
        "Accept the overtime - the extra money is too good to pass up",
        "Negotiate to work only one day instead of both",
        "Decline politely and keep your plans",
        "Accept but promise yourself a rest day next week"
      ]
    },
    {
      message: "A fitness app wants $12/month for premium features. You've been meaning to work out more, but you could also exercise for free.",
      options: [
        "Subscribe - investing in health is always worth it",
        "Try the free version first for a month",
        "Skip it and use free workout videos",
        "Focus on diet changes instead, no app needed"
      ]
    },
    {
      message: "Your favorite online store has a flash sale - 60% off! You don't need anything urgently, but the deals are incredible.",
      options: [
        "Buy everything in your cart - these deals are rare!",
        "Only buy one item you've wanted for a while",
        "Save the money - sales happen all the time",
        "Set a strict budget limit before shopping"
      ]
    },
    {
      message: "A friend invites you to an expensive networking dinner with potential career contacts. It's $80 per person but could lead to opportunities.",
      options: [
        "Go and spare no expense - networking is investing in your future",
        "Attend but order modestly to save money",
        "Ask the friend to introduce you another way",
        "Skip it and focus on online networking instead"
      ]
    },
    {
      message: "You feel burned out from work. A spa day costs $150, therapy is $100 per session, or you could take a free mental health day at home.",
      options: [
        "Book the spa day - I deserve this relaxation",
        "Try one therapy session to talk things through",
        "Take a free day off to rest at home",
        "Push through - I'll rest when things calm down"
      ]
    },
    {
      message: "An online course promises to boost your career skills for $299. Reviews are mixed, but some say it helped them get promotions.",
      options: [
        "Invest in the course - education pays off long-term",
        "Look for free courses covering the same topics",
        "Ask your company if they'll pay for it",
        "Learn from free online resources like YouTube"
      ]
    },
    {
      message: "Your phone is getting slow. A new model costs $1000, repair costs $200, or you could keep using it as is.",
      options: [
        "Buy the new phone - I need it for work and life",
        "Get it repaired and extend its life",
        "Keep using it until it completely breaks",
        "Look for a cheaper refurbished model"
      ]
    },
    {
      message: "It's Sunday evening and you're too tired to cook. Meal delivery is $25, frozen pizza is $8, or you could force yourself to cook what's in the fridge.",
      options: [
        "Order delivery - my time and energy are valuable",
        "Quick frozen pizza - a compromise",
        "Cook something simple from the fridge",
        "Meal prep for the week to avoid this situation"
      ]
    },
    {
      message: "A gaming console you've wanted goes on sale. It's $400 now instead of $500. You'd use it for entertainment and stress relief.",
      options: [
        "Buy it now - $100 savings is significant",
        "Wait for an even better deal during holidays",
        "Put the money toward savings instead",
        "Buy it but sell old electronics to offset cost"
      ]
    },
    {
      message: "Your car needs maintenance: $500 now for prevention, or wait and risk a $2000 repair later. You're low on funds this month.",
      options: [
        "Do the maintenance now - prevention saves money",
        "Do only the most critical maintenance for $250",
        "Wait until next month when you have more money",
        "Get a second opinion to confirm what's needed"
      ]
    },
    {
      message: "A family member asks to borrow $200. They've borrowed before and always pay back, but it's slow. You were saving that money.",
      options: [
        "Lend it - family comes first always",
        "Lend half and explain your own budget constraints",
        "Decline politely and suggest other resources",
        "Give it as a gift with no expectation of return"
      ]
    },
    {
      message: "Your company offers a 401k match but you'd have to reduce your take-home pay by $100/month. You're already feeling financially tight.",
      options: [
        "Enroll - free money from employer is too good to miss",
        "Start with minimum contribution to get some match",
        "Wait until you have more financial breathing room",
        "Enroll and cut other expenses to make up difference"
      ]
    },
    {
      message: "You're invited to a conference in your field. Registration is $300, travel $400. It could boost your career but it's expensive.",
      options: [
        "Go - career advancement is worth the investment",
        "Go but look for ways to minimize travel costs",
        "Skip it and watch if they post sessions online",
        "Ask your employer if they'll cover any costs"
      ]
    },
    {
      message: "A limited edition collectible you love is available for $200. It will likely increase in value, but you don't need it.",
      options: [
        "Buy it - it's an investment that will appreciate",
        "Buy it only if you truly love it, not for profit",
        "Skip it - collectibles are unpredictable investments",
        "Set a price alert and revisit in a month"
      ]
    },
    {
      message: "You've been eating out for lunch daily ($12/day). Making lunch at home saves money but takes morning time you don't have.",
      options: [
        "Keep eating out - my time is more valuable",
        "Meal prep on Sundays to have quick lunches",
        "Pack simple lunches like sandwiches",
        "Alternate - eat out 2-3 times, pack the rest"
      ]
    },
    {
      message: "Your lease is ending. A nicer apartment costs $200 more/month but is closer to work, saving 1 hour of commute daily.",
      options: [
        "Take the nicer place - time saved is worth money",
        "Calculate exact cost of time vs money before deciding",
        "Stay in current place and invest the $200/month",
        "Negotiate with current landlord for better terms"
      ]
    },
    {
      message: "A charity you care about asks for donations. You want to help but you're working on building your emergency fund.",
      options: [
        "Donate $50 - giving back is important regardless",
        "Donate $20 - something is better than nothing",
        "Skip for now - secure yourself first before helping others",
        "Volunteer time instead of money"
      ]
    },
    {
      message: "You're exhausted and considering hiring a cleaning service for $100/month. It would free up 4 hours but feels indulgent.",
      options: [
        "Hire the service - buying back time is valuable",
        "Try it for 2 months to evaluate the value",
        "Clean less frequently instead of hiring help",
        "Keep doing it yourself - it's exercise anyway"
      ]
    },
  ];
  
  // Return events based on day progression
  return eventPool;
}
