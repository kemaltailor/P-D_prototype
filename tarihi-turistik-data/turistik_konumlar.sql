CREATE TABLE turistik_konumlar (
    id SERIAL PRIMARY KEY,
    tur TEXT NOT NULL,
    isim TEXT NOT NULL,
    icerik TEXT,
    resim TEXT,
    geometry geometry(Point, 4326) NOT NULL
);

CREATE INDEX turistik_konumlar_geom_idx ON turistik_konumlar USING GIST (geometry); 