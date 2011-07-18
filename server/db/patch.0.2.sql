------------------------------
-- Database patch 0.1 -> 0.2
------------------------------

------------------------------
-- Creating sys table
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS system(
	key TEXT,
	value TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS system_id ON system(key ASC);
INSERT OR REPLACE INTO system (key, value) VALUES ('version', '0.2');
COMMIT;

------------------------------
-- Creating root ID column
BEGIN TRANSACTION;
CREATE TEMPORARY TABLE roots_backup(path);
INSERT INTO roots_backup SELECT path from roots;
DROP TABLE roots;
CREATE TABLE IF NOT EXISTS roots (
	rootid INTEGER PRIMARY KEY AUTOINCREMENT,
	path TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS roots_id ON roots(path ASC);
INSERT INTO roots (path) SELECT path from roots_backup;
DROP TABLE roots_backup;
COMMIT;

------------------------------
-- Altering table "media"
BEGIN TRANSACTION;
CREATE TEMPORARY TABLE media_backup(mediaid, path, rating);
INSERT INTO media_backup SELECT mediaid, path, rating FROM media;
DROP TABLE media;
CREATE TABLE media(
	mediaid INTEGER PRIMARY KEY,
	rootid INTEGER,			-- NEW
	path TEXT,					-- MODIFIED
	rating NUMERIC,
	hash TEXT,					-- NEW
	--thumbnail BLOB		-- REMOVED
	FOREIGN KEY(rootid) REFERENCES roots(rootid)
);
CREATE UNIQUE INDEX IF NOT EXISTS media_id ON media(path ASC);
CREATE INDEX IF NOT EXISTS media_rating ON media (rating ASC);
INSERT INTO media (mediaid, rootid, path, rating)
	SELECT mediaid, roots.rootid, substr(media_backup.path, length(roots.path) + 1), rating
	FROM media_backup
	JOIN roots ON media_backup.path LIKE roots.path || '%';
DROP TABLE media_backup;
COMMIT;

