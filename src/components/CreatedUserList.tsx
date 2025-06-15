import { useEffect, useState, Component, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  _id: string;
  employeeId: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  department: string | null;
  designation: string | null;
  role: { id: number; role_name: string } | null;
  isActive: boolean;
  otpEnabled: boolean;
  permissions: any[];
}

interface Role {
  id: number;
  role_name: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Error: {this.state.error}</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const UserList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    role_id: '',
    isActive: true,
    otpEnabled: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, roleResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/roles/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        // Type assertion to access data
        const userData = (userResponse as { data: User[] }).data;
        const roleData = (roleResponse as { data: Role[] }).data;
        console.log('Users response:', userData);
        console.log('Roles response:', roleData);
        setUsers(userData);
        setFilteredUsers(userData);
        setRoles(roleData);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.response?.status === 403
          ? 'Only SUPERADMIN users can view this page.'
          : 'Failed to fetch data. Please check the console for details.');
        setLoading(false);
      }
    };
    if (token) {
      fetchData();
    } else {
      setError('No authentication token found. Please log in.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      [user.name, user.employeeId, user.email].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (user: User) => {
    setEditUser(user);
    setFormData({
      phoneNumber: user.phoneNumber || '',
      role_id: user.role?.id.toString() || '',
      isActive: user.isActive,
      otpEnabled: user.otpEnabled,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/users/${editUser.employeeId}/`,
        {
          phoneNumber: formData.phoneNumber,
          role_id: formData.role_id ? parseInt(formData.role_id) : undefined,
          isActive: formData.isActive,
          otpEnabled: formData.otpEnabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Type assertion for patch response
      const updatedUser = (response as { data: { data: User } }).data.data;
      setUsers(users.map((u) =>
        u.employeeId === editUser.employeeId ? updatedUser : u
      ));
      setFilteredUsers(filteredUsers.map((u) =>
        u.employeeId === editUser.employeeId ? updatedUser : u
      ));
      setEditUser(null);
      setFormError(null);
    } catch (err: any) {
      console.error('Edit error:', err);
      setFormError(`Failed to update user: ${err.response?.data?.detail || err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteClick = (employeeId: string) => {
    setDeleteUserId(employeeId);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${deleteUserId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.employeeId !== deleteUserId));
      setFilteredUsers(filteredUsers.filter((u) => u.employeeId !== deleteUserId));
      setDeleteUserId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(`Failed to delete user: ${err.response?.data?.detail || err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="pt-16 text-center">Loading...</div>;
  if (error) return <div className="pt-16 text-red-500 p-4">{error}</div>;

  return (
    <ErrorBoundary>
      <div className="pt-16 p-4">
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Search Users</label>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Employee ID</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Designation</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">OTP</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.employeeId} className="border-t">
                    <td className="p-2">{user.name || '-'}</td>
                    <td className="p-2">{user.employeeId}</td>
                    <td className="p-2">{user.email || '-'}</td>
                    <td className="p-2">{user.phoneNumber || '-'}</td>
                    <td className="p-2">{user.department || '-'}</td>
                    <td className="p-2">{user.designation || '-'}</td>
                    <td className="p-2">{user.role?.role_name || '-'}</td>
                    <td className="p-2">{user.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-2">{user.otpEnabled ? 'Yes' : 'No'}</td>
                    <td className="p-2 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user.employeeId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-2 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editUser && (
          <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User: {editUser.name || editUser.employeeId}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {formError && <div className="text-red-500">{formError}</div>}
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleFormChange}
                    className="border p-2 w-full rounded"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="otpEnabled"
                      checked={formData.otpEnabled}
                      onChange={handleFormChange}
                      className="mr-2"
                    />
                    OTP Enabled
                  </label>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-500 text-white">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditUser(null)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        {deleteUserId && (
          <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this user?</p>
              <DialogFooter>
                <Button
                  className="bg-red-500 text-white"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteUserId(null)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UserList;

// import { useEffect, useState, Component, ReactNode } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';
// import { Edit, Trash2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';

// interface User {
//   _id: string;
//   employeeId: string;
//   name: string | null;
//   email: string | null;
//   phoneNumber: string | null;
//   department: string | null;
//   designation: string | null;
//   role: { id: number; role_name: string } | null;
//   isActive: boolean;
//   otpEnabled: boolean;
//   permissions: any[];
// }

// interface Role {
//   id: number;
//   role_name: string;
// }

// interface ErrorBoundaryProps {
//   children: ReactNode;
// }

// interface ErrorBoundaryState {
//   hasError: boolean;
//   error: string | null;
// }

// class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
//   state: ErrorBoundaryState = { hasError: false, error: null };

//   static getDerivedStateFromError(error: Error) {
//     return { hasError: true, error: error.message };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="p-4 text-red-500">
//           <h2>Error: {this.state.error}</h2>
//           <p>Please try refreshing the page or contact support.</p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const UserList = () => {
//   const { token } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editUser, setEditUser] = useState<User | null>(null);
//   const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
//   const [formData, setFormData] = useState({
//     phoneNumber: '',
//     role_id: '',
//     isActive: true,
//     otpEnabled: false,
//   });
//   const [formError, setFormError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [userResponse, roleResponse] = await Promise.all([
//           axios.get('${import.meta.env.VITE_API_BASE_URL}/api/users/users/', {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get('${import.meta.env.VITE_API_BASE_URL}/api/users/roles/', {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);
//         console.log('Users response:', userResponse.data);
//         console.log('Roles response:', roleResponse.data);
//         setUsers(userResponse.data);
//         setFilteredUsers(userResponse.data);
//         setRoles(roleResponse.data);
//         setLoading(false);
//       } catch (err: any) {
//         console.error('Fetch error:', err);
//         setError(err.response?.status === 403
//           ? 'Only SUPERADMIN users can view this page.'
//           : 'Failed to fetch data. Please check the console for details.');
//         setLoading(false);
//       }
//     };
//     if (token) {
//       fetchData();
//     } else {
//       setError('No authentication token found. Please log in.');
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     const filtered = users.filter((user) =>
//       [user.name, user.employeeId, user.email].some((value) =>
//         value?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//     setFilteredUsers(filtered);
//   }, [searchTerm, users]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleEditClick = (user: User) => {
//     setEditUser(user);
//     setFormData({
//       phoneNumber: user.phoneNumber || '',
//       role_id: user.role?.id.toString() || '',
//       isActive: user.isActive,
//       otpEnabled: user.otpEnabled,
//     });
//   };

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
//     });
//   };

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editUser) return;

//     try {
//       const response = await axios.patch(
//         `${import.meta.env.VITE_API_BASE_URL}/api/users/users/${editUser.employeeId}/`,
//         {
//           phoneNumber: formData.phoneNumber,
//           role_id: formData.role_id ? parseInt(formData.role_id) : undefined,
//           isActive: formData.isActive,
//           otpEnabled: formData.otpEnabled,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setUsers(users.map((u) =>
//         u.employeeId === editUser.employeeId ? response.data.data : u
//       ));
//       setFilteredUsers(filteredUsers.map((u) =>
//         u.employeeId === editUser.employeeId ? response.data.data : u
//       ));
//       setEditUser(null);
//       setFormError(null);
//     } catch (err: any) {
//       console.error('Edit error:', err);
//       setFormError(`Failed to update user: ${err.response?.data?.detail || err.response?.data?.message || err.message}`);
//     }
//   };

//   const handleDeleteClick = (employeeId: string) => {
//     setDeleteUserId(employeeId);
//   };

//   const confirmDelete = async () => {
//     if (!deleteUserId) return;

//     try {
//       await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/users/${deleteUserId}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(users.filter((u) => u.employeeId !== deleteUserId));
//       setFilteredUsers(filteredUsers.filter((u) => u.employeeId !== deleteUserId));
//       setDeleteUserId(null);
//     } catch (err: any) {
//       console.error('Delete error:', err);
//       setError(`Failed to delete user: ${err.response?.data?.detail || err.response?.data?.message || err.message}`);
//     }
//   };

//   if (loading) return <div className="pt-16 text-center">Loading...</div>;
//   if (error) return <div className="pt-16 text-red-500 p-4">{error}</div>;

//   return (
//     <ErrorBoundary>
//       <div className="pt-16 p-4">
//         <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">Search Users</label>
//           <input
//             type="text"
//             placeholder="Search by name, ID, or email..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 text-left">Name</th>
//                 <th className="p-2 text-left">Employee ID</th>
//                 <th className="p-2 text-left">Email</th>
//                 <th className="p-2 text-left">Phone</th>
//                 <th className="p-2 text-left">Department</th>
//                 <th className="p-2 text-left">Designation</th>
//                 <th className="p-2 text-left">Role</th>
//                 <th className="p-2 text-left">Active</th>
//                 <th className="p-2 text-left">OTP</th>
//                 <th className="p-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => (
//                   <tr key={user.employeeId} className="border-t">
//                     <td className="p-2">{user.name || '-'}</td>
//                     <td className="p-2">{user.employeeId}</td>
//                     <td className="p-2">{user.email || '-'}</td>
//                     <td className="p-2">{user.phoneNumber || '-'}</td>
//                     <td className="p-2">{user.department || '-'}</td>
//                     <td className="p-2">{user.designation || '-'}</td>
//                     <td className="p-2">{user.role?.role_name || '-'}</td>
//                     <td className="p-2">{user.isActive ? 'Yes' : 'No'}</td>
//                     <td className="p-2">{user.otpEnabled ? 'Yes' : 'No'}</td>
//                     <td className="p-2 flex space-x-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleEditClick(user)}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDeleteClick(user.employeeId)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={10} className="p-2 text-center text-gray-500">
//                     No users found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Edit Modal */}
//         {editUser && (
//           <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit User: {editUser.name || editUser.employeeId}</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleEditSubmit} className="space-y-4">
//                 {formError && <div className="text-red-500">{formError}</div>}
//                 <div>
//                   <label className="block text-sm font-medium">Phone</label>
//                   <input
//                     type="text"
//                     name="phoneNumber"
//                     value={formData.phoneNumber}
//                     onChange={handleFormChange}
//                     className="border p-2 w-full rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium">Role</label>
//                   <select
//                     name="role_id"
//                     value={formData.role_id}
//                     onChange={handleFormChange}
//                     className="border p-2 w-full rounded"
//                     required
//                   >
//                     <option value="">Select Role</option>
//                     {roles.map((role) => (
//                       <option key={role.id} value={role.id}>
//                         {role.role_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="flex items-center">
//                     <input
//                       type="checkbox"
//                       name="isActive"
//                       checked={formData.isActive}
//                       onChange={handleFormChange}
//                       className="mr-2"
//                     />
//                     Active
//                   </label>
//                 </div>
//                 <div>
//                   <label className="flex items-center">
//                     <input
//                       type="checkbox"
//                       name="otpEnabled"
//                       checked={formData.otpEnabled}
//                       onChange={handleFormChange}
//                       className="mr-2"
//                     />
//                     OTP Enabled
//                   </label>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit" className="bg-blue-500 text-white">
//                     Save
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setEditUser(null)}
//                   >
//                     Cancel
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         )}

//         {/* Delete Confirmation Modal */}
//         {deleteUserId && (
//           <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Confirm Deletion</DialogTitle>
//               </DialogHeader>
//               <p>Are you sure you want to delete this user?</p>
//               <DialogFooter>
//                 <Button
//                   className="bg-red-500 text-white"
//                   onClick={confirmDelete}
//                 >
//                   Delete
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setDeleteUserId(null)}
//                 >
//                   Cancel
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default UserList;