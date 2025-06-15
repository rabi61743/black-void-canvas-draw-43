import { useEffect, useState, Component, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EmployeeDetail {
  employee_id: string;
  name: string | null;
  email: string;
  position: string | null;
  level: string | null;
  service: string | null;
  group: string | null;
  qualification: string | null;
  seniority: string | null;
  retirement: string | null;
  mno: string | null;
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

const CreateUser = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserAdded, setIsUserAdded] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    email: '',
    username: '',
    name: '',
    phone: '',
    department: '',
    designation: '',
    role: '',
    is_active: true,
    is_staff: false,
    otp_enabled: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeResponse, roleResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/employee-details/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/roles/`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error('Roles fetch error:', err.response?.status, err.message);
            throw new Error(`Failed to fetch roles: ${err.response?.status || err.message}`);
          }),
        ]);
        // Type assertion to access data
        const employeeData = (employeeResponse as { data: EmployeeDetail[] }).data;
        const roleData = (roleResponse as { data: Role[] }).data;
        console.log('Employees response:', employeeData);
        console.log('Roles response:', roleData);
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
        setRoles(roleData);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data. Please check the console for details.');
        if (err.message.includes('roles')) {
          setRolesError(err.message);
        }
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
    const filtered = employees.filter((employee) =>
      [employee.name, employee.employee_id, employee.email].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const checkUserExists = async (employee_id: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/employee/${employee_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return false;
      }
      console.error('Check user error:', err);
      setFormError('Failed to verify user existence.');
      return false;
    }
  };

  const handleEmployeeSelect = async (employee: EmployeeDetail) => {
    const userExists = await checkUserExists(employee.employee_id);
    setIsUserAdded(userExists);

    const position = employee.position || '';
    const words = position.trim().split(/\s+/);
    const designation = words.slice(0, 2).join(' ') || '';
    const department = words.slice(2).join(' ') || '';
    setFormData({
      ...formData,
      employee_id: employee.employee_id,
      email: employee.email,
      username: employee.employee_id,
      name: employee.name || '',
      phone: employee.mno || '',
      designation,
      department,
    });
    setSearchTerm('');
    setFilteredEmployees(employees);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const validateEmployeeDetail = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/validate-employee/`,
        { employee_id: formData.employee_id, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err) {
      setFormError('Employee ID and email do not match an existing EmployeeDetail.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isUserAdded) {
      setFormError('User already added for this employee.');
      return;
    }

    if (!formData.role) {
      setFormError('Please select a role.');
      return;
    }

    if (!(await validateEmployeeDetail())) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/register/`,
        {
          employee_id: formData.employee_id,
          username: formData.username,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          password: 'Nepal@123',
          role: parseInt(formData.role),
          designation: formData.designation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({
        employee_id: '',
        email: '',
        username: '',
        name: '',
        phone: '',
        department: '',
        designation: '',
        role: '',
        is_active: true,
        is_staff: false,
        otp_enabled: false,
      });
      setIsUserAdded(false);
      navigate('/employee-details');
    } catch (err: any) {
      console.error('Submit error:', err);
      setFormError(`Failed to create user: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ErrorBoundary>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Create Procurement User</h2>
        {formError && <div className="text-red-500 mb-2">{formError}</div>}
        {isUserAdded && (
          <div className="text-red-500 mb-2">User already added for this employee.</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Search Employee</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border p-2 w-full rounded"
            />
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-white">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.employee_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      {employee.name ? `${employee.name} (${employee.employee_id})` : employee.employee_id} - {employee.email}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matching employees found</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block">Employee ID</label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              required
              readOnly
            />
          </div>
          <div>
            <label className="block">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              readOnly
            />
          </div>
          <div>
            <label className="block">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              className="border p-2 w-full rounded"
              required
              disabled={isUserAdded}
            >
              <option value="">Select Role</option>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))
              ) : (
                <option disabled>No roles available</option>
              )}
            </select>
            {rolesError && <div className="text-red-500 text-sm mt-1">{rolesError}</div>}
            {!rolesError && roles.length === 0 && (
              <div className="text-gray-500 text-sm mt-1">
                No roles found. Please create roles in the admin panel.
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleFormChange}
                className="mr-2"
                disabled={isUserAdded}
              />
              Active
            </label>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_staff"
                checked={formData.is_staff}
                onChange={handleFormChange}
                className="mr-2"
                disabled={isUserAdded}
              />
              Staff
            </label>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="otp_enabled"
                checked={formData.otp_enabled}
                onChange={handleFormChange}
                className="mr-2"
                disabled={isUserAdded}
              />
              OTP Enabled
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className={`p-2 rounded text-white ${isUserAdded ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isUserAdded}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee-details')}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default CreateUser;



// import { useEffect, useState, Component, ReactNode } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// interface EmployeeDetail {
//   employee_id: string;
//   name: string | null;
//   email: string;
//   position: string | null;
//   level: string | null;
//   service: string | null;
//   group: string | null;
//   qualification: string | null;
//   seniority: string | null;
//   retirement: string | null;
//   mno: string | null;
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

// const CreateUser = () => {
//   const { token } = useAuth();
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [rolesError, setRolesError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isUserAdded, setIsUserAdded] = useState(false);
//   const [formData, setFormData] = useState({
//     employee_id: '',
//     email: '',
//     username: '',
//     name: '', // Added name field
//     phone: '',
//     department: '',
//     designation: '',
//     role: '',
//     is_active: true,
//     is_staff: false,
//     otp_enabled: false,
//   });
//   const [formError, setFormError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [employeeResponse, roleResponse] = await Promise.all([
//           axios.get('${import.meta.env.VITE_API_BASE_URL}/api/users/employee-details/', {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get('${import.meta.env.VITE_API_BASE_URL}/api/users/roles/', {
//             headers: { Authorization: `Bearer ${token}` },
//           }).catch((err) => {
//             console.error('Roles fetch error:', err.response?.status, err.message);
//             throw new Error(`Failed to fetch roles: ${err.response?.status || err.message}`);
//           }),
//         ]);
//         console.log('Employees response:', employeeResponse.data);
//         console.log('Roles response:', roleResponse.data);
//         setEmployees(employeeResponse.data);
//         setFilteredEmployees(employeeResponse.data);
//         setRoles(roleResponse.data);
//         setLoading(false);
//       } catch (err: any) {
//         console.error('Fetch error:', err);
//         setError('Failed to fetch data. Please check the console for details.');
//         if (err.message.includes('roles')) {
//           setRolesError(err.message);
//         }
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
//     const filtered = employees.filter((employee) =>
//       [employee.name, employee.employee_id, employee.email].some((value) =>
//         value?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//     setFilteredEmployees(filtered);
//   }, [searchTerm, employees]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const checkUserExists = async (employee_id: string) => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/employee/${employee_id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return response.status === 200; // User exists
//     } catch (err: any) {
//       if (err.response?.status === 404) {
//         return false; // User does not exist
//       }
//       console.error('Check user error:', err);
//       setFormError('Failed to verify user existence.');
//       return false;
//     }
//   };

//   const handleEmployeeSelect = async (employee: EmployeeDetail) => {
//     const userExists = await checkUserExists(employee.employee_id);
//     setIsUserAdded(userExists);

//     const position = employee.position || '';
//     const words = position.trim().split(/\s+/);
//     const designation = words.slice(0, 2).join(' ') || '';
//     const department = words.slice(2).join(' ') || '';
//     setFormData({
//       ...formData,
//       employee_id: employee.employee_id,
//       email: employee.email,
//       username: employee.employee_id,
//       name: employee.name || '', // Set name from EmployeeDetail
//       phone: employee.mno || '',
//       designation,
//       department,
//     });
//     setSearchTerm(''); // Clear search after selection
//     setFilteredEmployees(employees); // Reset filtered list
//   };

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
//     });
//   };

//   const validateEmployeeDetail = async () => {
//     try {
//       await axios.post(
//         '${import.meta.env.VITE_API_BASE_URL}/api/users/validate-employee/',
//         { employee_id: formData.employee_id, email: formData.email },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       return true;
//     } catch (err) {
//       setFormError('Employee ID and email do not match an existing EmployeeDetail.');
//       return false;
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError(null);

//     if (isUserAdded) {
//       setFormError('User already added for this employee.');
//       return;
//     }

//     if (!formData.role) {
//       setFormError('Please select a role.');
//       return;
//     }

//     if (!(await validateEmployeeDetail())) return;

//     try {
//       await axios.post(
//         '${import.meta.env.VITE_API_BASE_URL}/api/users/register/',
//         {
//           employee_id: formData.employee_id,
//           username: formData.username,
//           email: formData.email,
//           name: formData.name, // Include name in payload
//           phone: formData.phone,
//           department: formData.department,
//           password: 'Nepal@123',
//           role: parseInt(formData.role),
//           designation: formData.designation,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setFormData({
//         employee_id: '',
//         email: '',
//         username: '',
//         name: '', // Reset name
//         phone: '',
//         department: '',
//         designation: '',
//         role: '',
//         is_active: true,
//         is_staff: false,
//         otp_enabled: false,
//       });
//       setIsUserAdded(false);
//       navigate('/employee-details');
//     } catch (err: any) {
//       console.error('Submit error:', err);
//       setFormError(`Failed to create user: ${err.response?.data?.detail || err.message}`);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <ErrorBoundary>
//       <div className="p-4">
//         <h2 className="text-2xl font-bold mb-4">Create Procurement User</h2>
//         {formError && <div className="text-red-500 mb-2">{formError}</div>}
//         {isUserAdded && (
//           <div className="text-red-500 mb-2">User already added for this employee.</div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block">Search Employee</label>
//             <input
//               type="text"
//               placeholder="Search by name, ID, or email..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="border p-2 w-full rounded"
//             />
//             {searchTerm && (
//               <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-white">
//                 {filteredEmployees.length > 0 ? (
//                   filteredEmployees.map((employee) => (
//                     <div
//                       key={employee.employee_id}
//                       className="p-2 hover:bg-gray-100 cursor-pointer"
//                       onClick={() => handleEmployeeSelect(employee)}
//                     >
//                       {employee.name ? `${employee.name} (${employee.employee_id})` : employee.employee_id} - {employee.email}
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-2 text-gray-500">No matching employees found</div>
//                 )}
//               </div>
//             )}
//           </div>
//           <div>
//             <label className="block">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               required
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Employee ID</label>
//             <input
//               type="text"
//               name="employee_id"
//               value={formData.employee_id}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               required
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               required
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               required
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Phone</label>
//             <input
//               type="text"
//               name="phone"
//               value={formData.phone}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//             />
//           </div>
//           <div>
//             <label className="block">Department</label>
//             <input
//               type="text"
//               name="department"
//               value={formData.department}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Designation</label>
//             <input
//               type="text"
//               name="designation"
//               value={formData.designation}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block">Role</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleFormChange}
//               className="border p-2 w-full rounded"
//               required
//               disabled={isUserAdded}
//             >
//               <option value="">Select Role</option>
//               {roles.length > 0 ? (
//                 roles.map((role) => (
//                   <option key={role.id} value={role.id}>
//                     {role.role_name}
//                   </option>
//                 ))
//               ) : (
//                 <option disabled>No roles available</option>
//               )}
//             </select>
//             {rolesError && <div className="text-red-500 text-sm mt-1">{rolesError}</div>}
//             {!rolesError && roles.length === 0 && (
//               <div className="text-gray-500 text-sm mt-1">
//                 No roles found. Please create roles in the admin panel.
//               </div>
//             )}
//           </div>
//           <div>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="is_active"
//                 checked={formData.is_active}
//                 onChange={handleFormChange}
//                 className="mr-2"
//                 disabled={isUserAdded}
//               />
//               Active
//             </label>
//           </div>
//           <div>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="is_staff"
//                 checked={formData.is_staff}
//                 onChange={handleFormChange}
//                 className="mr-2"
//                 disabled={isUserAdded}
//               />
//               Staff
//             </label>
//           </div>
//           <div>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 name="otp_enabled"
//                 checked={formData.otp_enabled}
//                 onChange={handleFormChange}
//                 className="mr-2"
//                 disabled={isUserAdded}
//               />
//               OTP Enabled
//             </label>
//           </div>
//           <div className="flex space-x-2">
//             <button
//               type="submit"
//               className={`p-2 rounded text-white ${isUserAdded ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
//               disabled={isUserAdded}
//             >
//               Create
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate('/employee-details')}
//               className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default CreateUser;