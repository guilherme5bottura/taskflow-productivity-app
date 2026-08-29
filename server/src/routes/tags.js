import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar todas as tags do usuário
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const tags = await db.all(`
      SELECT 
        tg.*,
        COUNT(tt.task_id) as usage_count
      FROM tags tg
      LEFT JOIN task_tags tt ON tt.tag_id = tg.id
      WHERE tg.user_id = ?
      GROUP BY tg.id
      ORDER BY tg.name ASC
    `, [req.user.id]);

    res.json({ tags });
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json({ error: 'Erro ao buscar tags' });
  }
});

// Criar nova tag
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da tag é obrigatório' });
    }

    const db = await getDb();

    // Check if tag name already exists for this user
    const existing = await db.get(
      'SELECT id FROM tags WHERE user_id = ? AND LOWER(name) = ?',
      [req.user.id, name.trim().toLowerCase()]
    );

    if (existing) {
      return res.status(400).json({ error: 'Você já possui uma tag com este nome' });
    }

    const result = await db.run(
      'INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)',
      [req.user.id, name.trim(), color || '#06B6D4']
    );

    const newTag = await db.get('SELECT * FROM tags WHERE id = ?', [result.lastID]);
    res.status(201).json({ tag: newTag });
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
});

// Deletar tag
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }

    await db.run('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Tag removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover tag:', error);
    res.status(500).json({ error: 'Erro ao remover tag' });
  }
});

export default router;
