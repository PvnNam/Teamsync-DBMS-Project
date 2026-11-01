-- TeamSync Practical Assignment 10 (Oracle 19c+)
-- Run as the project schema owner after creating the TEAMS table. The app in
-- this repository uses SQLite; this file is the Oracle PL/SQL implementation.

-- DBA-only setup (run from an administrative account; choose real passwords):
-- CREATE USER teamsync_app IDENTIFIED BY "<strong-password>";
-- CREATE USER teamsync_developer IDENTIFIED BY "<strong-password>";
-- CREATE USER teamsync_dba IDENTIFIED BY "<strong-password>";
-- CREATE ROLE teamsync_naive;
-- CREATE ROLE teamsync_application_developer;
-- GRANT CREATE SESSION TO teamsync_app;
-- GRANT CREATE SESSION, CREATE TABLE, CREATE PROCEDURE, CREATE TRIGGER TO teamsync_developer;
-- GRANT CREATE SESSION, DBA TO teamsync_dba;
-- GRANT teamsync_naive TO teamsync_app;
-- GRANT teamsync_application_developer TO teamsync_developer;
-- GRANT SELECT ON teams TO teamsync_naive;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO teamsync_application_developer;
-- As the schema owner, grant the application only required table/procedure access:
-- GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO teamsync_app;
-- GRANT EXECUTE ON team_backend TO teamsync_app;

CREATE TABLE application_audit_log (
  audit_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name VARCHAR2(30) NOT NULL,
  operation VARCHAR2(10) NOT NULL,
  row_id NUMBER,
  changed_by VARCHAR2(128) NOT NULL,
  changed_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  old_values CLOB,
  new_values CLOB
);

CREATE OR REPLACE PACKAGE team_backend AS
  PROCEDURE insert_team(p_name VARCHAR2, p_game VARCHAR2, p_tag VARCHAR2,
    p_region VARCHAR2, p_leader_id NUMBER, p_new_id OUT NUMBER);
  PROCEDURE update_team(p_id NUMBER, p_name VARCHAR2, p_region VARCHAR2,
    p_wins NUMBER, p_kd NUMBER);
  PROCEDURE delete_team(p_id NUMBER);
  PROCEDURE register_account(p_username VARCHAR2, p_email VARCHAR2, p_password VARCHAR2, p_new_id OUT NUMBER);
  PROCEDURE update_account(p_id NUMBER, p_username VARCHAR2, p_email VARCHAR2, p_password VARCHAR2);
  PROCEDURE delete_account(p_id NUMBER);
  FUNCTION authenticate_user(p_username VARCHAR2, p_password VARCHAR2) RETURN NUMBER;
  PROCEDURE list_teams(p_rows OUT SYS_REFCURSOR);
  PROCEDURE list_teams_batched(p_batch_size PLS_INTEGER, p_rows OUT SYS_REFCURSOR);
  FUNCTION search_teams(p_page PLS_INTEGER, p_page_size PLS_INTEGER,
    p_game VARCHAR2 DEFAULT NULL, p_region VARCHAR2 DEFAULT NULL) RETURN SYS_REFCURSOR;
  FUNCTION total_wins RETURN NUMBER;
  FUNCTION wins_by_game RETURN SYS_REFCURSOR;
END team_backend;
/

CREATE OR REPLACE PACKAGE BODY team_backend AS
  PROCEDURE insert_team(p_name VARCHAR2, p_game VARCHAR2, p_tag VARCHAR2,
    p_region VARCHAR2, p_leader_id NUMBER, p_new_id OUT NUMBER) IS
  BEGIN
    INSERT INTO teams(name, game, tag, color, region, timezone, platform,
      availability, members, wins, kd, earnings, leader_id)
    VALUES (TRIM(p_name), TRIM(p_game), UPPER(TRIM(p_tag)), 'valorant', TRIM(p_region),
      'UTC', 'Cross-platform', 'Flexible', '1 / 5', 0, 0, 0, p_leader_id)
    RETURNING id INTO p_new_id;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  PROCEDURE update_team(p_id NUMBER, p_name VARCHAR2, p_region VARCHAR2,
    p_wins NUMBER, p_kd NUMBER) IS
  BEGIN
    UPDATE teams SET name=COALESCE(TRIM(p_name), name),
      region=COALESCE(TRIM(p_region), region), wins=COALESCE(p_wins, wins),
      kd=COALESCE(p_kd, kd) WHERE id=p_id;
    IF SQL%ROWCOUNT=0 THEN RAISE_APPLICATION_ERROR(-20004, 'Team not found'); END IF;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  PROCEDURE delete_team(p_id NUMBER) IS
  BEGIN
    DELETE FROM teams WHERE id=p_id;
    IF SQL%ROWCOUNT=0 THEN RAISE_APPLICATION_ERROR(-20004, 'Team not found'); END IF;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  PROCEDURE register_account(p_username VARCHAR2, p_email VARCHAR2, p_password VARCHAR2, p_new_id OUT NUMBER) IS
  BEGIN
    IF TRIM(p_username) IS NULL OR TRIM(p_email) IS NULL OR p_password IS NULL THEN
      RAISE_APPLICATION_ERROR(-20020, 'Username, email, and password are required');
    END IF;
    INSERT INTO users(username, email, password, avatar_text, rank_title)
    VALUES (TRIM(p_username), LOWER(TRIM(p_email)), RAWTOHEX(STANDARD_HASH(p_password, 'SHA256')),
      UPPER(SUBSTR(TRIM(p_username),1,1)), 'Player')
    RETURNING id INTO p_new_id;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  PROCEDURE update_account(p_id NUMBER, p_username VARCHAR2, p_email VARCHAR2, p_password VARCHAR2) IS
  BEGIN
    UPDATE users SET username=COALESCE(TRIM(p_username), username),
      email=COALESCE(LOWER(TRIM(p_email)), email),
      password=COALESCE(RAWTOHEX(STANDARD_HASH(p_password, 'SHA256')), password)
    WHERE id=p_id;
    IF SQL%ROWCOUNT=0 THEN RAISE_APPLICATION_ERROR(-20021, 'Account not found'); END IF;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  PROCEDURE delete_account(p_id NUMBER) IS
  BEGIN
    DELETE FROM users WHERE id=p_id;
    IF SQL%ROWCOUNT=0 THEN RAISE_APPLICATION_ERROR(-20021, 'Account not found'); END IF;
    COMMIT;
  EXCEPTION WHEN OTHERS THEN ROLLBACK; RAISE;
  END;

  FUNCTION authenticate_user(p_username VARCHAR2, p_password VARCHAR2) RETURN NUMBER IS
    v_id NUMBER;
  BEGIN
    SELECT id INTO v_id FROM users WHERE username=TRIM(p_username)
      AND password=RAWTOHEX(STANDARD_HASH(p_password, 'SHA256'));
    RETURN v_id;
  EXCEPTION WHEN NO_DATA_FOUND THEN RETURN 0;
  END;

  -- Explicit cursor without a row limit.
  PROCEDURE list_teams(p_rows OUT SYS_REFCURSOR) IS
    CURSOR c_teams IS SELECT id, name, game, region, wins, kd FROM teams ORDER BY id;
    v_team c_teams%ROWTYPE;
    v_result SYS_REFCURSOR;
  BEGIN
    OPEN c_teams;
    OPEN v_result FOR SELECT id, name, game, region, wins, kd FROM teams ORDER BY id;
    LOOP FETCH c_teams INTO v_team; EXIT WHEN c_teams%NOTFOUND; END LOOP;
    CLOSE c_teams;
    p_rows := v_result;
  END;

  -- Explicit cursor with bounded BULK COLLECT batches.
  PROCEDURE list_teams_batched(p_batch_size PLS_INTEGER, p_rows OUT SYS_REFCURSOR) IS
    CURSOR c_teams IS SELECT id, name, game, region, wins, kd FROM teams ORDER BY id;
    TYPE team_batch IS TABLE OF c_teams%ROWTYPE;
    v_batch team_batch;
    v_result SYS_REFCURSOR;
    v_limit PLS_INTEGER := LEAST(GREATEST(NVL(p_batch_size, 100), 1), 1000);
  BEGIN
    OPEN c_teams;
    LOOP
      FETCH c_teams BULK COLLECT INTO v_batch LIMIT v_limit;
      EXIT WHEN v_batch.COUNT=0;
      NULL; -- Replace with per-batch processing when exporting/transforming rows.
    END LOOP;
    CLOSE c_teams;
    OPEN v_result FOR SELECT id, name, game, region, wins, kd FROM teams ORDER BY id;
    p_rows := v_result;
  END;

  FUNCTION search_teams(p_page PLS_INTEGER, p_page_size PLS_INTEGER,
    p_game VARCHAR2 DEFAULT NULL, p_region VARCHAR2 DEFAULT NULL) RETURN SYS_REFCURSOR IS
    v_rows SYS_REFCURSOR;
    v_page PLS_INTEGER := GREATEST(NVL(p_page, 1), 1);
    v_size PLS_INTEGER := LEAST(GREATEST(NVL(p_page_size, 20), 1), 100);
  BEGIN
    OPEN v_rows FOR
      SELECT id, name, game, region, wins, kd FROM teams
      WHERE (p_game IS NULL OR game=TRIM(p_game))
        AND (p_region IS NULL OR region=TRIM(p_region))
      ORDER BY id OFFSET (v_page-1)*v_size ROWS FETCH NEXT v_size ROWS ONLY;
    RETURN v_rows;
  END;

  FUNCTION total_wins RETURN NUMBER IS v_sum NUMBER;
  BEGIN SELECT NVL(SUM(wins), 0) INTO v_sum FROM teams; RETURN v_sum; END;

  FUNCTION wins_by_game RETURN SYS_REFCURSOR IS v_rows SYS_REFCURSOR;
  BEGIN OPEN v_rows FOR SELECT game, SUM(wins) total_wins FROM teams GROUP BY game ORDER BY game; RETURN v_rows; END;
END team_backend;
/

-- BEFORE row trigger: enforce two data-integrity rules.
CREATE OR REPLACE TRIGGER teams_validate_bir
BEFORE INSERT OR UPDATE ON teams FOR EACH ROW
BEGIN
  IF :NEW.name IS NULL OR LENGTH(TRIM(:NEW.name))=0 OR :NEW.game IS NULL THEN
    RAISE_APPLICATION_ERROR(-20010, 'Team name and game are required');
  END IF;
  IF NVL(:NEW.wins, 0)<0 OR NVL(:NEW.kd, 0)<0 THEN
    RAISE_APPLICATION_ERROR(-20011, 'Wins and K/D must be zero or greater');
  END IF;
END;
/

-- Statement-level trigger: normalize all team tags/names after a write. The
-- package guard prevents its internal UPDATE from recursively re-entering it.
CREATE OR REPLACE PACKAGE team_trigger_guard AS
  normalizing BOOLEAN := FALSE;
END team_trigger_guard;
/

CREATE OR REPLACE TRIGGER teams_uppercase_as
AFTER INSERT OR UPDATE ON teams
BEGIN
  IF NOT team_trigger_guard.normalizing THEN
    team_trigger_guard.normalizing := TRUE;
    BEGIN
      UPDATE teams SET name=UPPER(name), tag=UPPER(tag)
      WHERE name<>UPPER(name) OR tag<>UPPER(tag);
      team_trigger_guard.normalizing := FALSE;
    EXCEPTION WHEN OTHERS THEN
      team_trigger_guard.normalizing := FALSE;
      RAISE;
    END;
  END IF;
END;
/

-- AFTER row trigger audits INSERT, UPDATE, and DELETE with old/new snapshots.
CREATE OR REPLACE TRIGGER teams_audit_aiud
AFTER INSERT OR UPDATE OR DELETE ON teams FOR EACH ROW
BEGIN
  INSERT INTO application_audit_log(table_name, operation, row_id, changed_by, old_values, new_values)
  VALUES ('TEAMS', CASE WHEN INSERTING THEN 'INSERT' WHEN UPDATING THEN 'UPDATE' ELSE 'DELETE' END,
    COALESCE(:NEW.id, :OLD.id), SYS_CONTEXT('USERENV','SESSION_USER'),
    CASE WHEN DELETING OR UPDATING THEN JSON_OBJECT('name' VALUE :OLD.name, 'game' VALUE :OLD.game,
      'region' VALUE :OLD.region, 'wins' VALUE :OLD.wins, 'kd' VALUE :OLD.kd RETURNING CLOB) END,
    CASE WHEN INSERTING OR UPDATING THEN JSON_OBJECT('name' VALUE :NEW.name, 'game' VALUE :NEW.game,
      'region' VALUE :NEW.region, 'wins' VALUE :NEW.wins, 'kd' VALUE :NEW.kd RETURNING CLOB) END);
END;
/

-- Restrict table changes to Monday, 14:00-16:00 (the assignment's example window).
CREATE OR REPLACE TRIGGER teams_work_window_biu
BEFORE INSERT OR UPDATE OR DELETE ON teams
BEGIN
  IF TO_CHAR(SYSDATE, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') <> 'MON'
     OR TO_CHAR(SYSDATE, 'HH24MI') NOT BETWEEN '1400' AND '1600' THEN
    RAISE_APPLICATION_ERROR(-20012, 'Team changes are allowed only Monday from 2:00 PM to 4:00 PM');
  END IF;
END;
/
