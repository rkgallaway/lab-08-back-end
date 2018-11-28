DROP TABLE locations, weathers;

CREATE TABLE IF NOT EXISTS locations ( 
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(8, 6),
    longitude NUMERIC(9, 6)
  );

CREATE TABLE IF NOT EXISTS weathers ( 
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(255), 
    time VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS yelps (
      id SERIAL PRIMARY KEY,
      url VARCHAR(255),
      name VARCHAR(255),
      rating VARCHAR(255),
      price VARCHAR(255),
      image_url VARCHAR(255),
      created_at BIGINT,
      location_id INTEGER NOT NULL REFERENCES locations(id)
  );