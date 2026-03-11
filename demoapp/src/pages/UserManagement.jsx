import React, { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import './UserManagement.css';

const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'User', status: 'Active' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Admin', status: 'Active' },
  { id: 8, name: 'Henry Wilson', email: 'henry@example.com', role: 'User', status: 'Inactive' },
  { id: 9, name: 'Iris Martinez', email: 'iris@example.com', role: 'Editor', status: 'Active' },
  { id: 10, name: 'Jack Moore', email: 'jack@example.com', role: 'User', status: 'Active' },
  { id: 11, name: 'Karen Taylor', email: 'karen@example.com', role: 'User', status: 'Active' },
  { id: 12, name: 'Leo Anderson', email: 'leo@example.com', role: 'User', status: 'Active' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User' });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'User' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    showToast(`User "${userToDelete.name}" deleted successfully`, 'success');
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u
      ));
      showToast(`User "${formData.name}" updated successfully`, 'success');
    } else {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...formData,
        status: 'Active'
      };
      setUsers([...users, newUser]);
      showToast(`User "${formData.name}" added successfully`, 'success');
    }
    setShowModal(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <button
          className="btn-primary"
          onClick={handleAddUser}
          data-testid="btn-add-user"
        >
          + Add User
        </button>
      </div>

      <div className="users-search">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="user-search"
        />
      </div>

      <div className="users-table">
        <DataTable
          columns={tableColumns}
          data={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button
              className="btn-cancel"
              onClick={() => setShowModal(false)}
              data-testid="modal-cancel"
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitForm}
              data-testid="modal-submit"
            >
              {editingUser ? 'Update' : 'Add'} User
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="form-name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              data-testid="form-email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              data-testid="form-role"
            >
              <option value="User">User</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => setShowDeleteConfirm(false)}
        footer={
          <>
            <button
              className="btn-cancel"
              onClick={() => setShowDeleteConfirm(false)}
              data-testid="delete-cancel"
            >
              Cancel
            </button>
            <button
              className="btn-delete-confirm"
              onClick={confirmDelete}
              data-testid="delete-confirm"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="delete-confirm" data-testid="delete-confirm-message">
          <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
          <p>This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
