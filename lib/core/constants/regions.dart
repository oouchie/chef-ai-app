class RegionInfo {
  final String id;
  final String name;
  final String flag;
  final List<String> cuisines;

  const RegionInfo({
    required this.id,
    required this.name,
    required this.flag,
    required this.cuisines,
  });
}

const worldRegions = <RegionInfo>[
  RegionInfo(
    id: 'african',
    name: 'African',
    flag: '🌍',
    cuisines: ['Ethiopian', 'Nigerian', 'Moroccan', 'South African', 'Ghanaian'],
  ),
  RegionInfo(
    id: 'asian',
    name: 'Asian',
    flag: '🌏',
    cuisines: ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian'],
  ),
  RegionInfo(
    id: 'european',
    name: 'European',
    flag: '🌍',
    cuisines: ['French', 'Italian', 'Spanish', 'Greek', 'German', 'British'],
  ),
  RegionInfo(
    id: 'latin-american',
    name: 'Latin American',
    flag: '🌎',
    cuisines: ['Mexican', 'Brazilian', 'Peruvian', 'Argentine', 'Colombian'],
  ),
  RegionInfo(
    id: 'middle-eastern',
    name: 'Middle Eastern',
    flag: '🕌',
    cuisines: ['Lebanese', 'Turkish', 'Persian', 'Israeli', 'Egyptian'],
  ),
  RegionInfo(
    id: 'southern',
    name: 'Southern US',
    flag: '🤠',
    cuisines: ['Southern Comfort', 'Country Cooking', 'Lowcountry'],
  ),
  RegionInfo(
    id: 'soul-food',
    name: 'Soul Food',
    flag: '🫶🏿',
    cuisines: ['Classic Soul Food', 'Modern Soul Food', 'Sunday Dinner'],
  ),
  RegionInfo(
    id: 'cajun-creole',
    name: 'Cajun & Creole',
    flag: '⚜️',
    cuisines: ['Cajun', 'Creole', 'Louisiana', 'New Orleans'],
  ),
  RegionInfo(
    id: 'tex-mex',
    name: 'Tex-Mex',
    flag: '🌮',
    cuisines: ['Tex-Mex', 'Southwestern', 'Border Style'],
  ),
  RegionInfo(
    id: 'bbq',
    name: 'BBQ',
    flag: '🔥',
    cuisines: ['Texas BBQ', 'Kansas City', 'Carolina', 'Memphis'],
  ),
  RegionInfo(
    id: 'new-england',
    name: 'New England',
    flag: '🦞',
    cuisines: ['New England', 'Coastal', 'Colonial'],
  ),
  RegionInfo(
    id: 'midwest',
    name: 'Midwest',
    flag: '🌽',
    cuisines: ['Midwest', 'Heartland', 'Farm-to-Table'],
  ),
  RegionInfo(
    id: 'oceanian',
    name: 'Oceanian',
    flag: '🏝️',
    cuisines: ['Australian', 'New Zealand', 'Pacific Islander', 'Hawaiian'],
  ),
  RegionInfo(
    id: 'caribbean',
    name: 'Caribbean',
    flag: '🏖️',
    cuisines: ['Jamaican', 'Cuban', 'Puerto Rican', 'Trinidadian', 'Haitian'],
  ),
];

const quickPrompts = <String>[
  "What can I make with chicken and rice?",
  "Give me an authentic Italian pasta recipe",
  "I'm craving something Thai and spicy",
  "What's a good vegetarian dinner?",
  "Quick 30-minute weeknight meal",
  "Something spicy to warm me up",
  "Teach me a classic Japanese dish",
  "Healthy high-protein breakfast ideas",
];

const restaurantList = <Map<String, dynamic>>[
  {
    'name': 'Olive Garden',
    'dishes': ['Chicken Alfredo', 'Zuppa Toscana', 'Breadsticks'],
  },
  {
    'name': 'Chipotle',
    'dishes': ['Chicken Burrito Bowl', 'Carnitas Tacos', 'Guacamole'],
  },
  {
    'name': 'Cheesecake Factory',
    'dishes': ['Bang-Bang Chicken', 'Avocado Egg Rolls', 'Oreo Cheesecake'],
  },
  {
    'name': 'Chick-fil-A',
    'dishes': ['Original Chicken Sandwich', 'Nuggets', 'Chick-fil-A Sauce'],
  },
  {
    'name': 'Panda Express',
    'dishes': ['Orange Chicken', 'Beijing Beef', 'Chow Mein'],
  },
  {
    'name': "P.F. Chang's",
    'dishes': ["Chang's Spicy Chicken", 'Lettuce Wraps', 'Dynamite Shrimp'],
  },
  {
    'name': 'Red Lobster',
    'dishes': ['Cheddar Bay Biscuits', 'Lobster Bisque', 'Coconut Shrimp'],
  },
  {
    'name': 'Cracker Barrel',
    'dishes': ['Chicken Fried Steak', 'Hashbrown Casserole', 'Biscuits & Gravy'],
  },
  {
    'name': "Popeyes",
    'dishes': ['Chicken Sandwich', 'Spicy Tenders', 'Red Beans & Rice'],
  },
  {
    'name': 'Texas Roadhouse',
    'dishes': ['Ribeye Steak', 'Rattlesnake Bites', 'Cinnamon Butter Rolls'],
  },
  {
    'name': "Raising Cane's",
    'dishes': ["Cane's Sauce", 'Chicken Fingers', 'Texas Toast'],
  },
  {
    'name': 'Wingstop',
    'dishes': ['Lemon Pepper Wings', 'Garlic Parmesan', 'Louisiana Rub'],
  },
];
