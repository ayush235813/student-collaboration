// Status badge config: maps status string → Tailwind classes + label
export const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  'in-progress': {
    label: 'In Progress',
    badge: 'bg-blue-100 text-blue-800'
  },
  completed: {
    label: 'Completed',
    badge: 'bg-green-100 text-green-800'
  }
};

// Priority badge config
export const PRIORITY_STYLES = {
  low: {
    label: 'Low',
    badge: 'bg-gray-100 text-gray-700'
  },
  medium: {
    label: 'Medium',
    badge: 'bg-orange-100 text-orange-700'
  },
  high: {
    label: 'High',
    badge: 'bg-red-100 text-red-700'
  }
};

/**
 * Reusable TaskCard component.
 * Props:
 *  - task: task object
 *  - isAdmin: boolean — show admin actions
 *  - isAssignee: boolean — show status update
 *  - onStatusChange(taskId, newStatus): callback
 *  - onEdit(task): callback
 *  - onDelete(taskId): callback
 */
const TaskCard = ({ task, isAdmin, isAssignee, onStatusChange, onEdit, onDelete }) => {
  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date();

  // Status options for the dropdown
  const statusOptions = ['pending', 'in-progress', 'completed'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900 flex-1">{task.title}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle.badge}`}>
            {priorityStyle.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.badge}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {/* Meta info */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          <span className="font-medium text-gray-700">Assigned: </span>
          {task.assignedTo?.name || 'Unassigned'}
        </span>
        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>Due: </span>
          {formatDate(task.dueDate)}{isOverdue ? ' (Overdue)' : ''}
        </span>
        <span>
          <span className="font-medium text-gray-700">By: </span>
          {task.createdBy?.name || '—'}
        </span>
      </div>

      {/* Actions */}
      {(isAdmin || isAssignee) && (
        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          {/* Status dropdown — available to admin OR assignee */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {STATUS_STYLES[s].label}
              </option>
            ))}
          </select>

          {/* Admin-only: edit and delete */}
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(task)}
                className="text-xs px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="text-xs px-3 py-1 border border-transparent rounded text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
