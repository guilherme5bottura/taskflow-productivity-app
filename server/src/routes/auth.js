import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb, seedDefaultUserCategories } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const db = await getDb();

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      args: [name.trim(), email.toLowerCase().trim(), passwordHash]
    });

    const userId = Number(result.lastInsertRowid);

    // Seed default categories & tags for the new user
    await seedDefaultUserCategories(userId);

    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), name: name.trim() });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim() }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login' });
  }
});

// Forgot Password / Password Reset Request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Por favor, informe seu e-mail' });
    }

    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT id, name, email FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail' });
    }

    res.json({
      message: 'Instruções de recuperação geradas com sucesso',
      email: user.email,
      userId: user.id
    });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ error: 'Erro ao processar recuperação de senha' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'E-mail e nova senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [passwordHash, user.id]
    });

    res.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT id, name, email, created_at FROM users WHERE id = ?',
      args: [req.user.id]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

export default router;
