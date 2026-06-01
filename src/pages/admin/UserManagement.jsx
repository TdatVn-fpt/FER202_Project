import React from 'react';

export default function UserManagement() {
  const [users] = React.useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin' }
  ]);

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="btn-secondary-xs">Edit</button>
                  <button className="btn-danger-xs">Block</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
