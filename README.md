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

## DBMS Practical 10: PL/SQL Backend Logic

The SQLite implementation is part of the running API. Account CRUD is available under `/api/dbms/account`; login uses `/api/auth/login`; account rows carry `naive`, `application_developer`, or `DBA` roles. Teams support create/update/delete APIs, cursor-style reads through `/api/dbms/cursor/teams` (add `?batchSize=100` for bounded batches), paginated search through `/api/dbms/teams/search`, ungrouped sums through `/api/dbms/aggregate`, and grouped sums through `/api/dbms/aggregate/grouped` (or the wins-by-game shortcut).

SQLite triggers enforce team name/game and nonnegative wins/K/D rules, uppercase team names and tags, write an audit record for team insert/update/delete, and reject team changes except Monday 2-4 PM local time. SQLite does not have PL/SQL, explicit SQL cursors, or statement-level triggers; the API implements cursor-style iteration and SQLite uses row triggers for uppercase normalization. The Oracle reference version remains in `server/oracle/assignment10_plsql.sql` if you later need it.

SQLite role values demonstrate the requested account categories, but they are application data rather than database-enforced user privileges. The Monday write trigger deliberately blocks changes to `teams` outside its stated window, so team edits, inserts, deletes, and seed operations must run during that window. No additional database download is required to run this SQLite implementation.

## DBMS Practical 11: SQL Operations Studio

Open **SQL Operations** in the app navigation. The page provides display, insert, aggregate, conditional select, join, subquery/correlated query, update, delete, dashboard, XML output, and index timing controls. The API reports measured execution time in milliseconds for data queries and mutations. Run the index comparison several times and record the observed measurements for your report; this is a small seeded dataset, so SQLite cache and machine load can make one-run timings vary.

Representative SQL used by the operations page:

```sql
-- A1: display all data from a main table
SELECT id, name, game, tag, region, wins, kd FROM teams;

-- A2: insert while honoring NOT NULL and UNIQUE constraints
INSERT INTO users (username, email, password, avatar_text, rank_title)
VALUES (?, ?, ?, ?, ?);

-- A3: aggregate result
SELECT COUNT(id) AS result FROM teams;

-- A4: conditional selection
SELECT id, name, game, region FROM teams WHERE game = ?;

-- A5: join two related tables
SELECT t.name, u.username, tm.role FROM teams t
JOIN team_members tm ON tm.team_id = t.id
JOIN users u ON u.id = tm.user_id;

-- A6: subquery across teams and users
SELECT username FROM users
WHERE id IN (SELECT leader_id FROM teams WHERE game = ?);

-- A7: correlated query across users, team_members, and teams
SELECT u.username FROM users u
WHERE EXISTS (SELECT 1 FROM team_members tm JOIN teams t ON t.id = tm.team_id
              WHERE tm.user_id = u.id AND t.game = ?);

-- A8: update a team row
UPDATE teams SET name = ?, region = ?, wins = ?, kd = ? WHERE id = ?;
```

Indexes are created on `teams(game, region)`, `team_members(team_id, user_id)`, and `user_games(user_id, name)`. The composite teams index page compares the same conditional query before and after index creation. The `team_member_directory` view joins teams, team_members, and users; an `INSTEAD OF INSERT` trigger rejects unknown team/user IDs. `getTeamMemberDirectory()` is the saved JavaScript procedure-style routine for reading that view. SQLite has no stored-procedure feature, so this reusable server routine supplies the equivalent project operation. The page emits XML for A1, A3, and A4.

Foreign-key checks are enabled in the SQLite connection so invalid references are rejected. The insertion form demonstrates the users table's required fields and unique username/email constraints.

### Additional TeamSync tables

The schema also includes `messages` (sender and receiver user foreign keys), `team_applications` (team and applicant foreign keys with a unique team/applicant pair and constrained Pending/Accepted/Rejected status), `team_events` (team foreign key with constrained Scheduled/Completed/Cancelled status), and `notifications` (recipient foreign key, constrained type, and boolean-style `is_read`). These four tables are available in the SQL Operations table selector and their row counts appear in the dashboard. Supporting indexes cover message inbox/outbox ordering, application status by team, upcoming team events, and unread notifications by user.

Sample relational rows are included in the full seed and can be added to an existing database without clearing it by running `cd server && npm run seed:relations`. The sample set includes three messages, three team applications, three events, four notifications, and an expired password-reset example. The additive seeder is idempotent. Password reset tokens expire after one hour.

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
