import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

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

const EmployeeDetailList = () => {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<EmployeeDetail[]>(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/employee-details/`, // Use backticks for interpolation
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Type guard to ensure response.data is EmployeeDetail[]
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
          setFilteredEmployees(response.data);
        } else {
          throw new Error('Invalid response format');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee details');
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [token]);

  useEffect(() => {
    const filtered = employees.filter((employee) =>
      Object.values(employee).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 w-full rounded"
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Level</th>
            <th className="border p-2">Service</th>
            <th className="border p-2">Group</th>
            <th className="border p-2">Qualification</th>
            <th className="border p-2">Seniority</th>
            <th className="border p-2">Retirement</th>
            <th className="border p-2">Mobile No</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.employee_id} className="border">
              <td className="border p-2">{employee.employee_id}</td>
              <td className="border p-2">{employee.name || 'N/A'}</td>
              <td className="border p-2">{employee.email}</td>
              <td className="border p-2">{employee.position || 'N/A'}</td>
              <td className="border p-2">{employee.level || 'N/A'}</td>
              <td className="border p-2">{employee.service || 'N/A'}</td>
              <td className="border p-2">{employee.group || 'N/A'}</td>
              <td className="border p-2">{employee.qualification || 'N/A'}</td>
              <td className="border p-2">{employee.seniority || 'N/A'}</td>
              <td className="border p-2">{employee.retirement || 'N/A'}</td>
              <td className="border p-2">{employee.mno || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDetailList;


// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';

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

// const EmployeeDetailList = () => {
//   const { token } = useAuth();
//   const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<EmployeeDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get('${import.meta.env.VITE_API_BASE_URL}/api/users/employee-details/', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setEmployees(response.data);
//         setFilteredEmployees(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch employee details');
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, [token]);

//   useEffect(() => {
//     const filtered = employees.filter((employee) =>
//       Object.values(employee).some((value) =>
//         value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//     setFilteredEmployees(filtered);
//   }, [searchTerm, employees]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search employees..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//           className="border p-2 w-full rounded"
//         />
//       </div>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Employee ID</th>
//             <th className="border p-2">Name</th>
//             <th className="border p-2">Email</th>
//             <th className="border p-2">Position</th>
//             <th className="border p-2">Level</th>
//             <th className="border p-2">Service</th>
//             <th className="border p-2">Group</th>
//             <th className="border p-2">Qualification</th>
//             <th className="border p-2">Seniority</th>
//             <th className="border p-2">Retirement</th>
//             <th className="border p-2">Mobile No</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredEmployees.map((employee) => (
//             <tr key={employee.employee_id} className="border">
//               <td className="border p-2">{employee.employee_id}</td>
//               <td className="border p-2">{employee.name || 'N/A'}</td>
//               <td className="border p-2">{employee.email}</td>
//               <td className="border p-2">{employee.position || 'N/A'}</td>
//               <td className="border p-2">{employee.level || 'N/A'}</td>
//               <td className="border p-2">{employee.service || 'N/A'}</td>
//               <td className="border p-2">{employee.group || 'N/A'}</td>
//               <td className="border p-2">{employee.qualification || 'N/A'}</td>
//               <td className="border p-2">{employee.seniority || 'N/A'}</td>
//               <td className="border p-2">{employee.retirement || 'N/A'}</td>
//               <td className="border p-2">{employee.mno || 'N/A'}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default EmployeeDetailList;