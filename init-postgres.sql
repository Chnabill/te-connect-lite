-- PostgreSQL initialization script for TE Connect Lite
-- This script runs when the PostgreSQL container starts for the first time

\echo 'Creating TE Connect Lite database schema and initial data...'

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date DATE,
    assigned_by VARCHAR(100),
    user_id INTEGER,
    user_name VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    department VARCHAR(100),
    tags TEXT[] DEFAULT '{}'
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    date DATE DEFAULT CURRENT_DATE,
    comments TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    performance_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    module VARCHAR(100),
    user_id VARCHAR(100)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial users
INSERT INTO users (email, username, password_hash, role, first_name, last_name) VALUES
('admin@teconnect.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgqSy', 'admin', 'Admin', 'User'),
('user@teconnect.com', 'user', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgqSy', 'employee', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert initial employees
INSERT INTO employees (name, email, position, department, hire_date, salary) VALUES
('John Doe', 'john.doe@teconnect.com', 'Software Engineer', 'Engineering', '2023-01-15', 75000),
('Jane Smith', 'jane.smith@teconnect.com', 'Product Manager', 'Product', '2023-02-01', 85000),
('Mike Johnson', 'mike.johnson@teconnect.com', 'UX Designer', 'Design', '2023-03-10', 70000),
('Sarah Wilson', 'sarah.wilson@teconnect.com', 'Marketing Manager', 'Marketing', '2023-04-05', 72000),
('David Brown', 'david.brown@teconnect.com', 'HR Manager', 'HR', '2023-05-20', 68000),
('Lisa Davis', 'lisa.davis@teconnect.com', 'Sales Manager', 'Sales', '2023-06-15', 78000),
('Tom Anderson', 'tom.anderson@teconnect.com', 'Data Analyst', 'Analytics', '2023-07-01', 65000),
('Emily Taylor', 'emily.taylor@teconnect.com', 'Finance Manager', 'Finance', '2023-08-10', 80000),
('Chris Martinez', 'chris.martinez@teconnect.com', 'Support Specialist', 'Support', '2023-09-05', 55000),
('Anna Garcia', 'anna.garcia@teconnect.com', 'Senior Developer', 'Engineering', '2023-10-12', 82000),
('Robert Lee', 'robert.lee@teconnect.com', 'QA Engineer', 'Engineering', '2023-11-01', 62000),
('Jessica White', 'jessica.white@teconnect.com', 'Content Manager', 'Marketing', '2023-12-01', 58000)
ON CONFLICT (email) DO NOTHING;

-- Insert initial tasks
INSERT INTO tasks (title, description, status, priority, due_date, assigned_by, user_id, user_name, progress, estimated_hours, actual_hours, department, tags) VALUES
('Implement User Authentication', 'Add JWT-based authentication to the application', 'in-progress', 'high', '2024-01-30', 'admin', 1, 'John Doe', 75, 20, 15, 'Engineering', ARRAY['authentication', 'security', 'backend']),
('Design Dashboard UI', 'Create mockups and designs for the admin dashboard', 'completed', 'medium', '2024-01-15', 'admin', 3, 'Mike Johnson', 100, 16, 18, 'Design', ARRAY['ui', 'design', 'dashboard']),
('Database Migration', 'Migrate from SQLite to PostgreSQL', 'pending', 'high', '2024-02-15', 'admin', 1, 'John Doe', 0, 24, 0, 'Engineering', ARRAY['database', 'migration', 'backend']),
('Marketing Campaign', 'Launch Q1 marketing campaign', 'in-progress', 'medium', '2024-02-28', 'admin', 4, 'Sarah Wilson', 45, 40, 18, 'Marketing', ARRAY['campaign', 'marketing', 'social']),
('Performance Testing', 'Conduct load testing on the application', 'pending', 'low', '2024-03-01', 'admin', 11, 'Robert Lee', 0, 16, 0, 'Engineering', ARRAY['testing', 'performance', 'qa']),
('Employee Onboarding', 'Update onboarding process documentation', 'in-progress', 'medium', '2024-02-10', 'admin', 5, 'David Brown', 60, 12, 7, 'HR', ARRAY['onboarding', 'documentation', 'hr']),
('Sales Report Analysis', 'Analyze Q4 sales performance', 'completed', 'high', '2024-01-20', 'admin', 6, 'Lisa Davis', 100, 8, 8, 'Sales', ARRAY['analysis', 'sales', 'report']),
('Customer Support System', 'Implement new ticketing system', 'pending', 'urgent', '2024-01-25', 'admin', 9, 'Chris Martinez', 0, 32, 0, 'Support', ARRAY['support', 'ticketing', 'system'])
ON CONFLICT DO NOTHING;

-- Insert initial evaluations
INSERT INTO evaluations (employee_name, position, department, score, date, comments, status, performance_level) VALUES
('John Doe', 'Software Engineer', 'Engineering', 92, '2024-01-15', 'Excellent technical skills and team collaboration', 'completed', 'Excellent'),
('Jane Smith', 'Product Manager', 'Product', 88, '2024-01-16', 'Strong leadership and strategic thinking', 'completed', 'Good'),
('Mike Johnson', 'UX Designer', 'Design', 85, '2024-01-17', 'Creative designs and user-focused approach', 'completed', 'Good'),
('Sarah Wilson', 'Marketing Manager', 'Marketing', 90, '2024-01-18', 'Outstanding campaign results and team management', 'completed', 'Excellent'),
('David Brown', 'HR Manager', 'HR', 87, '2024-01-19', 'Effective HR policies and employee relations', 'completed', 'Good'),
('Lisa Davis', 'Sales Manager', 'Sales', 95, '2024-01-20', 'Exceeded sales targets and built strong client relationships', 'completed', 'Excellent'),
('Tom Anderson', 'Data Analyst', 'Analytics', 83, '2024-01-21', 'Accurate analysis and insightful reports', 'completed', 'Good'),
('Emily Taylor', 'Finance Manager', 'Finance', 89, '2024-01-22', 'Strong financial planning and budget management', 'completed', 'Good'),
('Chris Martinez', 'Support Specialist', 'Support', 78, '2024-01-23', 'Good customer service skills, room for improvement in response time', 'in-review', 'Average'),
('Anna Garcia', 'Senior Developer', 'Engineering', 94, '2024-01-24', 'Outstanding code quality and mentoring abilities', 'completed', 'Excellent'),
('Robert Lee', 'QA Engineer', 'Engineering', 81, '2024-01-25', 'Thorough testing approach and attention to detail', 'pending', 'Good'),
('Jessica White', 'Content Manager', 'Marketing', 72, '2024-01-26', 'Creative content but needs improvement in consistency', 'draft', 'Average')
ON CONFLICT DO NOTHING;

-- Insert initial system logs
INSERT INTO system_logs (level, message, module, user_id) VALUES
('INFO', 'Application started successfully', 'main', NULL),
('INFO', 'Database connection established', 'database', NULL),
('INFO', 'User admin logged in', 'auth', 'admin'),
('INFO', 'User user logged in', 'auth', 'user'),
('WARNING', 'Failed login attempt for unknown user', 'auth', NULL),
('INFO', 'Task "Implement User Authentication" created', 'tasks', 'admin'),
('INFO', 'Employee evaluation completed for John Doe', 'evaluations', 'admin'),
('ERROR', 'Database connection timeout', 'database', NULL),
('INFO', 'System backup completed successfully', 'backup', 'system'),
('INFO', 'User admin logged out', 'auth', 'admin')
ON CONFLICT DO NOTHING;

-- Insert initial settings
INSERT INTO settings (key, value, description) VALUES
('Theme', 'light', 'Application theme setting'),
('Language', 'en', 'Application language setting'),
('Notifications', 'enabled', 'Email notifications setting'),
('Backup_Frequency', 'daily', 'Database backup frequency'),
('Session_Timeout', '30', 'Session timeout in minutes'),
('Max_File_Size', '10MB', 'Maximum file upload size'),
('Company_Name', 'TE Connect Lite', 'Company name for branding'),
('Support_Email', 'support@teconnect.com', 'Support contact email')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_employee_name ON evaluations(employee_name);
CREATE INDEX IF NOT EXISTS idx_evaluations_department ON evaluations(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

\echo 'TE Connect Lite database initialization completed!'
\echo 'Created tables: users, employees, tasks, evaluations, system_logs, settings'
\echo 'Default admin user: admin@teconnect.com / admin123'
\echo 'Default test user: user@teconnect.com / user123'
\echo 'Database contains sample data for testing'
