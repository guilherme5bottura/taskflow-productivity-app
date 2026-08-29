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
    const result = await db.execute({
      sql: `
        SELECT 
          c.*, 
          COUNT(CASE WHEN t.status != 'concluida' THEN 1 END) as active_tasks_count,
          COUNT(t.id) as total_tasks_count
        FROM categories c
        LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = c.user_id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.name ASC
      `,
      args: [req.user.id]
    });

    res.json({ categories: [...result.rows] });
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
    const result = await db.execute({
      sql: 'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
      args: [req.user.id, name.trim(), color || '#4F46E5', icon || 'folder']
    });

    const categoryId = Number(result.lastInsertRowid);
    const newCategoryResult = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [categoryId]
    });

    res.status(201).json({ category: newCategoryResult.rows[0] });
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
    const existingResult = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      args: [id, req.user.id]
    });

    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.execute({
      sql: 'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
      args: [name?.trim() || existing.name, color || existing.color, icon || existing.icon, id, req.user.id]
    });

    const updatedResult = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [id]
    });

    res.json({ category: updatedResult.rows[0] });
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

    const existingResult = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      args: [id, req.user.id]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.execute({
      sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?',
      args: [id, req.user.id]
    });

    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ error: 'Erro ao remover categoria' });
  }
});

export default router;
