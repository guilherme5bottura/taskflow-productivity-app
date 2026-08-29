import express from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.id;

    // 1. Métricas gerais (KPIs) incluindo a última semana
    const counts = await db.get(`
      SELECT
        COUNT(id) as total_tasks,
        COUNT(CASE WHEN status != 'concluida' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'concluida' THEN 1 END) as completed_tasks,
        COUNT(CASE 
          WHEN status = 'concluida' AND completed_at IS NOT NULL AND date(completed_at) = date('now', 'localtime') 
          THEN 1 
        END) as completed_today,
        COUNT(CASE 
          WHEN status = 'concluida' AND completed_at IS NOT NULL AND date(completed_at) >= date('now', '-7 days', 'localtime')
          THEN 1 
        END) as completed_last_week,
        COUNT(CASE 
          WHEN status != 'concluida' AND due_date IS NOT NULL AND datetime(due_date) < datetime('now', 'localtime') 
          THEN 1 
        END) as overdue_tasks,
        COUNT(CASE 
          WHEN status != 'concluida' AND due_date IS NOT NULL AND date(due_date) = date('now', 'localtime') 
          THEN 1 
        END) as due_today,
        COUNT(CASE 
          WHEN status != 'concluida' AND priority = 'urgente'
          THEN 1 
        END) as urgent_tasks
      FROM tasks
      WHERE user_id = ?
    `, [userId]);

    // 2. Distribuição por prioridade
    const priorityDistribution = await db.all(`
      SELECT 
        priority,
        COUNT(id) as count
      FROM tasks
      WHERE user_id = ? AND status != 'concluida'
      GROUP BY priority
    `, [userId]);

    // 3. Distribuição por categoria
    const categoryDistribution = await db.all(`
      SELECT 
        COALESCE(c.name, 'Sem Categoria') as name,
        COALESCE(c.color, '#6B7280') as color,
        COUNT(t.id) as count
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ? AND t.status != 'concluida'
      GROUP BY c.id, c.name, c.color
    `, [userId]);

    // 4. Próximas tarefas a vencer (ordenadas por prazo mais próximo que não estejam concluídas)
    const upcomingTasks = await db.all(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ? AND t.status != 'concluida'
      ORDER BY 
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END ASC,
        t.due_date ASC,
        CASE WHEN t.priority = 'urgente' THEN 1 WHEN t.priority = 'media' THEN 2 ELSE 3 END ASC
      LIMIT 6
    `, [userId]);

    // Buscar tags das tarefas próximas
    const taskIds = upcomingTasks.map(t => t.id);
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

    const upcomingWithTags = upcomingTasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || []
    }));

    // 5. Histórico recente de conclusão (últimos 7 dias)
    const completionHistory = await db.all(`
      SELECT 
        date(completed_at) as date,
        COUNT(id) as count
      FROM tasks
      WHERE user_id = ? AND status = 'concluida' AND completed_at IS NOT NULL
        AND date(completed_at) >= date('now', '-6 days', 'localtime')
      GROUP BY date(completed_at)
      ORDER BY date(completed_at) ASC
    `, [userId]);

    const total = counts.total_tasks || 0;
    const completed = counts.completed_tasks || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      stats: {
        totalTasks: total,
        pendingTasks: counts.pending_tasks || 0,
        completedTasks: completed,
        completedToday: counts.completed_today || 0,
        completedLastWeek: counts.completed_last_week || 0,
        overdueTasks: counts.overdue_tasks || 0,
        dueToday: counts.due_today || 0,
        urgentTasks: counts.urgent_tasks || 0,
        completionRate
      },
      priorityDistribution,
      categoryDistribution,
      upcomingTasks: upcomingWithTags,
      completionHistory
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao gerar dados do painel de controle' });
  }
});

export default router;
