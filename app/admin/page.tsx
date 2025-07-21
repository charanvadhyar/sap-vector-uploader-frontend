'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, UserPlus, Key, Shield, ShieldOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface CreateUserForm {
  email: string
  password: string
  full_name: string
  is_admin: boolean
}

interface UpdateUserForm {
  full_name?: string
  is_active?: boolean
  is_admin?: boolean
}

export default function AdminPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    full_name: '',
    is_admin: false
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [updateForm, setUpdateForm] = useState<UpdateUserForm>({})
  const [passwordReset, setPasswordReset] = useState({ userId: '', password: '' })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [user, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createUserForm)
      })

      if (response.ok) {
        toast.success('User created successfully')
        setShowCreateDialog(false)
        setCreateUserForm({ email: '', password: '', full_name: '', is_admin: false })
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to create user')
      }
    } catch (error) {
      toast.error('Error creating user')
    }
  }

  const updateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateForm)
      })

      if (response.ok) {
        toast.success('User updated successfully')
        setShowEditDialog(false)
        setEditingUser(null)
        setUpdateForm({})
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to update user')
      }
    } catch (error) {
      toast.error('Error updating user')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const toggleAdminStatus = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to toggle admin status')
      }
    } catch (error) {
      toast.error('Error toggling admin status')
    }
  }

  const resetPassword = async () => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${passwordReset.userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passwordReset.password })
      })

      if (response.ok) {
        toast.success('Password reset successfully')
        setShowPasswordDialog(false)
        setPasswordReset({ userId: '', password: '' })
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Error resetting password')
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setUpdateForm({
      full_name: user.full_name || '',
      is_active: user.is_active,
      is_admin: user.is_admin
    })
    setShowEditDialog(true)
  }

  const openPasswordDialog = (userId: string) => {
    setPasswordReset({ userId, password: '' })
    setShowPasswordDialog(true)
  }

  if (!user || !user.is_admin) {
    return <div>Access denied. Admin privileges required.</div>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={createUserForm.full_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_admin"
                  checked={createUserForm.is_admin}
                  onCheckedChange={(checked) => setCreateUserForm({ ...createUserForm, is_admin: checked })}
                />
                <Label htmlFor="is_admin">Admin User</Label>
              </div>
              <Button onClick={createUser} className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.full_name || 'No Name'}</h3>
                    {user.is_admin && <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                    {!user.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-400">Created: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPasswordDialog(user.id)}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAdminStatus(user.id)}
                    disabled={user.id === user?.id}
                  >
                    {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    disabled={user.id === user?.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={updateForm.full_name || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, full_name: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={updateForm.is_active || false}
                onCheckedChange={(checked) => setUpdateForm({ ...updateForm, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Active User</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_admin"
                checked={updateForm.is_admin || false}
                onCheckedChange={(checked) => setUpdateForm({ ...updateForm, is_admin: checked })}
                disabled={editingUser?.id === user?.id}
              />
              <Label htmlFor="edit_is_admin">Admin User</Label>
            </div>
            <Button onClick={updateUser} className="w-full">Update User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordReset.password}
                onChange={(e) => setPasswordReset({ ...passwordReset, password: e.target.value })}
              />
            </div>
            <Button onClick={resetPassword} className="w-full">Reset Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
