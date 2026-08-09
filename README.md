# ✦ TeamSync (WebWonders 2026)

> **The ultimate platform for competitive gamers to find squads, build rosters, track achievements, and sync play schedules.**

---

##  Overview

**TeamSync** is a modern, high-performance web application designed for gamers across competitive titles including **Valorant**, **Fortnite**, **CS:GO**, **Rocket League**, and **Marvel Rivals**. Powered by a React + Vite frontend and an Express + native SQLite backend, TeamSync delivers a glassmorphic dark-mode interface with live database synchronization.

---

##  Features & Walkthrough

### 1.  Dynamic Gamer Profile & Auto-Loading
- **Dynamic Gamer Tag**: The main header dynamically reflects your `@username`.
- **Auto-Loading Seeded Profiles**: Type any seeded username (e.g. `NovaSkye`, `DriftKing`, `Quasar`, `Airborne`, `KRYPT`) into the Gamer Tag field or hit **Confirm Username** — the app queries the SQLite database and automatically populates that player's active games, hours played, and achievements in real time!
- **Confirm Username Button**: Lock in your gamer tag with instant status feedback (`✓ Confirmed`).

### 2.  Sleek Dark Design & Black Dropdowns
- **Glassmorphism Aesthetic**: Rich dark theme with HSL glowing gradients, subtle micro-animations, radial ambient glows, and blurred glass panels.
- **Custom Black Dropdowns**: Globally styled `<select>` menus with dark backgrounds, contrast option styling, and purple focus rings.

### 3.  Authentication, Sign Up & Credential Verification
- **User Registration (`/signup`)**: Two-column sign-up form capturing username, email, password, region, platform, availability, and player role.
- **Demo Login (`/`)**: Quick login with demo credentials or newly registered accounts.
- **Password Reset (`/forgot-password`)**: Token-based password recovery workflow.
- **Credential Verification**: Re-enter password in the Security section of your profile to verify your identity before updating sensitive settings.

### 4.  Game-Specific Achievements
- **Tailored Achievements**: When managing games on your profile, dropdown selectors present game-specific milestones:
  - **Valorant**: *Radiant Challenger, Immortal 3, Ascendant 2, Clutch God, Team MVP, Flawless Run, Ace x9, Site Lock Down*
  - **Fortnite**: *Victory Royale x28, Crown Winner x16, FNCS Qualifier, Solo Cup Champ, Top 1% Ranked, Box Fight Champion*
  - **CS:GO**: *Global Elite, Faceit Level 10, Major Scrim Winner, Pistol Round King, Utility Master, Deagle God*
  - **Rocket League**: *Grand Champion II, Ceiling Shot Legend, Air Dribbler, Golden Goal, Saves MVP, Freestyler Pro*
  - **Marvel Rivals**: *Vanguard Master, Triple Kill, MVP Award, Lord of Rivals, Grandmaster*
- **Custom Achievements**: Option to type and attach custom achievement titles (`+ Custom title…`).

### 5.  Custom Squad Creation & Independent Leaving
- **Create Custom Squads**: On the **My Teams** page, click **`+ Create New Squad`** to create new rosters with custom squad names, tags (e.g. *PHX*, *NS*), games, and mottos.
- **Multi-Squad Support**: You can create **multiple squads for the exact same game** (e.g. 3 different Valorant rosters).
- **Independent Squad Leaving**: Every squad has its own unique ID. Clicking **"Leave Squad"** on a team removes **only that specific squad**, leaving your other squads for that game intact.

### 6.  Team Finder & Squad Join Requests
- **Filterable Listings**: Search open squad listings by game, minimum K/D or wins, region/timezone, platform, and play availability.
- **Request to Join**: Each team card features a **"Request to Join"** button alongside "View team →". Clicking it updates state to **`✓ Request Sent`**.

### 7.  Admin-Only Seed Viewer (96 Accounts)
- **Restricted Access**: The **Seed Viewer** link is hidden from regular users and accessible **only when logged in as `username: admin`**. Direct URL access (`/dev/seed-viewer`) is guarded by an `AdminRoute`.
- **Database Directory**: Features a live directory of all **96 seeded fake accounts** with their passwords, email, rank titles, active games, hours, and achievements. Includes a **real-time search filter bar**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite, Vanilla CSS (Variables & Glassmorphism) |
| **Backend** | Node.js, Express.js, CORS |
| **Database** | Node.js Native SQLite (`node:sqlite` DatabaseSync) |

---

##  Installation & Setup

### Prerequisites
- **Node.js**: v22.x or higher (for native `node:sqlite` support)
- **npm** or **pnpm**

### Step 1: Install Dependencies

**Server**:
```bash
cd server
npm install
```

**Client**:
```bash
cd ../client
npm install
```

---

### Step 2: Seed the Database

Run the database seeder to create tables and populate **96 fake accounts**, rosters, and open team listings:

```bash
cd server
npm run seed
```

Output:
```
 Seeding TeamSync SQLite Database...
 Seeded 96 users, 73 game groups, 9 teams, 6 rosters!
```

---

### Step 3: Run the Application

Start both the backend server and frontend development server simultaneously:

**Terminal 1 (Backend API Server - Port 5000)**:
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client - Port 5173)**:
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

##  Step-by-Step Testing & Walkthrough Guide

Follow these steps to experience all features:

### 1. Test Authentication & Sign Up
1. Open `http://localhost:5173`.
2. Click **"Sign up →"** below the login box.
3. Fill out the registration form (e.g. Username: `ProPlayer99`, Email: `pro@teamsync.gg`, Password: `password123`, Region: `North America`, Role: `Diamond Player`).
4. Click **Create Account** — you will be automatically logged in and redirected to your Profile!

### 2. Test Auto-Loading Seeded Accounts
1. Go to **My Profile**.
2. Clear the Gamer Tag field `@` and type a seeded username:
   - Try typing `NovaSkye` ➜ Automatically loads Fortnite & Valorant games + achievements!
   - Try typing `DriftKing` ➜ Automatically loads Rocket League Grand Champion profile!
   - Try typing `Quasar` ➜ Automatically loads Radiant Valorant profile!
3. Click **Confirm Username** (`✓ Confirmed`).

### 3. Test Game-Specific Achievements & Preferences
1. On the Profile page, choose a game from the picker (e.g. *Valorant*) and click **+ Add**.
2. Open the achievement dropdown inside the Valorant card — select a game-specific milestone like *Radiant Challenger* or *Clutch God* and click **+ Add**.
3. Set your Region (*North America*), Platform (*PC*), and Availability (*Evenings*), then click **Confirm Preferences**.
4. Click **Save profile** to persist your changes to the SQLite database.

### 4. Test Credential Verification
1. On the Profile page, scroll to **Security**.
2. Click ** Verify Identity**.
3. Type your password (`password123` or `admin`) and click **Verify Now** ➜ Displays `✓ Credentials verified successfully!`.

### 5. Test Creating & Leaving Custom Squads
1. Click **My Teams** in the side navigation.
2. Click **`+ Create New Squad`**.
3. Fill in:
   - Squad Name: `Alpha Roster`
   - Game: `Valorant`
   - Tag: `ALP`
   - Motto: `Competitive duo for cash cups.`
4. Click **Create Squad →** ➜ The new squad appears instantly! Create a second Valorant squad (e.g. `Omega Roster`).
5. Click **Leave Squad** on `Alpha Roster` and confirm `Yes, leave` ➜ `Alpha Roster` is removed while `Omega Roster` remains active!

### 6. Test Team Finder & Request to Join
1. Click **Find a Squad** (`/requirements`) in the side navigation.
2. Filter by game (*Valorant*, *Fortnite*, *CS:GO*, *Rocket League*) or region.
3. On any team card, click **Request to Join** ➜ The button updates to **`✓ Request Sent`**.

### 7. Test Admin-Only Seed Viewer (96 Accounts)
1. Sign out and log in as `admin` / `admin`.
2. Notice the **Developer ➜ Seed Viewer** menu item now appears in the side navigation!
3. Click **Seed Viewer** (`/dev/seed-viewer`).
4. Type into the live search bar (e.g. search `Radiant`, `Grand Champion`, `Global Elite`, or `NovaSkye`) to search all 96 seeded accounts, passwords, ranks, active games, and achievements.
5. Try logging out and accessing `/dev/seed-viewer` as a normal user or directly via URL ➜ Protected by `AdminRoute` and redirects to `/profile`.

---

##  Demo & Test Account Directory

Below is a quick reference table of featured seeded accounts for testing:

| Username | Password | Role / Title | Seeded Games |
|---|---|---|---|
| `admin` | `admin` | System Administrator | *Dev Admin (Access to Seed Viewer)* |
| `pixelpilot` | `password123` | Pro Player & Team Captain | Valorant, Fortnite, CS:GO, Rocket League |
| `NovaSkye` | `password123` | Fragger Specialist | Fortnite, Valorant |
| `Airborne` | `password123` | Aerial Defender | Rocket League |
| `KRYPT` | `password123` | Entry Fragger | CS:GO |
| `JettStream` | `password123` | Duelist Main | Valorant |
| `DriftKing` | `drift!king3` | Grand Champion I | Rocket League |
| `Quasar` | `quas4r99` | Radiant Ranked | Valorant |
| `StormPeak` | `stormP@22` | Fortnite Champion | Fortnite |
| `ViperAce` | `pass101` | Radiant Sentinel | Valorant |
| `LunarBlade` | `lunar404` | Global Elite AWPer | CS:GO |
| `HyperDrift` | `hyper707` | Grand Champion III | Rocket League |
| `AstralKnight` | `astral505` | Overwatch Tank | Marvel Rivals |

---

##  License

This project is created for **TeamSync (WebWonders 2026)**.
