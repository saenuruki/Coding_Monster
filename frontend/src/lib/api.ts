// Mock API functions for game backend with live API fallback

// Backend API Models (based on backend/app/models.py)
export interface Impact {
  health: number;
  happiness: number;
  stress: number;
  reputation: number;
  education: number;
  money: number;
  weekly_income: number;
  weekly_expense: number;
  free_time: number;
}

export interface EventOption {
  description: string;
  impact: Impact;
}

export interface Event {
  event_id: number;
  description: string;
  options: EventOption[];
}

export interface StaticProperties {
  character_name: string;
  gender: string;
  age: number;
  work: boolean;
  character_avatar: string | null;
}

export interface Stats {
  health: number;
  happiness: number;
  stress: number;
  reputation: number;
  education: number;
  money: number;
  weekly_income: number;
  weekly_expense: number;
  free_time: number;
}

export interface Income {
  source: string;
  amount: number;
}

export interface Expense {
  category: string;
  amount: number;
}

export interface SavingsAccount {
  balance: number;
  interest_rate: number;
}

export interface Finances {
  incomes: Income[];
  expenses: Expense[];
  savings_account: SavingsAccount | null;
}

export interface Game {
  user_id: number;
  game_id: string;
  day: number;
  static_properties: StaticProperties;
  stats: Stats;
  finances: Finances;
}

export interface StartGameRequest {
  age: number;
  gender: string;
  character_name: string;
  work: boolean;
}

export interface StartGameResponse {
  game_state: Game;
  event: Event;
}

export interface ChoiceRequest {
  impact: Impact;
}

export interface ChoiceResponse {
  game_state: Game;
}

// Legacy interfaces for compatibility
export interface GameStatus {
  game_id: string;
  day: number;
  health: number;
  money: number;
  mood: number;
  is_over: boolean;
}

export interface Choice {
  id: number;
  text: string;
  impact?: Impact;
  health_delta?: number;
  money_delta?: number;
  mood_delta?: number;
}

export interface GameEvent {
  event_message: string;
  choices: Choice[];
}

export interface GameState {
  game_id: string;
  day: number;
  status: GameStatus;
  currentEvent: GameEvent | null;
  params: StartGameRequest;
  time_allocation: number;
  max_time_allocation: number;
  // New fields from backend API
  game?: Game;
  currentBackendEvent?: Event;
}

export interface DayEvent {
  day: number;
  description: string;
  choices: Choice[];
}

type SubmitChoiceResponse = {
  status: GameStatus;
  applied_choice: Choice;
};

type ApiSource = 'api' | 'mock';

let currentGame: GameState | null = null;
let lastResponseSource: ApiSource = 'api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000';
const FORCE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';
const API_TIMEOUT = 3000;

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

// POST /game - Start new game
export async function startNewGame(params: StartGameRequest): Promise<GameState> {
  if (FORCE_MOCK_API) {
    return startNewGameMock(params);
  }

  try {
    const data = await requestWithTimeout<StartGameResponse>('/game', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    // Convert backend Event to frontend GameEvent format
    const currentEvent: GameEvent = {
      event_message: data.event.description,
      choices: data.event.options.map((option, index) => ({
        id: index + 1,
        text: option.description,
        impact: option.impact,
      })),
    };

    const game: GameState = {
      game_id: data.game_state.game_id,
      day: data.game_state.day,
      status: {
        game_id: data.game_state.game_id,
        day: data.game_state.day,
        health: data.game_state.stats.health,
        money: data.game_state.stats.money,
        mood: data.game_state.stats.happiness,
        is_over: false,
      },
      currentEvent: currentEvent,
      params: params,
      time_allocation: data.game_state.stats.free_time,
      max_time_allocation: data.game_state.stats.free_time,
      game: data.game_state,
      currentBackendEvent: data.event,
    };

    currentGame = game;
    setApiSource('api');
    return game;
  } catch (error) {
    console.warn('startNewGame failed, using mock data', error);
    return startNewGameMock(params);
  }
}

// NOTE: This endpoint does not exist in the actual backend API
// Events are returned together with game state after each choice
// This function is kept for legacy/mock support only
export async function getDayEvent(gameId: string, dayNumber: number): Promise<DayEvent> {
  // Always use mock for this since it doesn't exist in real API
  return getDayEventMock(gameId, dayNumber);
}

// POST /game/{game_id}/choice - Select choice and update parameters
export async function submitChoice(
  gameId: string,
  impact: Impact
): Promise<SubmitChoiceResponse> {
  if (FORCE_MOCK_API) {
    // For mock, we need to find the choice by impact - just pass the first choice for now
    return submitChoiceMock(gameId, 1, currentGame?.day || 1);
  }

  try {
    const data = await requestWithTimeout<ChoiceResponse>(`/game/${gameId}/choice`, {
      method: 'POST',
      body: JSON.stringify({ impact }),
    });

    // Update current game state
    if (currentGame && currentGame.game_id === gameId) {
      currentGame.game = data.game_state;
      currentGame.day = data.game_state.day;
      currentGame.status = {
        game_id: data.game_state.game_id,
        day: data.game_state.day,
        health: data.game_state.stats.health,
        money: data.game_state.stats.money,
        mood: data.game_state.stats.happiness,
        is_over: false, // TODO: Determine game over conditions
      };
    }

    // Convert to legacy response format
    const result: SubmitChoiceResponse = {
      status: {
        game_id: data.game_state.game_id,
        day: data.game_state.day,
        health: data.game_state.stats.health,
        money: data.game_state.stats.money,
        mood: data.game_state.stats.happiness,
        is_over: false,
      },
      applied_choice: {
        id: 0,
        text: "Selected choice",
        impact: impact,
      },
    };

    setApiSource('api');
    return result;
  } catch (error) {
    console.warn('submitChoice failed, using mock data', error);
    return submitChoiceMock(gameId, 1, currentGame?.day || 1);
  }
}

// Legacy function for backward compatibility
export async function submitChoiceLegacy(
  gameId: string,
  choiceId: number,
  day: number
): Promise<SubmitChoiceResponse> {
  // Find the impact from current event
  if (currentGame?.currentEvent) {
    const choice = currentGame.currentEvent.choices.find(c => c.id === choiceId);
    if (choice?.impact) {
      return submitChoice(gameId, choice.impact);
    }
  }
  
  // Fallback to mock
  return submitChoiceMock(gameId, choiceId, day);
}

// NOTE: This endpoint does not exist in the actual backend API
// Game status is included in the game_state response from choice endpoint
// This function is kept for legacy/mock support only
export async function getGameStatus(gameId: string): Promise<GameStatus> {
  // Always use mock for this since it doesn't exist in real API
  return getGameStatusMock(gameId);
}

// Mock implementations (fallback)
async function startNewGameMock(params: StartGameRequest): Promise<GameState> {
  await simulateDelay();

  const game_id = generateGameId();
  const initialEvent: GameEvent = {
    event_message: `You are ${params.character_name}, ${params.age} years old. You are ${params.work ? 'starting a new job' : 'beginning a new chapter in life'}.`,
    choices: [
      {
        id: 1,
        text: "Prepare early and tackle it head-on",
        health_delta: 5,
        money_delta: 0,
        mood_delta: 10,
        impact: {
          health: 5,
          happiness: 10,
          stress: 0,
          reputation: 0,
          education: 0,
          money: 0,
          weekly_income: 0,
          weekly_expense: 0,
          free_time: 0,
        },
      },
      {
        id: 2,
        text: "Start normally with a balanced approach",
        health_delta: 0,
        money_delta: 0,
        mood_delta: 5,
        impact: {
          health: 0,
          happiness: 5,
          stress: 0,
          reputation: 0,
          education: 0,
          money: 0,
          weekly_income: 0,
          weekly_expense: 0,
          free_time: 0,
        },
      },
      {
        id: 3,
        text: "Take it easy and start at your own pace",
        health_delta: 10,
        money_delta: -5,
        mood_delta: 15,
        impact: {
          health: 10,
          happiness: 15,
          stress: 0,
          reputation: 0,
          education: 0,
          money: -5,
          weekly_income: 0,
          weekly_expense: 0,
          free_time: 0,
        },
      },
    ],
  };

  const game: GameState = {
    game_id: game_id,
    day: 1,
    status: {
      game_id: game_id,
      day: 1,
      health: 70,
      money: 400,
      mood: 70,
      is_over: false,
    },
    currentEvent: initialEvent,
    params: params,
    time_allocation: 8,
    max_time_allocation: 8,
  };

  currentGame = game;
  setApiSource('mock');
  return game;
}

async function getDayEventMock(gameId: string, dayNumber: number): Promise<DayEvent> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId) {
    throw new Error('Game not found');
  }

  const event = generateEventForDay(dayNumber);
  
  // Ensure all choices have impact objects
  const choicesWithImpact = event.choices.map(choice => ({
    ...choice,
    impact: choice.impact || deltaToImpact(
      choice.health_delta,
      choice.money_delta,
      choice.mood_delta
    ),
  }));

  currentGame.currentEvent = {
    event_message: event.description,
    choices: choicesWithImpact,
  };
  currentGame.day = dayNumber;
  setApiSource('mock');
  
  return {
    ...event,
    choices: choicesWithImpact,
  };
}

async function submitChoiceMock(
  gameId: string,
  choiceId: number,
  day: number
): Promise<SubmitChoiceResponse> {
  await simulateDelay();

  if (!currentGame || currentGame.game_id !== gameId || !currentGame.currentEvent) {
    throw new Error('Invalid game state');
  }

  const selectedChoice = currentGame.currentEvent.choices.find(c => c.id === choiceId);
  if (!selectedChoice) {
    throw new Error('Invalid choice_id');
  }

  // Ensure the choice has an impact object
  const impact = selectedChoice.impact || deltaToImpact(
    selectedChoice.health_delta,
    selectedChoice.money_delta,
    selectedChoice.mood_delta
  );

  const newStatus = { ...currentGame.status };
  newStatus.health = Math.max(0, Math.min(100, newStatus.health + (selectedChoice.health_delta || 0)));
  newStatus.money = Math.max(0, newStatus.money + (selectedChoice.money_delta || 0));
  newStatus.mood = Math.max(0, Math.min(100, newStatus.mood + (selectedChoice.mood_delta || 0)));
  newStatus.day = day + 1;

  // Check game over conditions
  if (newStatus.health <= 0 || newStatus.money < 0 || newStatus.mood <= 0) {
    newStatus.is_over = true;
  }

  currentGame.status = newStatus;
  currentGame.day = newStatus.day;

  setApiSource('mock');

  return {
    status: newStatus,
    applied_choice: {
      ...selectedChoice,
      impact: impact,
    },
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

// Helper function to convert legacy delta format to Impact format
function deltaToImpact(
  health_delta?: number,
  money_delta?: number,
  mood_delta?: number
): Impact {
  return {
    health: health_delta || 0,
    happiness: mood_delta || 0,
    stress: 0,
    reputation: 0,
    education: 0,
    money: money_delta || 0,
    weekly_income: 0,
    weekly_expense: 0,
    free_time: 0,
  };
}

function generateEventForDay(day: number): DayEvent {
  const events = getEventPool();
  const selectedEvent = events[Math.floor(Math.random() * events.length)];

  // Add impact to choices if not present
  const choicesWithImpact = selectedEvent.choices.map(choice => ({
    ...choice,
    impact: choice.impact || deltaToImpact(
      choice.health_delta,
      choice.money_delta,
      choice.mood_delta
    ),
  }));

  return {
    day: day,
    description: selectedEvent.description,
    choices: choicesWithImpact,
  };
}

function getEventPool(): Array<{ description: string; choices: Choice[] }> {
  const eventPool = [
    {
      description: "A premium streaming service launches with exclusive content everyone's talking about. The subscription is $15/month with a 30-day free trial.",
      choices: [
        { id: 1, text: "Subscribe immediately - I can't miss out on this content!", health_delta: 0, money_delta: -15, mood_delta: 10 },
        { id: 2, text: "Start free trial with a calendar reminder to cancel", health_delta: 0, money_delta: 0, mood_delta: 5 },
        { id: 3, text: "Wait and see reviews before committing", health_delta: 0, money_delta: 0, mood_delta: -2 },
        { id: 4, text: "Research free alternatives instead", health_delta: 0, money_delta: 5, mood_delta: -5 }
      ]
    },
    {
      description: "Your friends are planning an expensive weekend trip. Everyone's going, but it will cost $300 and you have bills due soon.",
      choices: [
        { id: 1, text: "Go on the trip - experiences with friends are priceless", health_delta: 5, money_delta: -30, mood_delta: 15 },
        { id: 2, text: "Suggest a cheaper alternative activity instead", health_delta: 3, money_delta: -10, mood_delta: 8 },
        { id: 3, text: "Skip this one and save for the next gathering", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Go but set strict spending limits for yourself", health_delta: 3, money_delta: -15, mood_delta: 5 }
      ]
    },
    {
      description: "Your boss offers you overtime work this weekend that pays well but you're already exhausted and had plans with family.",
      choices: [
        { id: 1, text: "Accept the overtime - the extra money is too good to pass up", health_delta: -10, money_delta: 20, mood_delta: -8 },
        { id: 2, text: "Negotiate to work only one day instead of both", health_delta: -5, money_delta: 10, mood_delta: 0 },
        { id: 3, text: "Decline politely and keep your plans", health_delta: 5, money_delta: 0, mood_delta: 10 },
        { id: 4, text: "Accept but promise yourself a rest day next week", health_delta: -8, money_delta: 20, mood_delta: -3 }
      ]
    },
    {
      description: "A fitness app wants $12/month for premium features. You've been meaning to work out more, but you could also exercise for free.",
      choices: [
        { id: 1, text: "Subscribe - investing in health is always worth it", health_delta: 10, money_delta: -12, mood_delta: 5 },
        { id: 2, text: "Try the free version first for a month", health_delta: 5, money_delta: 0, mood_delta: 3 },
        { id: 3, text: "Skip it and use free workout videos", health_delta: 3, money_delta: 0, mood_delta: 0 },
        { id: 4, text: "Focus on diet changes instead, no app needed", health_delta: 8, money_delta: 0, mood_delta: 2 }
      ]
    },
    {
      description: "Your favorite online store has a flash sale - 60% off! You don't need anything urgently, but the deals are incredible.",
      choices: [
        { id: 1, text: "Buy everything in your cart - these deals are rare!", health_delta: 0, money_delta: -40, mood_delta: 12 },
        { id: 2, text: "Only buy one item you've wanted for a while", health_delta: 0, money_delta: -15, mood_delta: 8 },
        { id: 3, text: "Save the money - sales happen all the time", health_delta: 0, money_delta: 0, mood_delta: -3 },
        { id: 4, text: "Set a strict budget limit before shopping", health_delta: 0, money_delta: -20, mood_delta: 5 }
      ]
    },
    {
      description: "A friend invites you to an expensive networking dinner with potential career contacts. It's $80 per person but could lead to opportunities.",
      choices: [
        { id: 1, text: "Go and spare no expense - networking is investing in your future", health_delta: 0, money_delta: -80, mood_delta: 8 },
        { id: 2, text: "Attend but order modestly to save money", health_delta: 0, money_delta: -50, mood_delta: 5 },
        { id: 3, text: "Ask the friend to introduce you another way", health_delta: 0, money_delta: 0, mood_delta: 0 },
        { id: 4, text: "Skip it and focus on online networking instead", health_delta: 0, money_delta: 0, mood_delta: -3 }
      ]
    },
    {
      description: "You feel burned out from work. A spa day costs $150, therapy is $100 per session, or you could take a free mental health day at home.",
      choices: [
        { id: 1, text: "Book the spa day - I deserve this relaxation", health_delta: 15, money_delta: -150, mood_delta: 20 },
        { id: 2, text: "Try one therapy session to talk things through", health_delta: 10, money_delta: -100, mood_delta: 15 },
        { id: 3, text: "Take a free day off to rest at home", health_delta: 8, money_delta: 0, mood_delta: 10 },
        { id: 4, text: "Push through - I'll rest when things calm down", health_delta: -5, money_delta: 0, mood_delta: -10 }
      ]
    },
    {
      description: "An online course promises to boost your career skills for $299. Reviews are mixed, but some say it helped them get promotions.",
      choices: [
        { id: 1, text: "Invest in the course - education pays off long-term", health_delta: 0, money_delta: -299, mood_delta: 5 },
        { id: 2, text: "Look for free courses covering the same topics", health_delta: 0, money_delta: 0, mood_delta: 0 },
        { id: 3, text: "Ask your company if they'll pay for it", health_delta: 0, money_delta: 0, mood_delta: 3 },
        { id: 4, text: "Learn from free online resources like YouTube", health_delta: 0, money_delta: 0, mood_delta: -2 }
      ]
    },
    {
      description: "Your phone is getting slow. A new model costs $1000, repair costs $200, or you could keep using it as is.",
      choices: [
        { id: 1, text: "Buy the new phone - I need it for work and life", health_delta: 0, money_delta: -100, mood_delta: 15 },
        { id: 2, text: "Get it repaired and extend its life", health_delta: 0, money_delta: -20, mood_delta: 5 },
        { id: 3, text: "Keep using it until it completely breaks", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Look for a cheaper refurbished model", health_delta: 0, money_delta: -40, mood_delta: 3 }
      ]
    },
    {
      description: "It's Sunday evening and you're too tired to cook. Meal delivery is $25, frozen pizza is $8, or you could force yourself to cook what's in the fridge.",
      choices: [
        { id: 1, text: "Order delivery - my time and energy are valuable", health_delta: -3, money_delta: -25, mood_delta: 10 },
        { id: 2, text: "Quick frozen pizza - a compromise", health_delta: -2, money_delta: -8, mood_delta: 5 },
        { id: 3, text: "Cook something simple from the fridge", health_delta: 3, money_delta: 0, mood_delta: 3 },
        { id: 4, text: "Meal prep for the week to avoid this situation", health_delta: 5, money_delta: -20, mood_delta: 0 }
      ]
    },
    {
      description: "A gaming console you've wanted goes on sale. It's $400 now instead of $500. You'd use it for entertainment and stress relief.",
      choices: [
        { id: 1, text: "Buy it now - $100 savings is significant", health_delta: 0, money_delta: -40, mood_delta: 20 },
        { id: 2, text: "Wait for an even better deal during holidays", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 3, text: "Put the money toward savings instead", health_delta: 0, money_delta: 0, mood_delta: -8 },
        { id: 4, text: "Buy it but sell old electronics to offset cost", health_delta: 0, money_delta: -20, mood_delta: 15 }
      ]
    },
    {
      description: "Your car needs maintenance: $500 now for prevention, or wait and risk a $2000 repair later. You're low on funds this month.",
      choices: [
        { id: 1, text: "Do the maintenance now - prevention saves money", health_delta: 0, money_delta: -50, mood_delta: -5 },
        { id: 2, text: "Do only the most critical maintenance for $250", health_delta: 0, money_delta: -25, mood_delta: -3 },
        { id: 3, text: "Wait until next month when you have more money", health_delta: 0, money_delta: 0, mood_delta: -10 },
        { id: 4, text: "Get a second opinion to confirm what's needed", health_delta: 0, money_delta: -5, mood_delta: 0 }
      ]
    },
    {
      description: "A family member asks to borrow $200. They've borrowed before and always pay back, but it's slow. You were saving that money.",
      choices: [
        { id: 1, text: "Lend it - family comes first always", health_delta: 0, money_delta: -20, mood_delta: 5 },
        { id: 2, text: "Lend half and explain your own budget constraints", health_delta: 0, money_delta: -10, mood_delta: 3 },
        { id: 3, text: "Decline politely and suggest other resources", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Give it as a gift with no expectation of return", health_delta: 0, money_delta: -20, mood_delta: 8 }
      ]
    },
    {
      description: "Your company offers a 401k match but you'd have to reduce your take-home pay by $100/month. You're already feeling financially tight.",
      choices: [
        { id: 1, text: "Enroll - free money from employer is too good to miss", health_delta: 0, money_delta: -10, mood_delta: 5 },
        { id: 2, text: "Start with minimum contribution to get some match", health_delta: 0, money_delta: -5, mood_delta: 3 },
        { id: 3, text: "Wait until you have more financial breathing room", health_delta: 0, money_delta: 0, mood_delta: -3 },
        { id: 4, text: "Enroll and cut other expenses to make up difference", health_delta: 0, money_delta: -10, mood_delta: 0 }
      ]
    },
    {
      description: "You're invited to a conference in your field. Registration is $300, travel $400. It could boost your career but it's expensive.",
      choices: [
        { id: 1, text: "Go - career advancement is worth the investment", health_delta: 0, money_delta: -70, mood_delta: 10 },
        { id: 2, text: "Go but look for ways to minimize travel costs", health_delta: -3, money_delta: -40, mood_delta: 5 },
        { id: 3, text: "Skip it and watch if they post sessions online", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Ask your employer if they'll cover any costs", health_delta: 0, money_delta: 0, mood_delta: 3 }
      ]
    },
    {
      description: "A limited edition collectible you love is available for $200. It will likely increase in value, but you don't need it.",
      choices: [
        { id: 1, text: "Buy it - it's an investment that will appreciate", health_delta: 0, money_delta: -20, mood_delta: 15 },
        { id: 2, text: "Buy it only if you truly love it, not for profit", health_delta: 0, money_delta: -20, mood_delta: 10 },
        { id: 3, text: "Skip it - collectibles are unpredictable investments", health_delta: 0, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Set a price alert and revisit in a month", health_delta: 0, money_delta: 0, mood_delta: 0 }
      ]
    },
    {
      description: "You've been eating out for lunch daily ($12/day). Making lunch at home saves money but takes morning time you don't have.",
      choices: [
        { id: 1, text: "Keep eating out - my time is more valuable", health_delta: -5, money_delta: -12, mood_delta: 5 },
        { id: 2, text: "Meal prep on Sundays to have quick lunches", health_delta: 5, money_delta: -3, mood_delta: 3 },
        { id: 3, text: "Pack simple lunches like sandwiches", health_delta: 3, money_delta: -2, mood_delta: 0 },
        { id: 4, text: "Alternate - eat out 2-3 times, pack the rest", health_delta: 0, money_delta: -7, mood_delta: 5 }
      ]
    },
    {
      description: "Your lease is ending. A nicer apartment costs $200 more/month but is closer to work, saving 1 hour of commute daily.",
      choices: [
        { id: 1, text: "Take the nicer place - time saved is worth money", health_delta: 10, money_delta: -20, mood_delta: 15 },
        { id: 2, text: "Calculate exact cost of time vs money before deciding", health_delta: 0, money_delta: 0, mood_delta: 0 },
        { id: 3, text: "Stay in current place and invest the $200/month", health_delta: -5, money_delta: 20, mood_delta: -5 },
        { id: 4, text: "Negotiate with current landlord for better terms", health_delta: 0, money_delta: 0, mood_delta: 3 }
      ]
    },
    {
      description: "A charity you care about asks for donations. You want to help but you're working on building your emergency fund.",
      choices: [
        { id: 1, text: "Donate $50 - giving back is important regardless", health_delta: 0, money_delta: -50, mood_delta: 10 },
        { id: 2, text: "Donate $20 - something is better than nothing", health_delta: 0, money_delta: -20, mood_delta: 5 },
        { id: 3, text: "Skip for now - secure yourself first before helping others", health_delta: 0, money_delta: 0, mood_delta: -3 },
        { id: 4, text: "Volunteer time instead of money", health_delta: 5, money_delta: 0, mood_delta: 8 }
      ]
    },
    {
      description: "You're exhausted and considering hiring a cleaning service for $100/month. It would free up 4 hours but feels indulgent.",
      choices: [
        { id: 1, text: "Hire the service - buying back time is valuable", health_delta: 5, money_delta: -10, mood_delta: 10 },
        { id: 2, text: "Try it for 2 months to evaluate the value", health_delta: 3, money_delta: -10, mood_delta: 5 },
        { id: 3, text: "Clean less frequently instead of hiring help", health_delta: -3, money_delta: 0, mood_delta: -5 },
        { id: 4, text: "Keep doing it yourself - it's exercise anyway", health_delta: 3, money_delta: 0, mood_delta: -3 }
      ]
    },
  ];
  
  // Return events based on day progression
  return eventPool;
}
