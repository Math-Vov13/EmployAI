'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Input } from '@heroui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@heroui/table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    documents: number;
  };
}

interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  // Create User Modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState('USER');
  const [createStatus, setCreateStatus] = useState('ONLINE');

  // Edit User Modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editRole, setEditRole] = useState('USER');
  const [editStatus, setEditStatus] = useState('ONLINE');

  // Delete Confirmation Modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          role: createRole,
          status: createStatus,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create user');
      }

      await fetchUsers();
      onCreateClose();
      setCreateEmail('');
      setCreateRole('USER');
      setCreateStatus('ONLINE');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          status: editStatus,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user');
      }

      await fetchUsers();
      onEditClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      await fetchUsers();
      onDeleteClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    onEditOpen();
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'danger' : 'primary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'STANDBY':
        return 'warning';
      case 'OFFLINE':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users and their permissions</p>
        </div>
        <Button color="primary" onPress={onCreateOpen}>
          ➕ Create User
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.status === 'ONLINE').length}
            </p>
            <p className="text-sm text-gray-600">Online</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {users.filter((u) => u.status === 'STANDBY').length}
            </p>
            <p className="text-sm text-gray-600">Standby</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
            <p className="text-sm text-gray-600">Admins</p>
          </CardBody>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardBody className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <Table aria-label="Users table" removeWrapper>
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DOCUMENTS</TableColumn>
                <TableColumn>JOINED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.email}</span>
                        {currentUser?.id === user.id && (
                          <Chip size="sm" color="secondary" variant="flat">
                            You
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getRoleColor(user.role)}>
                        {user.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getStatusColor(user.status)}>
                        {user.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user._count.documents}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => openEditModal(user)}
                          isDisabled={currentUser?.id === user.id}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => openDeleteModal(user)}
                          isDisabled={currentUser?.id === user.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Create New User</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="user@example.com"
                    value={createEmail}
                    onValueChange={setCreateEmail}
                    isRequired
                  />
                  <Select
                    label="Role"
                    selectedKeys={[createRole]}
                    onChange={(e) => setCreateRole(e.target.value)}
                  >
                    <SelectItem key="USER">
                      User
                    </SelectItem>
                    <SelectItem key="ADMIN">
                      Admin
                    </SelectItem>
                  </Select>
                  <Select
                    label="Status"
                    selectedKeys={[createStatus]}
                    onChange={(e) => setCreateStatus(e.target.value)}
                  >
                    <SelectItem key="ONLINE">
                      Online
                    </SelectItem>
                    <SelectItem key="STANDBY">
                      Standby
                    </SelectItem>
                    <SelectItem key="OFFLINE">
                      Offline
                    </SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateUser}
                  isDisabled={!createEmail || updating}
                >
                  Create User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Edit User</h3>
              </ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-lg">{selectedUser.email}</p>
                    </div>
                    <Select
                      label="Role"
                      selectedKeys={[editRole]}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <SelectItem key="USER">
                        User
                      </SelectItem>
                      <SelectItem key="ADMIN">
                        Admin
                      </SelectItem>
                    </Select>
                    <Select
                      label="Status"
                      selectedKeys={[editStatus]}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <SelectItem key="ONLINE">
                        Online
                      </SelectItem>
                      <SelectItem key="STANDBY">
                        Standby
                      </SelectItem>
                      <SelectItem key="OFFLINE">
                        Offline
                      </SelectItem>
                    </Select>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdateUser} isDisabled={updating}>
                  Update User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold text-red-600">Delete User</h3>
              </ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div>
                    <p className="mb-4">
                      Are you sure you want to delete this user? This action cannot be
                      undone.
                    </p>
                    <Card className="bg-red-50">
                      <CardBody className="p-4">
                        <p className="font-medium">{selectedUser.email}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedUser._count.documents} document(s) will also be deleted
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteUser} isDisabled={updating}>
                  Delete User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
