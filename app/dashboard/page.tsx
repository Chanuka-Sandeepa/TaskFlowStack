"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { TaskFiltersComponent } from "@/components/task-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Plus, CheckCircle2, AlertTriangle, LogOut, User } from "lucide-react"

export interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  status: "completed" | "incomplete"
  deadline: string
  createdAt: string
}

export interface TaskFilters {
  status: string
  priority: string
  sortBy: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    sortBy: "deadline",
  })

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(`tasks_${user?.email}`)
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [user?.email])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`tasks_${user.email}`, JSON.stringify(tasks))
    }
  }, [tasks, user?.email])

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    toast({
      title: "Task created",
      description: "Your new task has been added successfully.",
    })
  }

  const updateTask = (taskId: string, taskData: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...taskData } : task)))
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    })
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    toast({
      title: "Task deleted",
      description: "The task has been removed successfully.",
    })
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: task.status === "completed" ? "incomplete" : "completed" } : task,
      ),
    )
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (filters.status !== "all" && task.status !== filters.status) return false
      if (filters.priority !== "all" && task.priority !== filters.priority) return false
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const incompleteTasks = tasks.filter((task) => task.status === "incomplete").length
  const overdueTasks = tasks.filter(
    (task) => task.status === "incomplete" && new Date(task.deadline) < new Date(),
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TaskFlow</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedTasks} completed, {incompleteTasks} remaining
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks past their deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter and sort your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
              </CardContent>
            </Card>
          </div>

          {/* Task List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Tasks</CardTitle>
                    <CardDescription>
                      {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsTaskFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={filteredTasks}
                  onToggleStatus={toggleTaskStatus}
                  onEditTask={handleEditTask}
                  onDeleteTask={deleteTask}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={handleCloseTaskForm}
          onSubmit={editingTask ? (taskData) => updateTask(editingTask.id, taskData) : addTask}
          initialData={editingTask}
        />
      </div>
    </div>
  )
}
