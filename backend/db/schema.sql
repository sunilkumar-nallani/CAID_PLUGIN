-- A table to store unique images identified by their perceptual hash
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    phash TEXT UNIQUE NOT NULL, -- The unique fingerprint of the image
    real_counter INT DEFAULT 0,
    deepfake_counter INT DEFAULT 0,
    final_verdict TEXT DEFAULT 'pending', -- Can be 'pending', 'real', or 'synthetic'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A table to store individual votes from users
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    image_id INT REFERENCES images(id) NOT NULL, -- Links this vote to an image
    user_id INT NOT NULL, -- In the future, this will link to a users table
    verdict TEXT NOT NULL, -- 'real' or 'synthetic'
    voted_at TIMESTAMPTZ DEFAULT NOW()
);