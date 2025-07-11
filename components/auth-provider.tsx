"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (name: string, email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("auth-token")
    const userData = localStorage.getItem("user-data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const userData = { id: user.id, name: user.name, email: user.email }
    const token = `token_${user.id}_${Date.now()}`

    localStorage.setItem("auth-token", token)
    localStorage.setItem("user-data", JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In real app, this would be hashed
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email }
    const token = `token_${newUser.id}_${Date.now()}`

    localStorage.setItem("auth-token", token)
    localStorage.setItem("user-data", JSON.stringify(userData))
    setUser(userData)
  }

  const updateProfile = async (name: string, email: string) => {
    if (!user) throw new Error("No user logged in")

    // Update users array in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)

    if (userIndex === -1) throw new Error("User not found")

    // Check if email is already taken by another user
    const emailExists = users.find((u: any) => u.email === email && u.id !== user.id)
    if (emailExists) {
      throw new Error("Email already in use")
    }

    users[userIndex] = { ...users[userIndex], name, email }
    localStorage.setItem("users", JSON.stringify(users))

    // Update current user data
    const updatedUser = { ...user, name, email }
    localStorage.setItem("user-data", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("No user logged in")

    // Verify current password
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)

    if (userIndex === -1) throw new Error("User not found")
    if (users[userIndex].password !== currentPassword) {
      throw new Error("Current password is incorrect")
    }

    // Update password
    users[userIndex].password = newPassword
    localStorage.setItem("users", JSON.stringify(users))
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-data")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
