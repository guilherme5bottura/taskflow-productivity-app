import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de categorias exigem autenticação
router.use(authenticateToken);

// Listar categorias do usuário com contagem de tarefas ativas
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all(`
      SELECT 
        c.*, 
        COUNT(CASE WHEN t.status != 'concluida' THEN 1 END) as active_tasks_count,
        COUNT(t.id) as total_tasks_count
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = c.user_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name ASC
    `, [req.user.id]);

    res.json({ categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
      [req.user.id, name.trim(), color || '#4F46E5', icon || 'folder']
    );

    const newCategory = await db.get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.run(
      'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
      [name?.trim() || existing.name, color || existing.color, icon || existing.icon, id, req.user.id]
    );

    const updated = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category: updated });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Set tasks category_id to null before deleting (handled by ON DELETE SET NULL, but we can also be explicit)
    await db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ error: 'Erro ao remover categoria' });
  }
});

export default router;
