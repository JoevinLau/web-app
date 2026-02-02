-- ==========================================
-- 1. CLEANUP (Optional - Reset the database)
-- ==========================================
DROP TABLE IF EXISTS leaderboards;
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS game_history;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS users;

-- ==========================================
-- 2. USER & ADMIN MANAGEMENT
-- ==========================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, 
    role VARCHAR(20) DEFAULT 'player', -- 'player', 'admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_user_id INT REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL, 
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    setting_key VARCHAR(50) PRIMARY KEY, 
    setting_value TEXT NOT NULL
);

-- ==========================================
-- 3. FINANCIALS (Wallets & Transactions)
-- ==========================================
CREATE TABLE wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'SGD'
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    wallet_id INT REFERENCES wallets(wallet_id),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('deposit', 'withdrawal', 'bet', 'payout')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. GAME LOGIC
-- ==========================================
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), 
    house_edge DECIMAL(5, 2) DEFAULT 2.00
);

-- Stores the actual gameplay data (Cards dealt, steps taken)
CREATE TABLE game_history (
    history_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id),
    user_id INT REFERENCES users(user_id),
    result_data TEXT,
    client_seed VARCHAR(64), 
    server_seed VARCHAR(64), 
    nonce INT,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bets (
    bet_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    game_id INT REFERENCES games(game_id),
    history_id INT REFERENCES game_history(history_id),
    bet_amount DECIMAL(15, 2) NOT NULL,
    payout_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- 'won', 'lost', 'pending'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. ANALYTICS
-- ==========================================
CREATE TABLE leaderboards (
    leaderboard_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(game_id),
    user_id INT REFERENCES users(user_id),
    period VARCHAR(20) DEFAULT 'weekly',
    total_wagered DECIMAL(15, 2) DEFAULT 0.00,
    net_profit DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE(game_id, user_id, period)
);

-- ==========================================
-- 5.5. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_game_id ON bets(game_id);
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_game_id ON game_history(game_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_leaderboards_game_id ON leaderboards(game_id);
CREATE INDEX idx_leaderboards_user_id ON leaderboards(user_id);

-- ==========================================
-- 6. INSERTING YOUR GAMES & DATA
-- ==========================================

-- A. Create Users
INSERT INTO users (username, email, password_hash) VALUES 
('card_shark', 'shark@example.com', 'hash123'),
('bridge_walker', 'squid@example.com', 'hash456');

INSERT INTO wallets (user_id, balance) VALUES (1, 1500.00), (2, 500.00);

-- B. Insert the Specific Games from your Images
INSERT INTO games (game_name, category, house_edge) VALUES 
('Blackjack Pays 3 to 2', 'table_card', 0.50), -- ID 1
('Glass Bridge', 'survival_arcade', 5.00);     -- ID 2

-- C. Simulate Gameplay: Blackjack (User 1 gets a Blackjack)
-- notice the JSON stores card data specifically for Blackjack
INSERT INTO game_history (game_id, user_id, result_data, client_seed, server_seed, nonce) 
VALUES (1, 1, 
  '{"player_hand": ["Ah", "Kd"], "dealer_hand": ["8s", "9h"], "outcome": "blackjack_natural"}', 
  'client_seed_abc', 'server_hash_xyz', 1);

INSERT INTO bets (user_id, game_id, history_id, bet_amount, payout_amount, status)
VALUES (1, 1, 1, 100.00, 250.00, 'won'); -- $100 bet * 1.5 payout + original stake = $250

-- D. Simulate Gameplay: Glass Bridge (User 2 Fails on Step 3)
-- notice the JSON here is totally different, storing "steps" instead of cards
INSERT INTO game_history (game_id, user_id, result_data, client_seed, server_seed, nonce) 
VALUES (2, 2, 
  '{"steps_survived": 2, "failed_at_step": 3, "path_taken": ["left", "right", "left"], "multiplier_reached": 4.0}', 
  'client_seed_def', 'server_hash_123', 5);

INSERT INTO bets (user_id, game_id, history_id, bet_amount, payout_amount, status)
VALUES (2, 2, 2, 10.00, 0.00, 'lost');