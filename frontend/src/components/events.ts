import { GameState } from '../App';

export interface Choice {
  id: string;
  text: string;
  effects: {
    happiness: number;
    financialHealth: number;
    savings?: number;
    addSubscription?: string;
    removeSubscription?: string;
  };
  result: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category?: string;
  choices: Choice[];
  financialTerm?: {
    term: string;
    definition: string;
  };
  condition?: (state: GameState) => boolean;
}

export const events: Event[] = [
  {
    id: 'streaming_service',
    title: 'New Streaming Service Launch',
    description: 'A new streaming platform just launched with exclusive shows everyone is talking about. It\'s $12.99/month, but they\'re offering a free trial.',
    category: 'Subscription',
    financialTerm: {
      term: 'Subscription Model',
      definition: 'A business model where customers pay a recurring fee at regular intervals for access to a product or service. These costs can accumulate quickly if not monitored.',
    },
    choices: [
      {
        id: 'stream_subscribe',
        text: 'Subscribe immediately - I don\'t want to miss out!',
        effects: { happiness: 10, financialHealth: -5, savings: -13, addSubscription: 'StreamMax' },
        result: 'You\'re enjoying the new shows! But remember, this is now a monthly expense that will automatically renew.',
      },
      {
        id: 'stream_trial',
        text: 'Start the free trial and set a calendar reminder to cancel',
        effects: { happiness: 8, financialHealth: 5 },
        result: 'Smart move! You\'re enjoying the content while staying in control of your spending. The reminder will help you decide if it\'s worth the cost.',
      },
      {
        id: 'stream_wait',
        text: 'Wait and see if the content is really worth it',
        effects: { happiness: -3, financialHealth: 8 },
        result: 'FOMO is real, but you\'ve avoided an impulse subscription. You can always join later if the content proves valuable.',
      },
    ],
  },
  {
    id: 'flash_sale',
    title: 'Flash Sale Alert!',
    description: 'Your favorite online store is having a 50% off flash sale ending in 2 hours. You\'ve been eyeing those sneakers for weeks.',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'Impulse Purchase',
      definition: 'An unplanned decision to buy a product or service, made just before a purchase. Often triggered by emotions, sales, or limited-time offers rather than genuine need.',
    },
    choices: [
      {
        id: 'flash_buy',
        text: 'Buy now before they sell out! It\'s 50% off!',
        effects: { happiness: 12, financialHealth: -10, savings: -75 },
        result: 'The sneakers arrived! They look great, but was this a planned purchase or did the sale pressure you into spending?',
      },
      {
        id: 'flash_consider',
        text: 'Add to cart and think about it for 24 hours',
        effects: { happiness: 2, financialHealth: 10 },
        result: 'You missed the sale, but realized you can wait. If you still want them in a week, they\'re probably worth full price.',
      },
      {
        id: 'flash_budget',
        text: 'Check if it fits this month\'s budget first',
        effects: { happiness: 5, financialHealth: 12 },
        result: 'Taking time to review your budget helped you make a conscious decision rather than an emotional one.',
      },
    ],
  },
  {
    id: 'subscription_audit',
    title: 'Bank Statement Review',
    description: 'While checking your bank statement, you notice several subscriptions you barely use. Some you even forgot about!',
    category: 'Subscription',
    financialTerm: {
      term: 'Subscription Creep',
      definition: 'The gradual accumulation of multiple subscription services over time, often forgotten or underused, that significantly impact monthly expenses.',
    },
    condition: (state) => state.subscriptions.length > 0,
    choices: [
      {
        id: 'cancel_all',
        text: 'Cancel all unused subscriptions immediately',
        effects: { happiness: -5, financialHealth: 20, savings: 30 },
        result: 'You freed up $30+ per month! It stings a little now, but your future self will thank you. That\'s $360+ per year saved.',
      },
      {
        id: 'keep_one',
        text: 'Keep just your favorite one, cancel the rest',
        effects: { happiness: 5, financialHealth: 15, savings: 20 },
        result: 'A balanced approach! You kept what truly adds value while eliminating waste. This is smart financial management.',
      },
      {
        id: 'ignore_subs',
        text: 'They\'re not that expensive, I\'ll keep them all',
        effects: { happiness: 8, financialHealth: -12 },
        result: 'Small amounts add up. $10 here and $15 there becomes $300+ annually. Death by a thousand subscriptions is real.',
      },
    ],
  },
  {
    id: 'social_pressure',
    title: 'Friends Night Out',
    description: 'Your friends want to try an expensive new restaurant. Everyone\'s going, but it\'s $60+ per person and you already ate at home.',
    category: 'Compulsive Buying',
    choices: [
      {
        id: 'social_go',
        text: 'Go anyway - experiences with friends are priceless!',
        effects: { happiness: 15, financialHealth: -15, savings: -60 },
        result: 'You had fun, but was it $60 worth of fun? Sometimes social pressure leads to overspending on things we don\'t really want.',
      },
      {
        id: 'social_alternative',
        text: 'Suggest a cheaper alternative for next time',
        effects: { happiness: 5, financialHealth: 10 },
        result: 'Your friends appreciated the honesty! You\'re not the only one feeling the financial pressure. Real friends understand.',
      },
      {
        id: 'social_skip',
        text: 'Skip it and save the money',
        effects: { happiness: -8, financialHealth: 15 },
        result: 'FOMO hit hard, but you stayed true to your financial goals. Not every social event needs to cost a fortune.',
      },
    ],
  },
  {
    id: 'online_ads',
    title: 'Targeted Advertising',
    description: 'You\'ve been browsing online and now ads for that product are everywhere. It\'s like it\'s following you. "Only 3 left in stock!"',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'Retargeting',
      definition: 'A digital marketing strategy that shows ads to people who have previously visited a website. Creates artificial urgency and increases purchase likelihood through repeated exposure.',
    },
    choices: [
      {
        id: 'ads_buy',
        text: 'Buy it now - it\'s a sign! Plus limited stock!',
        effects: { happiness: 8, financialHealth: -12, savings: -45 },
        result: 'The "limited stock" claim is often a marketing tactic. These ads are designed to manipulate your psychology and create false urgency.',
      },
      {
        id: 'ads_ignore',
        text: 'Ignore the ads and clear your cookies',
        effects: { happiness: 0, financialHealth: 10 },
        result: 'You\'ve taken back control! Understanding how targeted advertising works helps you resist manipulation.',
      },
      {
        id: 'ads_wishlist',
        text: 'Add to a wishlist and revisit in a month',
        effects: { happiness: 3, financialHealth: 8 },
        result: 'The 30-day rule: If you still want it after a month, it might be worth buying. Most impulses fade with time.',
      },
    ],
  },
  {
    id: 'gym_membership',
    title: 'New Year, New You?',
    description: 'The gym is offering an annual membership deal - pay upfront for 12 months and save 30%. You went to the gym 3 times last year.',
    category: 'Subscription',
    financialTerm: {
      term: 'Sunk Cost',
      definition: 'Money that has already been spent and cannot be recovered. Many people continue paying for memberships they don\'t use because they already paid for it, rather than cutting their losses.',
    },
    choices: [
      {
        id: 'gym_annual',
        text: 'Buy the annual membership - this time will be different!',
        effects: { happiness: 10, financialHealth: -20, savings: -300 },
        result: 'Optimism bias is real! Most annual gym memberships go unused. That\'s $300 you could have invested or saved.',
      },
      {
        id: 'gym_monthly',
        text: 'Start with monthly membership - prove you\'ll use it first',
        effects: { happiness: 8, financialHealth: 5, savings: -30 },
        result: 'Smart approach! Building the habit first means you\'ll only pay for what you actually use. Commit to the habit, not just the payment.',
      },
      {
        id: 'gym_free',
        text: 'Try free alternatives first - home workouts, running',
        effects: { happiness: 2, financialHealth: 15 },
        result: 'The best workout plan is one you\'ll actually do. Free options help you build consistency before committing money.',
      },
    ],
  },
  {
    id: 'app_subscriptions',
    title: 'App Premium Upgrade',
    description: 'An app you use daily is pushing a premium subscription: $9.99/month for ad-free experience and extra features you might not need.',
    category: 'Subscription',
    choices: [
      {
        id: 'app_upgrade',
        text: 'Subscribe - I use it every day and deserve ad-free',
        effects: { happiness: 10, financialHealth: -8, savings: -10, addSubscription: 'PremiumApp' },
        result: 'Ad-free is nice, but ask yourself: would you pay $120/year for this? Sometimes free alternatives exist.',
      },
      {
        id: 'app_ads',
        text: 'Keep using the free version with ads',
        effects: { happiness: -2, financialHealth: 10 },
        result: 'A few ads aren\'t the end of the world. You\'re saving $120/year by accepting minor inconvenience.',
      },
      {
        id: 'app_alternative',
        text: 'Research if there\'s a free alternative app',
        effects: { happiness: 0, financialHealth: 12 },
        result: 'You found a free alternative that does 90% of what you need! Being a smart consumer means exploring all options.',
      },
    ],
  },
  {
    id: 'convenience_spending',
    title: 'Coffee Shop Temptation',
    description: 'You pass your favorite coffee shop daily. That $5 latte is calling your name. You have coffee at home, but it\'s not the same...',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'The Latte Factor',
      definition: 'A term describing how small, regular purchases (like daily coffee) accumulate into significant amounts. $5/day = $1,825/year.',
    },
    choices: [
      {
        id: 'coffee_daily',
        text: 'Buy it - it\'s just $5 and I work hard!',
        effects: { happiness: 8, financialHealth: -10, savings: -5 },
        result: 'Small pleasures matter, but $5/day = $1,825/year. That\'s a vacation, emergency fund, or investment opportunity.',
      },
      {
        id: 'coffee_sometimes',
        text: 'Make it a Friday treat instead of daily habit',
        effects: { happiness: 6, financialHealth: 8 },
        result: 'Balance achieved! By making it special, you enjoy it more AND save $20/month. That\'s $240/year.',
      },
      {
        id: 'coffee_home',
        text: 'Make coffee at home and invest the savings',
        effects: { happiness: -2, financialHealth: 15, savings: 5 },
        result: 'Delayed gratification is powerful. Investing that $5/day could be worth $10,000+ in 5 years with compound interest!',
      },
    ],
  },
  {
    id: 'buy_now_pay_later',
    title: 'Buy Now, Pay Later',
    description: 'You\'re shopping online and see "Buy Now, Pay Later - Split into 4 interest-free payments!" on a $200 item you want but can\'t quite afford.',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'BNPL (Buy Now, Pay Later)',
      definition: 'A short-term financing option that allows consumers to make purchases and pay for them in installments. While often interest-free, it encourages spending beyond your means and can lead to debt accumulation.',
    },
    choices: [
      {
        id: 'bnpl_use',
        text: 'Use BNPL - 4 payments of $50 sounds manageable',
        effects: { happiness: 12, financialHealth: -15, savings: -50 },
        result: 'BNPL makes spending feel painless, but you\'ve committed future income. Multiple BNPL purchases can quickly spiral out of control.',
      },
      {
        id: 'bnpl_save',
        text: 'Save up for it instead and buy when you have the money',
        effects: { happiness: -5, financialHealth: 15 },
        result: 'Old-fashioned but effective! By the time you save up, you might realize you don\'t want it that badly. Plus, no debt!',
      },
      {
        id: 'bnpl_skip',
        text: 'If you can\'t afford it now, you probably don\'t need it',
        effects: { happiness: -8, financialHealth: 18 },
        result: 'Harsh but true. BNPL is credit in disguise. Living within your means prevents the stress of multiple payment obligations.',
      },
    ],
  },
  {
    id: 'gaming_microtransactions',
    title: 'Limited Edition Skin',
    description: 'Your favorite game released a limited edition character skin for $15. It\'s cosmetic only - doesn\'t affect gameplay - but it looks amazing.',
    category: 'Compulsive Buying',
    choices: [
      {
        id: 'game_buy',
        text: 'Buy it - it\'s limited edition and I play this game a lot',
        effects: { happiness: 10, financialHealth: -8, savings: -15 },
        result: 'Digital purchases feel less "real" but it\'s still $15. Ask yourself: would you pay $15 for a different colored shirt in real life?',
      },
      {
        id: 'game_wait',
        text: 'Wait to see if it comes back or goes on sale',
        effects: { happiness: -3, financialHealth: 8 },
        result: 'FOMO is strong with limited editions, but companies often re-release them. Your patience might save money.',
      },
      {
        id: 'game_default',
        text: 'Keep using default items - gameplay is what matters',
        effects: { happiness: -5, financialHealth: 12 },
        result: 'You\'re playing the game, not a fashion show. Cosmetic purchases in free games are designed to exploit completionist psychology.',
      },
    ],
  },
  {
    id: 'subscription_bundle',
    title: 'The Ultimate Bundle',
    description: 'A company offers a bundle: streaming, music, cloud storage, and gaming for $25/month. Separately they\'re $45/month. You use 2 of these services.',
    category: 'Subscription',
    financialTerm: {
      term: 'Bundle Trap',
      definition: 'When companies package multiple services together at a discount, leading consumers to pay for services they don\'t use just because it seems like a good deal.',
    },
    choices: [
      {
        id: 'bundle_buy',
        text: 'Get the bundle - it\'s better value and I might use them',
        effects: { happiness: 8, financialHealth: -10, savings: -25, addSubscription: 'MegaBundle' },
        result: 'You\'re paying for "might use" instead of "actually use". The best deal is the one that matches your actual needs.',
      },
      {
        id: 'bundle_only',
        text: 'Pay only for the 2 services I actually use',
        effects: { happiness: 5, financialHealth: 12, savings: -20 },
        result: 'Smart! You\'re paying for value you receive, not theoretical value. This saves you $60/year.',
      },
      {
        id: 'bundle_alternatives',
        text: 'Research free alternatives for all services',
        effects: { happiness: -2, financialHealth: 15 },
        result: 'Many "premium" features have free alternatives if you\'re willing to compromise slightly. The savings add up significantly.',
      },
    ],
  },
  {
    id: 'meal_delivery',
    title: 'Meal Kit Subscription',
    description: 'A meal kit service is advertising: "Save time, eat healthy, only $60/week!" You currently spend about $40/week on groceries.',
    category: 'Subscription',
    choices: [
      {
        id: 'meal_subscribe',
        text: 'Subscribe - time is money and I need to eat healthier',
        effects: { happiness: 10, financialHealth: -12, savings: -60, addSubscription: 'MealKit' },
        result: 'Convenience comes at a price. That\'s $1,040 more per year than your current grocery budget. Is the convenience worth it?',
      },
      {
        id: 'meal_trial',
        text: 'Try one box first before committing to subscription',
        effects: { happiness: 8, financialHealth: 5, savings: -15 },
        result: 'Testing before committing! You can evaluate the real value without locking into a subscription. Many people cancel after realizing the actual effort involved.',
      },
      {
        id: 'meal_self',
        text: 'Meal prep on Sundays with groceries I buy',
        effects: { happiness: 2, financialHealth: 15 },
        result: 'DIY saves money and gives you control. The meal kit convenience is appealing, but you can achieve similar results cheaper with planning.',
      },
    ],
  },
  {
    id: 'emotional_shopping',
    title: 'Bad Day Therapy',
    description: 'You had a terrible day. Online shopping is calling. That full cart of items you don\'t need would total $150. Retail therapy?',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'Emotional Spending',
      definition: 'Shopping driven by emotions (stress, sadness, boredom) rather than actual need. The temporary happiness boost often leads to buyer\'s remorse and financial stress.',
    },
    choices: [
      {
        id: 'emotion_buy',
        text: 'Buy everything - I deserve it after the day I had',
        effects: { happiness: 15, financialHealth: -18, savings: -150 },
        result: 'The happiness spike is temporary. Studies show emotional purchases often lead to regret and worsen stress when bills arrive.',
      },
      {
        id: 'emotion_wait',
        text: 'Save the cart and check it tomorrow when calm',
        effects: { happiness: 3, financialHealth: 12 },
        result: 'Excellent emotional regulation! Tomorrow you\'ll see what you actually want vs. what your emotions wanted. Most carts get abandoned.',
      },
      {
        id: 'emotion_free',
        text: 'Find a free stress relief - call a friend, exercise, journal',
        effects: { happiness: 8, financialHealth: 15 },
        result: 'You broke the emotional spending cycle! Building healthy coping mechanisms protects both mental health and finances.',
      },
    ],
  },
  {
    id: 'credit_card_rewards',
    title: 'Credit Card Rewards',
    description: 'Your credit card offers 5% cashback on purchases this month. You\'re thinking of buying things early to maximize rewards.',
    category: 'Compulsive Buying',
    financialTerm: {
      term: 'Rewards Optimization Trap',
      definition: 'Spending more money than planned just to earn rewards or cashback. If you spend $100 to get $5 back, you\'re still $95 poorer.',
    },
    choices: [
      {
        id: 'rewards_spend',
        text: 'Buy things early to maximize the 5% cashback',
        effects: { happiness: 8, financialHealth: -15, savings: -100 },
        result: 'You spent $100 to earn $5. Credit card companies profit when cardholders optimize rewards by spending more than they normally would.',
      },
      {
        id: 'rewards_normal',
        text: 'Only buy what you need, rewards are just a bonus',
        effects: { happiness: 5, financialHealth: 12 },
        result: 'Perfect mindset! Rewards should be earned on necessary spending, not an excuse to spend more. You kept control of your budget.',
      },
      {
        id: 'rewards_ignore',
        text: 'Ignore the promotion entirely and stick to your budget',
        effects: { happiness: 0, financialHealth: 15 },
        result: 'These promotions are designed to increase spending. By ignoring them, you maintained your financial discipline.',
      },
    ],
  },
  {
    id: 'social_media_influence',
    title: 'Influencer Recommendation',
    description: 'Your favorite influencer is promoting a product with a discount code. "This changed my life!" They might be paid to say that...',
    category: 'Compulsive Buying',
    choices: [
      {
        id: 'influence_buy',
        text: 'Buy it with the code - they wouldn\'t lie, right?',
        effects: { happiness: 10, financialHealth: -12, savings: -50 },
        result: 'Influencer marketing works because it feels like a friend\'s recommendation. But it\'s advertising. They likely earn commission on your purchase.',
      },
      {
        id: 'influence_research',
        text: 'Research independent reviews before deciding',
        effects: { happiness: 3, financialHealth: 10 },
        result: 'Critical thinking wins! Independent reviews often reveal the product isn\'t as amazing as advertised. Trust, but verify.',
      },
      {
        id: 'influence_ignore',
        text: 'Skip it - influencer promotions are paid ads',
        effects: { happiness: -2, financialHealth: 15 },
        result: 'You saw through the marketing! Influencers must disclose partnerships, but emotional connection makes you forget it\'s an ad.',
      },
    ],
  },
];
