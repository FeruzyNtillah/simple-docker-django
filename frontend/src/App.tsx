import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

interface Task {
  id: number
  title: string
  completed: boolean
  created_at: string
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const res = await axios.get<Task[]>('/api/tasks/')
      setTasks(res.data)
    } catch {
      setError('Failed to load tasks. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const res = await axios.post<Task>('/api/tasks/', { title: newTitle.trim(), completed: false })
      setTasks(prev => [res.data, ...prev])
      setNewTitle('')
    } catch {
      setError('Failed to add task.')
    }
  }

  async function toggleTask(task: Task) {
    try {
      const res = await axios.patch<Task>(`/api/tasks/${task.id}/`, { completed: !task.completed })
      setTasks(prev => prev.map(t => (t.id === task.id ? res.data : t)))
    } catch {
      setError('Failed to update task.')
    }
  }

  async function deleteTask(id: number) {
    try {
      await axios.delete(`/api/tasks/${id}/`)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  const done = tasks.filter(t => t.completed).length

  return (
    <div className="app">
      <header>
        <h1>Tasks</h1>
        {tasks.length > 0 && (
          <p className="summary">{done} of {tasks.length} completed</p>
        )}
      </header>

      <form onSubmit={addTask} className="add-form">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new task…"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="state">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={task.completed ? 'done' : ''}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
              />
              <span className="title">{task.title}</span>
              <span className="date">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
              <button className="delete" onClick={() => deleteTask(task.id)} aria-label="Delete">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
