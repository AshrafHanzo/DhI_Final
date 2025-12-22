-- Create sourced_from master table
CREATE TABLE IF NOT EXISTS sourced_from_master (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default sourced from options
INSERT INTO sourced_from_master (source_name, display_order) VALUES
    ('LinkedIn', 1),
    ('Job hai', 2),
    ('Apna', 3),
    ('Meta', 4),
    ('EarlyJobs', 5),
    ('Others', 6)
ON CONFLICT (source_name) DO NOTHING;
