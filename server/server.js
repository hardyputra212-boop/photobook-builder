// =============================================
// PhotoBook Builder - Node.js API Server
// =============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// =============================================
// Configuration
// =============================================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Create upload directory if not exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// =============================================
// MySQL Connection Pool
// =============================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'photo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =============================================
// Middleware
// =============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// =============================================
// Helper Functions
// =============================================

// Execute query with error handling
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database error:', error.message);
        throw error;
    }
}

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Admin only middleware
function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// =============================================
// AUTH ROUTES
// =============================================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const users = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register (admin only can create users)
app.post('/api/auth/register', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if email already exists
        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name || '', role || 'customer']
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const users = await query('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// =============================================
// USER ROUTES (Admin Only)
// =============================================

// Get all users
app.get('/api/users', authenticateToken, adminOnly, async (req, res) => {
    try {
        const users = await query(
            'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Update user
app.put('/api/users/:id', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;

        await query(
            'UPDATE users SET name = ?, role = ? WHERE id = ?',
            [name, role, id]
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
app.delete('/api/users/:id', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// =============================================
// HOME CONTENT ROUTES
// =============================================

// Get home content
app.get('/api/home-content', async (req, res) => {
    try {
        const content = await query('SELECT * FROM home_content WHERE id = 1');
        if (content.length === 0) {
            return res.json({
                hero_title: 'Buat Photobook Profesional Tanpa Ribet',
                hero_subtitle: 'Solusi mudah untuk menyusun photobook dengan template menarik.',
                cta_text: 'Mulai Sekarang - Gratis!',
                cta_button_text: 'Buat Photobook',
                features: []
            });
        }

        const data = content[0];
        res.json({
            hero_title: data.hero_title,
            hero_subtitle: data.hero_subtitle,
            cta_text: data.cta_text,
            cta_button_text: data.cta_button_text,
            hero_image: data.hero_image,
            features: typeof data.features === 'string' ? JSON.parse(data.features) : data.features
        });
    } catch (error) {
        console.error('Get home content error:', error);
        res.status(500).json({ error: 'Failed to get home content' });
    }
});

// Update home content
app.put('/api/home-content', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { heroImage, heroTitle, heroSubtitle, ctaText, ctaButtonText, features } = req.body;

        await query(
            `UPDATE home_content SET
                hero_image = COALESCE(?, hero_image),
                hero_title = COALESCE(?, hero_title),
                hero_subtitle = COALESCE(?, hero_subtitle),
                cta_text = COALESCE(?, cta_text),
                cta_button_text = COALESCE(?, cta_button_text),
                features = COALESCE(?, features)
            WHERE id = 1`,
            [
                heroImage || null,
                heroTitle || null,
                heroSubtitle || null,
                ctaText || null,
                ctaButtonText || null,
                features ? JSON.stringify(features) : null
            ]
        );

        res.json({ message: 'Home content updated successfully' });
    } catch (error) {
        console.error('Update home content error:', error);
        res.status(500).json({ error: 'Failed to update home content' });
    }
});

// Upload image
app.post('/api/upload', authenticateToken, adminOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const url = `/uploads/${req.file.filename}`;

        res.json({
            message: 'File uploaded successfully',
            url,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// =============================================
// PROJECT ROUTES
// =============================================

// Get all projects (admin sees all, user sees own)
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'admin') {
            projects = await query(
                `SELECT p.*, u.email as user_email, u.name as user_name
                FROM projects p
                LEFT JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC`
            );
        } else {
            projects = await query(
                'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
                [req.user.id]
            );
        }

        res.json(projects.map(p => ({
            ...p,
            data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data
        })));
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to get projects' });
    }
});

// Get single project
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await query(
            'SELECT * FROM projects WHERE id = ?',
            [id]
        );

        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projects[0];

        // Check ownership
        if (req.user.role !== 'admin' && project.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({
            ...project,
            data: typeof project.data === 'string' ? JSON.parse(project.data) : project.data
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to get project' });
    }
});

// Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, data } = req.body;

        const result = await query(
            'INSERT INTO projects (user_id, name, data) VALUES (?, ?, ?)',
            [req.user.id, name || 'Untitled Project', JSON.stringify(data || {})]
        );

        res.status(201).json({
            message: 'Project created successfully',
            projectId: result.insertId
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, data, status } = req.body;

        // Check ownership
        const projects = await query('SELECT user_id FROM projects WHERE id = ?', [id]);
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (req.user.role !== 'admin' && projects[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await query(
            'UPDATE projects SET name = COALESCE(?, name), data = COALESCE(?, data), status = COALESCE(?, status) WHERE id = ?',
            [name, data ? JSON.stringify(data) : null, status, id]
        );

        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const projects = await query('SELECT user_id FROM projects WHERE id = ?', [id]);
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (req.user.role !== 'admin' && projects[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// =============================================
// STATS ROUTES (Admin Only)
// =============================================

app.get('/api/stats', authenticateToken, adminOnly, async (req, res) => {
    try {
        const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
        const [totalCustomers] = await query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        const [totalProjects] = await query('SELECT COUNT(*) as count FROM projects');
        const [completedProjects] = await query('SELECT COUNT(*) as count FROM projects WHERE status = "completed"');

        res.json({
            totalUsers: totalUsers.count,
            totalCustomers: totalCustomers.count,
            totalProjects: totalProjects.count,
            completedProjects: completedProjects.count
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// =============================================
// Health Check
// =============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
    console.log(`🚀 PhotoBook API running on port ${PORT}`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
});
