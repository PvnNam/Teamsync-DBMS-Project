import db, { initDB } from './db.js';
import { seedRelationalData } from './relational-seed.js';

console.log('🌱 Seeding TeamSync SQLite Database...');

initDB();

// Clear existing tables
db.exec(`
  DELETE FROM password_resets;
  DELETE FROM notifications;
  DELETE FROM team_events;
  DELETE FROM team_applications;
  DELETE FROM messages;
  DELETE FROM team_members;
  DELETE FROM teams;
  DELETE FROM achievements;
  DELETE FROM user_games;
  DELETE FROM users;
`);

// ─── Users (14 core + 22 extra = 36 total) ────────────────────────────────
const usersData = [
  // Core accounts
  { username: 'admin',        password: 'admin',       email: 'admin@teamsync.gg',       avatar_text: 'A', rank_title: 'System Administrator' },
  { username: 'pixelpilot',   password: 'password123', email: 'pixelpilot@teamsync.gg',  avatar_text: 'P', rank_title: 'Pro Player & Team Captain' },
  { username: 'NovaSkye',     password: 'password123', email: 'novaskye@teamsync.gg',    avatar_text: 'N', rank_title: 'Fragger Specialist' },
  { username: 'Airborne',     password: 'password123', email: 'airborne@teamsync.gg',    avatar_text: 'A', rank_title: 'Aerial Defender' },
  { username: 'KRYPT',        password: 'password123', email: 'krypt@teamsync.gg',       avatar_text: 'K', rank_title: 'Entry Fragger' },
  { username: 'Mira',         password: 'password123', email: 'mira@teamsync.gg',        avatar_text: 'M', rank_title: 'Utility Support' },
  { username: 'Volt',         password: 'password123', email: 'volt@teamsync.gg',        avatar_text: 'V', rank_title: 'Rifle Specialist' },
  { username: 'Sage',         password: 'password123', email: 'sage@teamsync.gg',        avatar_text: 'S', rank_title: 'Tactical IGL' },
  { username: 'JettStream',   password: 'password123', email: 'jett@teamsync.gg',        avatar_text: 'J', rank_title: 'Duelist Main' },
  { username: 'Luma',         password: 'password123', email: 'luma@teamsync.gg',        avatar_text: 'L', rank_title: 'Initiator Flex' },
  { username: 'Cipher',       password: 'password123', email: 'cipher@teamsync.gg',      avatar_text: 'C', rank_title: 'Sentinel Anchor' },
  { username: 'Orbit',        password: 'password123', email: 'orbit@teamsync.gg',       avatar_text: 'O', rank_title: 'Flex Marksman' },
  { username: 'Valkyrie',     password: 'password123', email: 'valkyrie@teamsync.gg',    avatar_text: 'V', rank_title: 'Overwatch Support' },
  { username: 'ShadowSniper', password: 'password123', email: 'shadow@teamsync.gg',      avatar_text: 'S', rank_title: 'AWP Expert' },
  // Extra accounts
  { username: 'FrostByte',    password: 'frost2024',   email: 'frostbyte@teamsync.gg',   avatar_text: 'F', rank_title: 'Diamond Duelist' },
  { username: 'NeonRift',     password: 'neon!888',    email: 'neonrift@teamsync.gg',    avatar_text: 'N', rank_title: 'IGL & Coach' },
  { username: 'ZeroKelvin',   password: 'zero@cold9',  email: 'zerokelvin@teamsync.gg',  avatar_text: 'Z', rank_title: 'Precision Sniper' },
  { username: 'BladeRunner',  password: 'blade4ever',  email: 'bladerunner@teamsync.gg', avatar_text: 'B', rank_title: 'Eco Round Specialist' },
  { username: 'Pyra',         password: 'pyra1357',    email: 'pyra@teamsync.gg',        avatar_text: 'P', rank_title: 'Aggressive Initiator' },
  { username: 'IronLace',     password: 'ironlace55',  email: 'ironlace@teamsync.gg',    avatar_text: 'I', rank_title: 'Defensive Anchor' },
  { username: 'VexGhost',     password: 'vexG#009',    email: 'vexghost@teamsync.gg',    avatar_text: 'V', rank_title: 'Lurk & Flank Specialist' },
  { username: 'SkyViper',     password: 'viper7890',   email: 'skyviper@teamsync.gg',    avatar_text: 'S', rank_title: 'Aerial Combat Expert' },
  { username: 'HexCore',      password: 'hex@core2',   email: 'hexcore@teamsync.gg',     avatar_text: 'H', rank_title: 'Mid-lane Carry' },
  { username: 'DriftKing',    password: 'drift!king3', email: 'driftking@teamsync.gg',   avatar_text: 'D', rank_title: 'Grand Champion I' },
  { username: 'Quasar',       password: 'quas4r99',    email: 'quasar@teamsync.gg',      avatar_text: 'Q', rank_title: 'Radiant Ranked' },
  { username: 'XenoMark',     password: 'xeno@11',     email: 'xenomark@teamsync.gg',    avatar_text: 'X', rank_title: 'Global Elite' },
  { username: 'StormPeak',    password: 'stormP@22',   email: 'stormpeak@teamsync.gg',   avatar_text: 'S', rank_title: 'Fortnite Champion' },
  { username: 'GlitchKid',    password: 'g1tchK!d',    email: 'glitchkid@teamsync.gg',   avatar_text: 'G', rank_title: 'Bug Hunter & Tactician' },
  { username: 'Riven',        password: 'riven2025',   email: 'riven@teamsync.gg',       avatar_text: 'R', rank_title: 'Carry Specialist' },
  { username: 'Spectra',      password: 'spec!ra77',   email: 'spectra@teamsync.gg',     avatar_text: 'S', rank_title: 'Lurk & Info Gatherer' },
  { username: 'PulseWave',    password: 'pulse44wave', email: 'pulsewave@teamsync.gg',   avatar_text: 'P', rank_title: 'Support & Flash Specialist' },
  { username: 'CrimsonEdge',  password: 'crim$on1',    email: 'crimsonedge@teamsync.gg', avatar_text: 'C', rank_title: 'Entry Fragger — Radiant' },
  { username: 'Abyss',        password: 'abyss_deep',  email: 'abyss@teamsync.gg',       avatar_text: 'A', rank_title: 'Controller Main' },
  { username: 'LiteFuse',     password: 'lit3fuse!',   email: 'litefuse@teamsync.gg',    avatar_text: 'L', rank_title: 'Speed Runner & Rusher' },
  { username: 'Nimbus',       password: 'nimbus2026',  email: 'nimbus@teamsync.gg',      avatar_text: 'N', rank_title: 'Aerial Freestyle Pro' },
  { username: 'KiraX',        password: 'kirax999',    email: 'kirax@teamsync.gg',       avatar_text: 'K', rank_title: 'Clutch Player — Immortal' },
  // Additional fake accounts
  { username: 'TitanFall',    password: 'titan@321',   email: 'titanfall@teamsync.gg',   avatar_text: 'T', rank_title: 'Hard Entry Fragger' },
  { username: 'ArcLight',     password: 'arc!ight77',  email: 'arclight@teamsync.gg',    avatar_text: 'A', rank_title: 'Radiant IGL' },
  { username: 'VoidWalker',   password: 'v01dW@lk',    email: 'voidwalker@teamsync.gg',  avatar_text: 'V', rank_title: 'Lurker Supreme' },
  { username: 'FluxRider',    password: 'flux!ride9',  email: 'fluxrider@teamsync.gg',   avatar_text: 'F', rank_title: 'Speed Rusher' },
  { username: 'PrismShot',    password: 'prism#2026',  email: 'prismshot@teamsync.gg',   avatar_text: 'P', rank_title: 'Precision AWPer' },
  { username: 'CobraStrike',  password: 'cobr@99',     email: 'cobrastrike@teamsync.gg', avatar_text: 'C', rank_title: 'Aggressive Duelist' },
  { username: 'NebulaX',      password: 'neb!x888',    email: 'nebulax@teamsync.gg',     avatar_text: 'N', rank_title: 'Champion Flex' },
  { username: 'Solstice',     password: 'sol$tice1',   email: 'solstice@teamsync.gg',    avatar_text: 'S', rank_title: 'FNCS Qualifier' },
  { username: 'EchoFlare',    password: 'ech0fl@re',   email: 'echoflare@teamsync.gg',   avatar_text: 'E', rank_title: 'RL Grand Champion III' },
  { username: 'ReaperX9',     password: 'reap3r!X9',   email: 'reaperx9@teamsync.gg',    avatar_text: 'R', rank_title: 'Global Elite AWP' },
  // 50 additional fake accounts
  { username: 'ViperAce',       password: 'pass101', email: 'viperace@teamsync.gg',       avatar_text: 'V', rank_title: 'Radiant Sentinel' },
  { username: 'PhantomPulse',   password: 'pulse202', email: 'phantompulse@teamsync.gg',   avatar_text: 'P', rank_title: 'Immortal Duelist' },
  { username: 'SolarFlare',     password: 'solar303', email: 'solarflare@teamsync.gg',     avatar_text: 'S', rank_title: 'Apex Champion' },
  { username: 'LunarBlade',     password: 'lunar404', email: 'lunarblade@teamsync.gg',     avatar_text: 'L', rank_title: 'Global Elite AWPer' },
  { username: 'AstralKnight',   password: 'astral505', email: 'astralknight@teamsync.gg',   avatar_text: 'A', rank_title: 'Overwatch Tank' },
  { username: 'CyberVex',       password: 'cyber606', email: 'cybervex@teamsync.gg',       avatar_text: 'C', rank_title: 'Initiator Flex' },
  { username: 'HyperDrift',     password: 'hyper707', email: 'hyperdrift@teamsync.gg',     avatar_text: 'H', rank_title: 'Grand Champion III' },
  { username: 'NovaStrike',     password: 'nova808', email: 'novastrike@teamsync.gg',     avatar_text: 'N', rank_title: 'FNCS Finalist' },
  { username: 'Venomous',       password: 'venom909', email: 'venomous@teamsync.gg',       avatar_text: 'V', rank_title: 'Valorant IGL' },
  { username: 'ChronoTrigger',  password: 'chrono10', email: 'chronotrigger@teamsync.gg',  avatar_text: 'C', rank_title: 'Tactical Support' },
  { username: 'IronClaw',       password: 'iron1111', email: 'ironclaw@teamsync.gg',       avatar_text: 'I', rank_title: 'CS:GO Anchor' },
  { username: 'ShadowRift',     password: 'shadow12', email: 'shadowrift@teamsync.gg',     avatar_text: 'S', rank_title: 'Lurker Specialist' },
  { username: 'ThunderBolt',    password: 'thunder13', email: 'thunderbolt@teamsync.gg',   avatar_text: 'T', rank_title: 'Entry Specialist' },
  { username: 'FrostWing',      password: 'frost144', email: 'frostwing@teamsync.gg',      avatar_text: 'F', rank_title: 'Freestyle Legend' },
  { username: 'MagmaCore',      password: 'magma155', email: 'magmacore@teamsync.gg',      avatar_text: 'M', rank_title: 'FNCS Champion' },
  { username: 'ZenithPro',      password: 'zenith16', email: 'zenithpro@teamsync.gg',      avatar_text: 'Z', rank_title: 'Radiant Controller' },
  { username: 'AlphaOmega',     password: 'alpha177', email: 'alphaomega@teamsync.gg',     avatar_text: 'A', rank_title: 'Team Captain' },
  { username: 'Spectral',       password: 'spect188', email: 'spectral@teamsync.gg',       avatar_text: 'S', rank_title: 'Diamond III Duelist' },
  { username: 'VelocityX',      password: 'veloc199', email: 'velocityx@teamsync.gg',      avatar_text: 'V', rank_title: 'Speed Runner' },
  { username: 'VortexKing',     password: 'vort2020', email: 'vortexking@teamsync.gg',     avatar_text: 'V', rank_title: 'Grand Champion I' },
  { username: 'BlazeFury',      password: 'blaze211', email: 'blazefury@teamsync.gg',      avatar_text: 'B', rank_title: 'Build Master' },
  { username: 'Krypton99',      password: 'krypt222', email: 'krypton99@teamsync.gg',      avatar_text: 'K', rank_title: 'AWP God' },
  { username: 'QuantumDash',    password: 'quant233', email: 'quantumdash@teamsync.gg',    avatar_text: 'Q', rank_title: 'Flex Initiator' },
  { username: 'MatrixRebel',    password: 'matr244', email: 'matrixrebel@teamsync.gg',    avatar_text: 'M', rank_title: 'Rifle Master' },
  { username: 'PhoenixRise',    password: 'phoe255', email: 'phoenixrise@teamsync.gg',    avatar_text: 'P', rank_title: 'Immortal 2' },
  { username: 'ZeroGravity',    password: 'zero266', email: 'zerogravity@teamsync.gg',    avatar_text: 'Z', rank_title: 'Aerial Pro' },
  { username: 'StormRider',     password: 'storm27', email: 'stormrider@teamsync.gg',     avatar_text: 'S', rank_title: 'Solo Cup Legend' },
  { username: 'ApexPredator',   password: 'apex288', email: 'apexpredator@teamsync.gg',   avatar_text: 'A', rank_title: 'Radiant MVP' },
  { username: 'RogueAgent',     password: 'rogue29', email: 'rogueagent@teamsync.gg',     avatar_text: 'R', rank_title: 'Faceit Level 10' },
  { username: 'Titanium',       password: 'titan30', email: 'titanium@teamsync.gg',       avatar_text: 'T', rank_title: 'Sentinel Main' },
  { username: 'InfernoX',       password: 'infer31', email: 'infernox@teamsync.gg',       avatar_text: 'I', rank_title: 'Entry Fragger' },
  { username: 'CosmicByte',     password: 'cosm32', email: 'cosmicbyte@teamsync.gg',     avatar_text: 'C', rank_title: 'Support Specialist' },
  { username: 'MirageMaster',   password: 'mira33', email: 'miragemaster@teamsync.gg',   avatar_text: 'M', rank_title: 'Clutch God' },
  { username: 'VanguardX',      password: 'vang34', email: 'vanguardx@teamsync.gg',      avatar_text: 'V', rank_title: 'Marvel Rivals Ace' },
  { username: 'Overdrive',      password: 'over35', email: 'overdrive@teamsync.gg',      avatar_text: 'O', rank_title: 'Grand Champion II' },
  { username: 'SkyBound',       password: 'skyb36', email: 'skybound@teamsync.gg',       avatar_text: 'S', rank_title: 'FNCS Solo Champ' },
  { username: 'LethalEdge',     password: 'leth37', email: 'lethaledge@teamsync.gg',     avatar_text: 'L', rank_title: 'Global Elite' },
  { username: 'Oblivion',       password: 'obli38', email: 'oblivion@teamsync.gg',       avatar_text: 'O', rank_title: 'Immortal 1' },
  { username: 'RadiantGhost',   password: 'radi39', email: 'radiantghost@teamsync.gg',   avatar_text: 'R', rank_title: 'Radiant IGL' },
  { username: 'VelocityPrime',  password: 'velo40', email: 'velocityprime@teamsync.gg',  avatar_text: 'V', rank_title: 'Rocket League Pro' },
  { username: 'HyperNova',      password: 'hype41', email: 'hypernova@teamsync.gg',      avatar_text: 'H', rank_title: 'Fortnite Builder' },
  { username: 'CyberKnight',    password: 'cybe42', email: 'cyberknight@teamsync.gg',    avatar_text: 'C', rank_title: 'CS:GO AWPer' },
  { username: 'PhantomStrike',  password: 'phan43', email: 'phantomstrike@teamsync.gg',  avatar_text: 'P', rank_title: 'Duelist Main' },
  { username: 'ThunderClap',    password: 'thun44', email: 'thunderclap@teamsync.gg',    avatar_text: 'T', rank_title: 'Initiator Master' },
  { username: 'ZeroPoint',      password: 'zero45', email: 'zeropoint@teamsync.gg',      avatar_text: 'Z', rank_title: 'Victory Cup Winner' },
  { username: 'AlphaStorm',     password: 'alph46', email: 'alphastorm@teamsync.gg',     avatar_text: 'A', rank_title: 'Apex Champion' },
  { username: 'VectorPrime',    password: 'vect47', email: 'vectorprime@teamsync.gg',    avatar_text: 'V', rank_title: 'Faceit Level 9' },
  { username: 'VortexFlare',    password: 'vort48', email: 'vortexflare@teamsync.gg',    avatar_text: 'V', rank_title: 'Freestyle God' },
  { username: 'ApexMaster',     password: 'apex49', email: 'apexmaster@teamsync.gg',     avatar_text: 'A', rank_title: 'Radiant Top 100' },
  { username: 'OmegaReaper',    password: 'omeg50', email: 'omegareaper@teamsync.gg',    avatar_text: 'O', rank_title: 'Global Elite' },
];

const insertUser = db.prepare(`
  INSERT INTO users (username, password, email, avatar_text, rank_title)
  VALUES (?, ?, ?, ?, ?)
`);

const userIdMap = {};
for (const user of usersData) {
  const info = insertUser.run(user.username, user.password, user.email, user.avatar_text, user.rank_title);
  userIdMap[user.username] = info.lastInsertRowid;
}

// ─── User Games & Achievements ────────────────────────────────────────────
const gamesData = [
  {
    user: 'pixelpilot',
    games: [
      { name: 'Valorant',      hours: 342, color: 'valorant', achievements: ['Ascendant 2', 'Team MVP x12', 'Clutch God'] },
      { name: 'Fortnite',      hours: 118, color: 'fortnite', achievements: ['Victory Royale x28', 'Crown Winner x16', 'FNCS Qualifier'] },
      { name: 'CS:GO',         hours: 520, color: 'csgo',     achievements: ['Global Elite', 'Ace x9', 'Major Scrim Winner'] },
      { name: 'Rocket League', hours: 210, color: 'rocket',   achievements: ['Champion II', 'Golden Goal', 'Air Dribbler'] },
    ]
  },
  { user: 'NovaSkye', games: [
      { name: 'Fortnite', hours: 410, color: 'fortnite', achievements: ['Crown Winner x16', 'Top 1% Ranked', 'Solo Cup Champ'] },
      { name: 'Valorant', hours: 195, color: 'valorant', achievements: ['Diamond 3', 'First Blood x45'] },
  ]},
  { user: 'Airborne', games: [
      { name: 'Rocket League', hours: 680, color: 'rocket', achievements: ['Grand Champion I', 'Saves MVP', 'Ceiling Shot Legend'] },
  ]},
  { user: 'KRYPT', games: [
      { name: 'CS:GO', hours: 1200, color: 'csgo', achievements: ['Faceit Level 10', 'Pistol Round King', 'ESEA Premier'] },
  ]},
  { user: 'Mira', games: [
      { name: 'CS:GO', hours: 850, color: 'csgo', achievements: ['Utility Master', 'Clutch x14', 'Support of the Year'] },
  ]},
  { user: 'Volt', games: [
      { name: 'CS:GO', hours: 620, color: 'csgo', achievements: ['Top Fragger x20', 'Faceit Level 9'] },
  ]},
  { user: 'Sage', games: [
      { name: 'CS:GO', hours: 940, color: 'csgo', achievements: ['Tactical Genius', 'Clutch x18', 'IGL MVP'] },
  ]},
  { user: 'JettStream', games: [
      { name: 'Valorant', hours: 780, color: 'valorant', achievements: ['Immortal 1', 'First Blood x82', 'Radiant Challenger'] },
  ]},
  { user: 'Luma', games: [
      { name: 'Valorant', hours: 490, color: 'valorant', achievements: ['Ascendant 3', 'Assist King', 'Flash Master'] },
  ]},
  { user: 'Cipher', games: [
      { name: 'Valorant', hours: 530, color: 'valorant', achievements: ['Ascendant 1', 'Flawless x15', 'Site Lock Down'] },
  ]},
  { user: 'Orbit', games: [
      { name: 'Valorant', hours: 310, color: 'valorant', achievements: ['Diamond 3', 'Clutch x22'] },
  ]},
  { user: 'FrostByte', games: [
      { name: 'Valorant', hours: 560, color: 'valorant', achievements: ['Diamond 1', 'Flawless Run x3'] },
      { name: 'CS:GO',    hours: 280, color: 'csgo',     achievements: ['Faceit Level 7'] },
  ]},
  { user: 'NeonRift', games: [
      { name: 'Valorant',      hours: 820, color: 'valorant', achievements: ['Immortal 2', 'Coaching Badge', 'Strategy Master'] },
      { name: 'Rocket League', hours: 400, color: 'rocket',   achievements: ['Diamond III'] },
  ]},
  { user: 'ZeroKelvin', games: [
      { name: 'CS:GO', hours: 1450, color: 'csgo', achievements: ['Faceit Level 10', 'Sniper of the Season', 'HLTV Top 50'] },
  ]},
  { user: 'BladeRunner', games: [
      { name: 'CS:GO',    hours: 740, color: 'csgo',     achievements: ['LE', 'Eco Clutch x31', 'Deagle God'] },
      { name: 'Valorant', hours: 290, color: 'valorant', achievements: ['Platinum 2'] },
  ]},
  { user: 'Pyra', games: [
      { name: 'Valorant', hours: 610, color: 'valorant', achievements: ['Ascendant 1', 'Flash Assist King', 'Initiator MVP'] },
  ]},
  { user: 'DriftKing', games: [
      { name: 'Rocket League', hours: 1100, color: 'rocket', achievements: ['Grand Champion I', 'Air Dribble God', 'RLCS Qualifier'] },
  ]},
  { user: 'Quasar', games: [
      { name: 'Valorant', hours: 900, color: 'valorant', achievements: ['Radiant', 'Top 500', 'MVP x40'] },
  ]},
  { user: 'XenoMark', games: [
      { name: 'CS:GO', hours: 1800, color: 'csgo', achievements: ['Global Elite', 'Majors Qualifier', 'Faceit Level 10'] },
  ]},
  { user: 'StormPeak', games: [
      { name: 'Fortnite', hours: 680, color: 'fortnite', achievements: ['Crown Win x55', 'FNCS Top 10', 'Box Fight Champion'] },
  ]},
  { user: 'CrimsonEdge', games: [
      { name: 'Valorant', hours: 730, color: 'valorant', achievements: ['Radiant', 'Entry King', 'Clutch Factor'] },
  ]},
  { user: 'Nimbus', games: [
      { name: 'Rocket League', hours: 950, color: 'rocket', achievements: ['Grand Champion II', 'Freestyler Pro', 'Community Cup'] },
  ]},
  { user: 'KiraX', games: [
      { name: 'Valorant', hours: 670, color: 'valorant', achievements: ['Immortal 3', 'Clutch x60', 'Map MVP x25'] },
      { name: 'Fortnite', hours: 120, color: 'fortnite', achievements: ['Victory Royale x10'] },
  ]},
  { user: 'ViperAce', games: [{ name: 'Valorant', hours: 820, color: 'valorant', achievements: ['Radiant Sentinel', 'Site Lock Down', 'Flawless Run x5'] }] },
  { user: 'PhantomPulse', games: [{ name: 'Valorant', hours: 910, color: 'valorant', achievements: ['Immortal 3', 'First Blood Master', 'Ace x12'] }] },
  { user: 'SolarFlare', games: [{ name: 'Fortnite', hours: 750, color: 'fortnite', achievements: ['Crown Winner x40', 'Solo Cup Champ'] }] },
  { user: 'LunarBlade', games: [{ name: 'CS:GO', hours: 1600, color: 'csgo', achievements: ['Global Elite', 'HLTV Top 50', 'AWP God'] }] },
  { user: 'AstralKnight', games: [{ name: 'Marvel Rivals', hours: 430, color: 'marvel', achievements: ['Vanguard Master', 'MVP Award x15'] }] },
  { user: 'CyberVex', games: [{ name: 'Valorant', hours: 510, color: 'valorant', achievements: ['Ascendant 3', 'Flash Master'] }] },
  { user: 'HyperDrift', games: [{ name: 'Rocket League', hours: 1200, color: 'rocket', achievements: ['Grand Champion III', 'Ceiling Shot Legend'] }] },
  { user: 'NovaStrike', games: [{ name: 'Fortnite', hours: 890, color: 'fortnite', achievements: ['FNCS Finalist', 'Box Fight Champion'] }] },
  { user: 'Venomous', games: [{ name: 'Valorant', hours: 950, color: 'valorant', achievements: ['Tactical Genius', 'Radiant Challenger'] }] },
  { user: 'ChronoTrigger', games: [{ name: 'CS:GO', hours: 1100, color: 'csgo', achievements: ['Utility Master', 'Faceit Level 10'] }] },
  { user: 'IronClaw', games: [{ name: 'CS:GO', hours: 870, color: 'csgo', achievements: ['Pistol Round King', 'Major Scrim Winner'] }] },
  { user: 'ShadowRift', games: [{ name: 'Valorant', hours: 640, color: 'valorant', achievements: ['Lurk Master', 'Clutch God'] }] },
  { user: 'ThunderBolt', games: [{ name: 'CS:GO', hours: 980, color: 'csgo', achievements: ['Entry Fragger', 'Deagle God'] }] },
  { user: 'FrostWing', games: [{ name: 'Rocket League', hours: 840, color: 'rocket', achievements: ['Freestyle Legend', 'Golden Goal'] }] },
  { user: 'MagmaCore', games: [{ name: 'Fortnite', hours: 1050, color: 'fortnite', achievements: ['FNCS Champion', 'Victory Royale x60'] }] },
  { user: 'ZenithPro', games: [{ name: 'Valorant', hours: 780, color: 'valorant', achievements: ['Radiant Controller', 'Team MVP x20'] }] },
  { user: 'AlphaOmega', games: [{ name: 'Valorant', hours: 1300, color: 'valorant', achievements: ['Team Captain', 'Top 500'] }] },
  { user: 'Spectral', games: [{ name: 'Valorant', hours: 420, color: 'valorant', achievements: ['Diamond III Duelist'] }] },
  { user: 'VelocityX', games: [{ name: 'Rocket League', hours: 760, color: 'rocket', achievements: ['Speed Runner', 'Saves MVP'] }] },
  { user: 'VortexKing', games: [{ name: 'Rocket League', hours: 1150, color: 'rocket', achievements: ['Grand Champion I', 'Air Dribbler'] }] },
  { user: 'BlazeFury', games: [{ name: 'Fortnite', hours: 620, color: 'fortnite', achievements: ['Build Master', 'Top 1% Ranked'] }] },
  { user: 'Krypton99', games: [{ name: 'CS:GO', hours: 1400, color: 'csgo', achievements: ['AWP God', 'Faceit Level 10'] }] },
  { user: 'QuantumDash', games: [{ name: 'Valorant', hours: 590, color: 'valorant', achievements: ['Initiator MVP', 'Flash Assist King'] }] },
  { user: 'MatrixRebel', games: [{ name: 'CS:GO', hours: 930, color: 'csgo', achievements: ['Rifle Master', 'Global Elite'] }] },
  { user: 'PhoenixRise', games: [{ name: 'Valorant', hours: 710, color: 'valorant', achievements: ['Immortal 2', 'Clutch Factor'] }] },
  { user: 'ZeroGravity', games: [{ name: 'Rocket League', hours: 880, color: 'rocket', achievements: ['Aerial Pro', 'Freestyler'] }] },
  { user: 'StormRider', games: [{ name: 'Fortnite', hours: 790, color: 'fortnite', achievements: ['Solo Cup Legend', 'Crown Winner x30'] }] },
  { user: 'ApexPredator', games: [{ name: 'Valorant', hours: 1250, color: 'valorant', achievements: ['Radiant MVP', 'Top 100'] }] },
  { user: 'RogueAgent', games: [{ name: 'CS:GO', hours: 1500, color: 'csgo', achievements: ['Faceit Level 10', 'Major Qualifier'] }] },
  { user: 'Titanium', games: [{ name: 'Valorant', hours: 680, color: 'valorant', achievements: ['Site Lock Down', 'Flawless Run'] }] },
  { user: 'InfernoX', games: [{ name: 'CS:GO', hours: 820, color: 'csgo', achievements: ['Entry Fragger', 'Pistol King'] }] },
  { user: 'CosmicByte', games: [{ name: 'Marvel Rivals', hours: 360, color: 'marvel', achievements: ['Support Specialist', 'MVP Award'] }] },
  { user: 'MirageMaster', games: [{ name: 'Valorant', hours: 770, color: 'valorant', achievements: ['Clutch God', 'Team MVP'] }] },
  { user: 'VanguardX', games: [{ name: 'Marvel Rivals', hours: 490, color: 'marvel', achievements: ['Marvel Rivals Ace', 'Triple Kill'] }] },
  { user: 'Overdrive', games: [{ name: 'Rocket League', hours: 1020, color: 'rocket', achievements: ['Grand Champion II', 'RLCS Qualifier'] }] },
  { user: 'SkyBound', games: [{ name: 'Fortnite', hours: 940, color: 'fortnite', achievements: ['FNCS Solo Champ', 'Box Fight Legend'] }] },
  { user: 'LethalEdge', games: [{ name: 'CS:GO', hours: 1350, color: 'csgo', achievements: ['Global Elite', 'Ace x15'] }] },
  { user: 'Oblivion', games: [{ name: 'Valorant', hours: 830, color: 'valorant', achievements: ['Immortal 1', 'First Blood Master'] }] },
  { user: 'RadiantGhost', games: [{ name: 'Valorant', hours: 1100, color: 'valorant', achievements: ['Radiant IGL', 'Tactical Genius'] }] },
  { user: 'VelocityPrime', games: [{ name: 'Rocket League', hours: 970, color: 'rocket', achievements: ['Rocket League Pro', 'Freestyler Pro'] }] },
  { user: 'HyperNova', games: [{ name: 'Fortnite', hours: 860, color: 'fortnite', achievements: ['Fortnite Builder', 'Victory Royale x45'] }] },
  { user: 'CyberKnight', games: [{ name: 'CS:GO', hours: 1220, color: 'csgo', achievements: ['CS:GO AWPer', 'HLTV Top 50'] }] },
  { user: 'PhantomStrike', games: [{ name: 'Valorant', hours: 740, color: 'valorant', achievements: ['Duelist Main', 'Ace x10'] }] },
  { user: 'ThunderClap', games: [{ name: 'Valorant', hours: 660, color: 'valorant', achievements: ['Initiator Master', 'Flash King'] }] },
  { user: 'ZeroPoint', games: [{ name: 'Fortnite', hours: 910, color: 'fortnite', achievements: ['Victory Cup Winner', 'Crown Winner x25'] }] },
  { user: 'AlphaStorm', games: [{ name: 'Fortnite', hours: 800, color: 'fortnite', achievements: ['Apex Champion', 'FNCS Top 5'] }] },
  { user: 'VectorPrime', games: [{ name: 'CS:GO', hours: 1040, color: 'csgo', achievements: ['Faceit Level 9', 'Utility Master'] }] },
  { user: 'VortexFlare', games: [{ name: 'Rocket League', hours: 1110, color: 'rocket', achievements: ['Freestyle God', 'Air Dribbler'] }] },
  { user: 'ApexMaster', games: [{ name: 'Valorant', hours: 1400, color: 'valorant', achievements: ['Radiant Top 100', 'Clutch God'] }] },
  { user: 'OmegaReaper', games: [{ name: 'CS:GO', hours: 1650, color: 'csgo', achievements: ['Global Elite', 'Major Scrim Winner'] }] },
];

const insertGame = db.prepare(`
  INSERT INTO user_games (user_id, name, hours, color)
  VALUES (?, ?, ?, ?)
`);

const insertAchievement = db.prepare(`
  INSERT INTO achievements (user_game_id, title)
  VALUES (?, ?)
`);

for (const group of gamesData) {
  const userId = userIdMap[group.user];
  if (!userId) continue;
  for (const g of group.games) {
    const info = insertGame.run(userId, g.name, g.hours, g.color);
    const gameId = info.lastInsertRowid;
    if (g.achievements?.length) {
      for (const ach of g.achievements) {
        insertAchievement.run(gameId, ach);
      }
    }
  }
}

// ─── Open Team Listings ───────────────────────────────────────────────────
const teamsData = [
  {
    name: 'Night Shift', game: 'Valorant', tag: 'NS', color: 'valorant',
    region: 'Europe', timezone: 'GMT+1', platform: 'PC', availability: 'Evenings',
    members: '3 / 5', note: 'Looking for a reliable Sentinel with a level head in close games.',
    kd: 1.32, wins: 0, rank: null, earnings: 1200, leader: 'JettStream'
  },
  {
    name: 'Storm Chasers', game: 'Fortnite', tag: 'SC', color: 'fortnite',
    region: 'North America', timezone: 'EST', platform: 'Console', availability: 'Weekends',
    members: '1 / 2', note: 'Zero Build duo for tournament nights and weekly Victory Cups.',
    kd: 0, wins: 42, rank: null, earnings: 0, leader: 'NovaSkye'
  },
  {
    name: 'Five Stack', game: 'CS:GO', tag: 'FS', color: 'csgo',
    region: 'Europe', timezone: 'GMT+2', platform: 'PC', availability: 'Evenings',
    members: '4 / 5', note: 'Need a support player with good utility knowledge and regular availability.',
    kd: 1.45, wins: 0, rank: null, earnings: 2450, leader: 'Sage'
  },
  {
    name: 'Skyline', game: 'Rocket League', tag: 'SL', color: 'rocket',
    region: 'Asia Pacific', timezone: 'IST', platform: 'Cross-platform', availability: 'Flexible',
    members: '1 / 2', note: 'A competitive doubles partner for ranked sessions and community cups.',
    kd: 0, wins: 0, rank: 'champion', earnings: 0, leader: 'Airborne'
  },
  {
    name: 'Crimson Core', game: 'Valorant', tag: 'CC', color: 'valorant',
    region: 'North America', timezone: 'PST', platform: 'PC', availability: 'Late night',
    members: '4 / 5', note: 'Premier squad seeking an Initiator who can play two nights each week.',
    kd: 1.18, wins: 0, rank: null, earnings: 800, leader: 'Luma'
  },
  {
    name: 'High Ground', game: 'Fortnite', tag: 'HG', color: 'fortnite',
    region: 'Europe', timezone: 'GMT', platform: 'PC', availability: 'Evenings',
    members: '3 / 4', note: 'Build mode team for cash cups. Scrims, VOD review, and positive comms.',
    kd: 0, wins: 67, rank: null, earnings: 1680, leader: 'pixelpilot'
  },
  {
    name: 'A Site', game: 'CS:GO', tag: 'AS', color: 'csgo',
    region: 'Asia Pacific', timezone: 'IST', platform: 'PC', availability: 'Weekends',
    members: '2 / 5', note: 'New five-stack forming for ranked, Faceit, and local online events.',
    kd: 1.08, wins: 0, rank: null, earnings: 0, leader: 'KRYPT'
  },
  {
    name: 'Apex Drift', game: 'Rocket League', tag: 'AD', color: 'rocket',
    region: 'North America', timezone: 'CST', platform: 'PC', availability: 'Evenings',
    members: '2 / 3', note: 'GC+ trio looking for a consistent second — mechanics and game sense a must.',
    kd: 0, wins: 0, rank: 'grand-champion', earnings: 3200, leader: 'DriftKing'
  },
  {
    name: 'Radiant Squad', game: 'Valorant', tag: 'RS', color: 'valorant',
    region: 'North America', timezone: 'EST', platform: 'PC', availability: 'Late night',
    members: '2 / 5', note: 'Top-ranked Valorant team looking for Immortal+ players for scrims and ranked grind.',
    kd: 1.6, wins: 0, rank: null, earnings: 4500, leader: 'Quasar'
  },
];

const insertTeam = db.prepare(`
  INSERT INTO teams (name, game, tag, color, region, timezone, platform, availability, members, note, wins, kd, rank, earnings, leader_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMember = db.prepare(`
  INSERT INTO team_members (team_id, user_id, role, online_status)
  VALUES (?, ?, ?, ?)
`);

const teamRosters = [
  {
    teamName: 'High Ground', game: 'Fortnite',
    members: [
      { username: 'pixelpilot', role: 'You · IGL',    online: 'Online now' },
      { username: 'NovaSkye',   role: 'Fragger',       online: '2 hours ago' },
      { username: 'StormPeak',  role: 'Builder',       online: '30 mins ago' },
    ]
  },
  {
    teamName: 'Skyline', game: 'Rocket League',
    members: [
      { username: 'pixelpilot', role: 'You · Striker', online: 'Online now' },
      { username: 'Airborne',   role: 'Goalkeeper',    online: 'Yesterday' },
    ]
  },
  {
    teamName: 'Five Stack', game: 'CS:GO',
    members: [
      { username: 'pixelpilot', role: 'You · AWPer',       online: 'Online now' },
      { username: 'KRYPT',      role: 'Entry Fragger',      online: '35 mins ago' },
      { username: 'Mira',       role: 'Support',            online: '3 hours ago' },
      { username: 'Volt',       role: 'Rifler',             online: 'Yesterday' },
      { username: 'Sage',       role: 'In-game Leader',     online: '2 days ago' },
    ]
  },
  {
    teamName: 'Night Shift', game: 'Valorant',
    members: [
      { username: 'pixelpilot', role: 'You · Controller', online: 'Online now' },
      { username: 'JettStream', role: 'Duelist',          online: '12 mins ago' },
      { username: 'Luma',       role: 'Initiator',        online: '1 hour ago' },
      { username: 'Cipher',     role: 'Sentinel',         online: '5 hours ago' },
      { username: 'Orbit',      role: 'Flex',             online: 'Yesterday' },
    ]
  },
  {
    teamName: 'Apex Drift', game: 'Rocket League',
    members: [
      { username: 'DriftKing', role: 'Team Captain',   online: '1 hour ago' },
      { username: 'Nimbus',    role: 'Freestyler',      online: '3 hours ago' },
    ]
  },
  {
    teamName: 'Radiant Squad', game: 'Valorant',
    members: [
      { username: 'Quasar',      role: 'Captain · Duelist',  online: 'Online now' },
      { username: 'CrimsonEdge', role: 'Entry Fragger',       online: '20 mins ago' },
      { username: 'KiraX',       role: 'Sentinel',            online: '2 hours ago' },
    ]
  },
];

const teamIdMap = {};

for (const t of teamsData) {
  const leaderId = userIdMap[t.leader] || userIdMap['pixelpilot'];
  const info = insertTeam.run(
    t.name, t.game, t.tag, t.color, t.region, t.timezone,
    t.platform, t.availability, t.members, t.note,
    t.wins, t.kd, t.rank, t.earnings, leaderId
  );
  teamIdMap[`${t.game}_${t.name}`] = info.lastInsertRowid;
}

for (const roster of teamRosters) {
  const teamId = teamIdMap[`${roster.game}_${roster.teamName}`];
  if (!teamId) continue;
  for (const m of roster.members) {
    const userId = userIdMap[m.username];
    if (userId) insertMember.run(teamId, userId, m.role, m.online);
  }
}

seedRelationalData(db);

console.log(`✅ Seeded ${usersData.length} users, ${gamesData.length} game groups, ${teamsData.length} teams, ${teamRosters.length} rosters, plus sample messages, applications, events, notifications, and an expired reset token!`);
