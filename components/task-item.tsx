"use client"

import type { Task } from "@/app/dashboard/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"

interface TaskItemProps {
  task: Task
  onToggleStatus: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskItem({ task, onToggleStatus, onEdit, onDelete }: TaskItemProps) {
  const isOverdue = task.status === "incomplete" && isBefore(new Date(task.deadline), startOfDay(new Date()))
  const isDueToday = format(new Date(task.deadline), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        task.status === "completed" ? "opacity-75" : ""
      } ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.status === "completed"}
            onCheckedChange={() => onToggleStatus(task.id)}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-medium text-gray-900 ${
                    task.status === "completed" ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm text-gray-600 mt-1 ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.description}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>

              <div
                className={`flex items-center text-xs ${
                  isOverdue ? "text-red-600" : isDueToday ? "text-orange-600" : "text-gray-500"
                }`}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(task.deadline), "MMM dd, yyyy")}
                {isOverdue && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Overdue
                  </Badge>
                )}
                {isDueToday && !isOverdue && (
                  <Badge variant="outline" className="ml-2 text-xs border-orange-200 text-orange-600">
                    Due Today
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
