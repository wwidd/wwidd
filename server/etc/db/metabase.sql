BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS roots (
	path TEXT
);
CREATE TABLE IF NOT EXISTS media (
	mediaid INTEGER PRIMARY KEY, 
	path TEXT,
	rating NUMERIC,
	thumbnail BLOB
);
CREATE TABLE IF NOT EXISTS keywords (
	mediaid INTEGER,
	key TEXT,
	value TEXT,
	FOREIGN KEY(mediaid) REFERENCES media(mediaid)
);
CREATE TABLE IF NOT EXISTS tags (
	mediaid INTEGER,
	tag TEXT,
	kind TEXT,
	FOREIGN KEY(mediaid) REFERENCES media(mediaid)
);
CREATE UNIQUE INDEX IF NOT EXISTS roots_id ON roots(path ASC);
CREATE UNIQUE INDEX IF NOT EXISTS media_id ON media(path ASC);
CREATE INDEX IF NOT EXISTS media_rating ON media (rating ASC);
CREATE UNIQUE INDEX IF NOT EXISTS keywords_id ON keywords (mediaid ASC, key ASC);
CREATE INDEX IF NOT EXISTS keywords_search ON keywords (key ASC, value ASC);
CREATE UNIQUE INDEX IF NOT EXISTS tags_id ON tags (mediaid ASC, tag ASC);
CREATE INDEX IF NOT EXISTS tags_search ON tags (tag ASC);
COMMIT;

