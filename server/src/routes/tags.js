import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar todas as tags do usuário
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.execute({
      sql: `
        SELECT 
          tg.*,
          COUNT(tt.task_id) as usage_count
        FROM tags tg
        LEFT JOIN task_tags tt ON tt.tag_id = tg.id
        WHERE tg.user_id = ?
        GROUP BY tg.id
        ORDER BY tg.name ASC
      `,
      args: [req.user.id]
    });

    res.json({ tags: [...result.rows] });
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
    const existingResult = await db.execute({
      sql: 'SELECT id FROM tags WHERE user_id = ? AND LOWER(name) = ?',
      args: [req.user.id, name.trim().toLowerCase()]
    });

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Você já possui uma tag com este nome' });
    }

    const result = await db.execute({
      sql: 'INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)',
      args: [req.user.id, name.trim(), color || '#06B6D4']
    });

    const tagId = Number(result.lastInsertRowid);
    const newTagResult = await db.execute({
      sql: 'SELECT * FROM tags WHERE id = ?',
      args: [tagId]
    });

    res.status(201).json({ tag: newTagResult.rows[0] });
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

    const existingResult = await db.execute({
      sql: 'SELECT * FROM tags WHERE id = ? AND user_id = ?',
      args: [id, req.user.id]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }

    await db.execute({
      sql: 'DELETE FROM tags WHERE id = ? AND user_id = ?',
      args: [id, req.user.id]
    });

    res.json({ message: 'Tag removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover tag:', error);
    res.status(500).json({ error: 'Erro ao remover tag' });
  }
});

export default router;
