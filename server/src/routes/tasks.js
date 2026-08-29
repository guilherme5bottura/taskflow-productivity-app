import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar todas as tarefas com filtros e tags
router.get('/', async (req, res) => {
  try {
    const { category_id, tag_id, priority, status, search, filter } = req.query;
    const db = await getDb();

    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
    `;

    const params = [req.user.id];

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filtros rápidos de data
    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (filter === 'overdue') {
      // Atrasadas (status != 'concluida' e due_date < now)
      query += ` AND t.status != 'concluida' AND t.due_date IS NOT NULL AND datetime(t.due_date) < datetime('now', 'localtime')`;
    } else if (filter === 'today') {
      // Vencendo hoje
      query += ` AND t.due_date IS NOT NULL AND date(t.due_date) = date('now', 'localtime')`;
    } else if (filter === 'completed_today') {
      // Concluídas hoje
      query += ` AND t.status = 'concluida' AND t.completed_at IS NOT NULL AND date(t.completed_at) = date('now', 'localtime')`;
    }

    if (tag_id) {
      query += ` AND t.id IN (SELECT task_id FROM task_tags WHERE tag_id = ?)`;
      params.push(tag_id);
    }

    query += ` ORDER BY 
      CASE WHEN t.status = 'concluida' THEN 1 ELSE 0 END ASC,
      CASE WHEN t.priority = 'urgente' THEN 1 WHEN t.priority = 'media' THEN 2 ELSE 3 END ASC,
      CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END ASC,
      t.due_date ASC,
      t.created_at DESC
    `;

    const tasks = await db.all(query, params);

    // Buscar tags de cada tarefa
    const taskIds = tasks.map(t => t.id);
    let tagsByTask = {};

    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      const tagsRows = await db.all(`
        SELECT tt.task_id, tg.id, tg.name, tg.color
        FROM task_tags tt
        JOIN tags tg ON tg.id = tt.tag_id
        WHERE tt.task_id IN (${placeholders})
      `, taskIds);

      tagsRows.forEach(row => {
        if (!tagsByTask[row.task_id]) tagsByTask[row.task_id] = [];
        tagsByTask[row.task_id].push({ id: row.id, name: row.name, color: row.color });
      });
    }

    const tasksWithTags = tasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || []
    }));

    res.json({ tasks: tasksWithTags });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ error: 'Erro ao listar tarefas' });
  }
});

// Criar nova tarefa
router.post('/', async (req, res) => {
  try {
    const { title, description, category_id, due_date, priority, status, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'O título da tarefa é obrigatório' });
    }

    const db = await getDb();
    const taskPriority = ['baixa', 'media', 'urgente'].includes(priority) ? priority : 'media';
    const taskStatus = ['pendente', 'em_andamento', 'concluida'].includes(status) ? status : 'pendente';
    const completedAt = taskStatus === 'concluida' ? new Date().toISOString() : null;

    const result = await db.run(`
      INSERT INTO tasks (user_id, category_id, title, description, due_date, priority, status, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      category_id || null,
      title.trim(),
      description ? description.trim() : null,
      due_date || null,
      taskPriority,
      taskStatus,
      completedAt
    ]);

    const taskId = result.lastID;

    // Inserir tags associadas
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await db.run('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
      }
    }

    // Buscar tarefa recém-criada com detalhes
    const newTask = await db.get(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.id = ?
    `, [taskId]);

    const taskTags = await db.all(`
      SELECT tg.id, tg.name, tg.color
      FROM task_tags tt
      JOIN tags tg ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `, [taskId]);

    res.status(201).json({
      task: {
        ...newTask,
        tags: taskTags
      }
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// Atualizar tarefa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, due_date, priority, status, tags } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const taskTitle = title !== undefined ? title.trim() : existing.title;
    const taskDesc = description !== undefined ? description?.trim() : existing.description;
    const taskCat = category_id !== undefined ? category_id : existing.category_id;
    const taskDue = due_date !== undefined ? due_date : existing.due_date;
    const taskPriority = priority && ['baixa', 'media', 'urgente'].includes(priority) ? priority : existing.priority;
    const taskStatus = status && ['pendente', 'em_andamento', 'concluida'].includes(status) ? status : existing.status;
    
    let completedAt = existing.completed_at;
    if (taskStatus === 'concluida' && existing.status !== 'concluida') {
      completedAt = new Date().toISOString();
    } else if (taskStatus !== 'concluida') {
      completedAt = null;
    }

    await db.run(`
      UPDATE tasks 
      SET category_id = ?, title = ?, description = ?, due_date = ?, priority = ?, status = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [taskCat, taskTitle, taskDesc, taskDue, taskPriority, taskStatus, completedAt, id, req.user.id]);

    // Atualizar tags se enviadas
    if (Array.isArray(tags)) {
      await db.run('DELETE FROM task_tags WHERE task_id = ?', [id]);
      for (const tagId of tags) {
        await db.run('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    const updatedTask = await db.get(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.id = ?
    `, [id]);

    const updatedTags = await db.all(`
      SELECT tg.id, tg.name, tg.color
      FROM task_tags tt
      JOIN tags tg ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `, [id]);

    res.json({
      task: {
        ...updatedTask,
        tags: updatedTags
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// Alternar status rápido (Pendente <-> Concluída)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const task = await db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    const isNowCompleted = task.status !== 'concluida';
    const newStatus = isNowCompleted ? 'concluida' : 'pendente';
    const completedAt = isNowCompleted ? new Date().toISOString() : null;

    await db.run(`
      UPDATE tasks 
      SET status = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [newStatus, completedAt, id, req.user.id]);

    const updatedTask = await db.get(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.id = ?
    `, [id]);

    const tags = await db.all(`
      SELECT tg.id, tg.name, tg.color
      FROM task_tags tt
      JOIN tags tg ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `, [id]);

    res.json({
      task: {
        ...updatedTask,
        tags
      }
    });
  } catch (error) {
    console.error('Erro ao alternar status da tarefa:', error);
    res.status(500).json({ error: 'Erro ao alternar status' });
  }
});

// Deletar tarefa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const result = await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

export default router;
