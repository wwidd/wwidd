------------------------------
-- Ctreates sqlite database (0.2)
------------------------------

BEGIN TRANSACTION;

------------------------------
-- System
CREATE TABLE IF NOT EXISTS system(
	key TEXT,
	value TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS system_id ON system(key ASC);
INSERT OR REPLACE INTO system (key, value) VALUES ('version', '0.2');

------------------------------
-- Roots
CREATE TABLE IF NOT EXISTS roots (
	rootid INTEGER PRIMARY KEY AUTOINCREMENT,
	path TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS roots_id ON roots(path ASC);

------------------------------
-- Media
CREATE TABLE IF NOT EXISTS media(
	mediaid INTEGER PRIMARY KEY,
	rootid INTEGER,
	path TEXT,
	rating NUMERIC,
	hash TEXT,
	FOREIGN KEY(rootid) REFERENCES roots(rootid)
);
CREATE UNIQUE INDEX IF NOT EXISTS media_id ON media(path ASC);
CREATE INDEX IF NOT EXISTS media_rating ON media(rating ASC);

------------------------------
-- Keywords
CREATE TABLE IF NOT EXISTS keywords (
	mediaid INTEGER,
	key TEXT,
	value TEXT,
	FOREIGN KEY(mediaid) REFERENCES media(mediaid)
);
CREATE UNIQUE INDEX IF NOT EXISTS keywords_id ON keywords(mediaid ASC, key ASC);
CREATE INDEX IF NOT EXISTS keywords_search ON keywords(key ASC, value ASC);

------------------------------
-- Tags
CREATE TABLE IF NOT EXISTS tags (
	mediaid INTEGER,
	name TEXT,
	kind TEXT,
	FOREIGN KEY(mediaid) REFERENCES media(mediaid)
);
CREATE UNIQUE INDEX IF NOT EXISTS tags_id ON tags(mediaid ASC, name ASC);
CREATE INDEX IF NOT EXISTS tags_search ON tags(name ASC);
CREATE INDEX IF NOT EXISTS tags_filter ON tags(kind ASC);

COMMIT;

