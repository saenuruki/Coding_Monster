// Mock API functions for game backend with live API fallback

// Backend-compatible interfaces
export interface Choice {
  id: number;
  text: string;
  health_delta?: number;
  money_delta?: number;
  mood_delta?: number;
  impact?: number;
}

export interface GameStatus {
  game_id: string;
  day: number;
  health: number;
  money: number;
  mood: number;
  is_over: boolean;
}

export interface GameEvent {
  event_message: string;
  choices: Choice[];
}

export interface DayEvent {
  day: number;
  description: string;
  choices: Choice[];
}

export interface GameState {
  game_id: string;
  day: number;
  status: GameStatus;
  currentEvent: GameEvent | null;
  time_allocation: number;
  max_time_allocation: number;
}

export interface StartGameRequest {
  age: number;
  gender: string;
  character_name: string;
  work: boolean;
}

interface StartGameResponse {
  game_id: string;
  event: GameEvent;
}

interface ChoiceRequest {
  day: number;
  choice_id: number;
}

interface AppliedChoice extends Choice {
  // Backend's applied_choice structure
}

interface ChoiceResponse {
  status: GameStatus;
  applied_choice: AppliedChoice;
}

type SubmitChoiceResponse = {
  status: GameStatus;
  result_message: string;
};

type ApiSource = 'api' | 'mock';

let currentGame: GameState | null = null;
let lastResponseSource: ApiSource = 'api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000';
const FORCE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';
const API_TIMEOUT = 5000;

export function getApiSource(): ApiSource {
  return lastResponseSource;
}

function setApiSource(source: ApiSource) {
  lastResponseSource = source;
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
export async function startNewGame(params?: StartGameRequest): Promise<GameState> {
  const defaultParams: StartGameRequest = {
    age: 25,
    gender: 'male',
    character_name: 'Player',
    work: true,
  };

  const requestParams = params || defaultParams;

  if (FORCE_MOCK_API) {
    return startNewGameMock(requestParams);
  }

  try {
    const data = await requestWithTimeout<StartGameResponse>('/api/game/start', {
      method: 'POST',
      body: JSON.stringify(requestParams),
    });

    const game: GameState = {
      game_id: data.game_id,
      day: 1,
      status: {
        game_id: data.game_id,
        day: 1,
        health: 70,
        money: 400,
        mood: 70,
        is_over: false,
      },
      currentEvent: data.event,
      time_allocation: 8,
      max_time_allocation: 8,
    };

    currentGame = game;
    setApiSource('api');
    return game;
  } catch (error) {
    console.warn('startNewGame failed, using mock data', error);
    return startNewGameMock(requestParams);
  }
}

// GET /api/game/{game_id}/day/{day_number} - Get event for specified day
export async function getDayEvent(gameId: string, dayNumber: number): Promise<GameEvent> {
  if (FORCE_MOCK_API) {
    return getDayEventMock(gameId, dayNumber);
  }

  try {
    const dayEvent = await requestWithTimeout<DayEvent>(`/api/game/${gameId}/day/${dayNumber}`);

    const event: GameEvent = {
      event_message: dayEvent.description,
      choices: dayEvent.choices,
    };

    if (currentGame && currentGame.game_id === gameId) {
      currentGame.currentEvent = event;
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
  choiceId: number,
  currentDay?: number
): Promise<SubmitChoiceResponse> {
  const day = currentDay || currentGame?.day || 1;

  if (FORCE_MOCK_API) {
    return submitChoiceMock(gameId, choiceId);
  }

  try {
    const requestBody: ChoiceRequest = {
      day: day,
      choice_id: choiceId,
    };

    const result = await requestWithTimeout<ChoiceResponse>(`/api/game/${gameId}/choice`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (currentGame && currentGame.game_id === gameId) {
      currentGame.status = result.status;
      currentGame.day = result.status.day;
    }

    setApiSource('api');
    
    // Generate a result message based on the applied choice
    const resultMessage = generateResultMessageFromChoice(result.applied_choice);
    
    return {
      status: result.status,
      result_message: resultMessage,
    };
  } catch (error) {
    console.warn('submitChoice failed, using mock data', error);
    return submitChoiceMock(gameId, choiceId);
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

// Helper function to generate result message from choice
function generateResultMessageFromChoice(choice: AppliedChoice): string {
  const messages = [
    "Your choice has been applied. Let's see how it affects your life.",
    "You made a decision. Every choice shapes your journey.",
    "Your choice is recorded. Keep going!",
    "That's an interesting choice. Let's continue.",
  ];
  return choice.text || messages[Math.floor(Math.random() * messages.length)];
}

// Mock implementations (fallback)
async function startNewGameMock(params: StartGameRequest): Promise<GameState> {
  await simulateDelay();

  const gameId = generateGameId();
  const event: GameEvent = {
    event_message: `You are ${params.age} years old, named ${params.character_name}. ${params.work ? 'You have a job.' : 'You are currently unemployed.'} What will you do today?`,
    choices: [
      { id: 1, text: "Go to work early and prepare", impact: 10 },
      { id: 2, text: "Wake up and arrive on time", impact: 0 },
      { id: 3, text: "Arrive late quietly", impact: -5 },
      { id: 4, text: "Pretend to be sick and stay home", impact: -10 },
    ],
  };

  const game: GameState = {
    game_id: gameId,
    day: 1,
    status: {
      game_id: gameId,
      day: 1,
      health: 70,
      money: 400,
      mood: 70,
      is_over: false,
    },
    currentEvent: event,
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

  const event = generateEventForDay(dayNumber);
  currentGame.currentEvent = event;
  setApiSource('mock');
  return event;
}

async function submitChoiceMock(
  gameId: string,
  choiceId: number
): Promise<SubmitChoiceResponse> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId || !currentGame.currentEvent) {
    throw new Error('Invalid game state');
  }

  const statusChanges = calculateStatusChanges(currentGame.day, choiceId);

  const newStatus = { ...currentGame.status };
  newStatus.health = Math.max(0, Math.min(100, newStatus.health + statusChanges.health));
  newStatus.money = Math.max(0, Math.min(1000, newStatus.money + statusChanges.money));
  newStatus.mood = Math.max(0, Math.min(100, newStatus.mood + statusChanges.mood));
  newStatus.day += 1;

  // Check game over conditions
  if (newStatus.health <= 0 || newStatus.money < 0 || newStatus.mood <= 0) {
    newStatus.is_over = true;
  }

  currentGame.status = newStatus;
  currentGame.day = newStatus.day;

  const resultMessage = generateResultMessage(choiceId);
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

function generateEventForDay(day: number): GameEvent {
  const events = getEventPool();
  const selectedEvent = events[day % events.length];

  return {
    event_message: selectedEvent.message,
    choices: selectedEvent.choices,
  };
}

interface StatusChanges {
  health: number;
  money: number;
  mood: number;
}

function calculateStatusChanges(day: number, choiceId: number): StatusChanges {
  const eventType = (day % 5) + 1;

  const changes: StatusChanges = {
    health: 0,
    money: 0,
    mood: 0,
  };

  // Map choice ID (1-4) to index (0-3)
  const choiceIndex = choiceId - 1;

  switch (eventType) {
    case 1: // Work decision
      if (choiceIndex === 0) {
        changes.money = 20;
        changes.mood = -10;
      } else if (choiceIndex === 1) {
        changes.money = -10;
        changes.mood = 15;
      } else if (choiceIndex === 2) {
        changes.health = 10;
        changes.mood = 5;
      } else {
        changes.money = 10;
        changes.health = -5;
      }
      break;

    case 2: // Social event
      if (choiceIndex === 0) {
        changes.mood = 10;
        changes.money = -15;
      } else if (choiceIndex === 1) {
        changes.mood = 5;
        changes.money = -5;
      } else if (choiceIndex === 2) {
        changes.money = 10;
        changes.mood = -5;
      } else {
        changes.mood = 3;
        changes.health = 3;
      }
      break;

    case 3: // Work-life balance
      if (choiceIndex === 0) {
        changes.money = 30;
        changes.health = -10;
        changes.mood = -8;
      } else if (choiceIndex === 1) {
        changes.money = 15;
        changes.health = 5;
      } else if (choiceIndex === 2) {
        changes.health = 10;
        changes.mood = 8;
      } else {
        changes.health = 8;
        changes.money = 5;
      }
      break;

    case 4: // Health/Wellness
      if (choiceIndex === 0) {
        changes.health = 15;
        changes.money = -12;
      } else if (choiceIndex === 1) {
        changes.health = 10;
        changes.mood = 5;
      } else if (choiceIndex === 2) {
        changes.money = 8;
        changes.health = -3;
      } else {
        changes.mood = -5;
        changes.money = 10;
      }
      break;

    case 5: // Financial decision
      if (choiceIndex === 0) {
        changes.money = -15;
        changes.mood = 12;
      } else if (choiceIndex === 1) {
        changes.money = 8;
        changes.mood = 3;
      } else if (choiceIndex === 2) {
        changes.money = 15;
        changes.mood = -5;
      } else {
        changes.money = 12;
        changes.health = 3;
      }
      break;
  }

  return changes;
}

function generateResultMessage(choiceId: number): string {
  const messages = [
    "You chose to work hard. Money increased but you're feeling tired.",
    "You chose to rest. You feel better but spent some money.",
    "You chose to exercise. Your health improved!",
    "A balanced choice. Let's see how it affects you.",
  ];

  const index = (choiceId - 1) % messages.length;
  return messages[index];
}

function getEventPool(): Array<{ message: string; choices: Choice[] }> {
  const eventPool = [
    {
      message: "Day 1: You wake up and decide what to do today.",
      choices: [
        { id: 1, text: "Go to work (money ↑, mood ↓)", money_delta: 20, mood_delta: -10 },
        { id: 2, text: "Rest at home (mood ↑, money ↓)", money_delta: -10, mood_delta: 15 },
        { id: 3, text: "Exercise (health ↑, mood ↑)", health_delta: 10, mood_delta: 5 },
        { id: 4, text: "Take on a side project (money ↑, health ↓)", money_delta: 10, health_delta: -5 },
      ]
    },
    {
      message: "Your friends are planning an expensive weekend trip. Everyone's going, but it will cost $300.",
      choices: [
        { id: 1, text: "Go on the trip - experiences are priceless", money_delta: -300, mood_delta: 10 },
        { id: 2, text: "Suggest a cheaper alternative", money_delta: -50, mood_delta: 5 },
        { id: 3, text: "Skip this one and save money", money_delta: 10, mood_delta: -5 },
        { id: 4, text: "Go but set strict spending limits", money_delta: -150, mood_delta: 3 },
      ]
    },
    {
      message: "Your boss offers overtime work this weekend. It pays well but you're exhausted.",
      choices: [
        { id: 1, text: "Accept overtime - extra money!", money_delta: 30, health_delta: -10, mood_delta: -8 },
        { id: 2, text: "Work only one day instead", money_delta: 15, health_delta: 5 },
        { id: 3, text: "Decline and keep your plans", health_delta: 10, mood_delta: 8 },
        { id: 4, text: "Accept but rest next week", money_delta: 25, health_delta: 8 },
      ]
    },
    {
      message: "A fitness app wants $12/month. You've been meaning to work out more.",
      choices: [
        { id: 1, text: "Subscribe - investing in health", money_delta: -12, health_delta: 15 },
        { id: 2, text: "Try the free version first", health_delta: 10, mood_delta: 5 },
        { id: 3, text: "Skip it and use free videos", money_delta: 8, health_delta: -3 },
        { id: 4, text: "Focus on diet changes instead", health_delta: 5, mood_delta: -5 },
      ]
    },
    {
      message: "Your favorite online store has a flash sale - 60% off!",
      choices: [
        { id: 1, text: "Buy everything - deals are rare!", money_delta: -150, mood_delta: 12 },
        { id: 2, text: "Only buy one item", money_delta: -30, mood_delta: 3 },
        { id: 3, text: "Save the money - sales happen often", money_delta: 15, mood_delta: -5 },
        { id: 4, text: "Set a strict budget before shopping", money_delta: -50, mood_delta: 5 },
      ]
    },
    {
      message: "You feel burned out from work. What will you do?",
      choices: [
        { id: 1, text: "Book a spa day ($150)", money_delta: -150, health_delta: 15, mood_delta: 12 },
        { id: 2, text: "Try therapy ($100)", money_delta: -100, health_delta: 10, mood_delta: 8 },
        { id: 3, text: "Take a free mental health day", health_delta: 8, mood_delta: 5 },
        { id: 4, text: "Push through - rest later", money_delta: 20, health_delta: -10, mood_delta: -8 },
      ]
    },
    {
      message: "An online course promises to boost your career skills for $299.",
      choices: [
        { id: 1, text: "Invest in the course", money_delta: -299, mood_delta: 8 },
        { id: 2, text: "Look for free courses", mood_delta: 3 },
        { id: 3, text: "Ask company to pay for it", money_delta: 50, mood_delta: 5 },
        { id: 4, text: "Learn from YouTube", money_delta: 10, mood_delta: 2 },
      ]
    },
    {
      message: "Your phone is getting slow. A new model costs $1000, repair costs $200.",
      choices: [
        { id: 1, text: "Buy the new phone", money_delta: -1000, mood_delta: 15 },
        { id: 2, text: "Get it repaired", money_delta: -200, mood_delta: 3 },
        { id: 3, text: "Keep using it as is", money_delta: 20, mood_delta: -5 },
        { id: 4, text: "Look for refurbished model", money_delta: -400, mood_delta: 8 },
      ]
    },
    {
      message: "Sunday evening and you're too tired to cook.",
      choices: [
        { id: 1, text: "Order delivery ($25)", money_delta: -25, mood_delta: 8 },
        { id: 2, text: "Quick frozen pizza ($8)", money_delta: -8, mood_delta: 3 },
        { id: 3, text: "Cook from the fridge", money_delta: 5, health_delta: 5 },
        { id: 4, text: "Meal prep for the week", money_delta: -20, health_delta: 10, mood_delta: -3 },
      ]
    },
    {
      message: "A gaming console you've wanted goes on sale. $400 instead of $500.",
      choices: [
        { id: 1, text: "Buy it now - $100 savings!", money_delta: -400, mood_delta: 15 },
        { id: 2, text: "Wait for better deals", money_delta: 10, mood_delta: -3 },
        { id: 3, text: "Save the money instead", money_delta: 50, mood_delta: -8 },
        { id: 4, text: "Buy and sell old electronics", money_delta: -250, mood_delta: 10 },
      ]
    },
    {
      message: "Your car needs maintenance: $500 now or risk $2000 repair later.",
      choices: [
        { id: 1, text: "Do maintenance now", money_delta: -500, health_delta: 5, mood_delta: 3 },
        { id: 2, text: "Do critical maintenance ($250)", money_delta: -250, mood_delta: -3 },
        { id: 3, text: "Wait until next month", money_delta: 50, mood_delta: -8 },
        { id: 4, text: "Get a second opinion", money_delta: -300, mood_delta: 5 },
      ]
    },
  ];
  
  return eventPool;
}
