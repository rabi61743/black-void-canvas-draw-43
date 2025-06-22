import { Link } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Procurement System</h1>
      <nav className="space-y-2">
        <Link to="/employee-details" className="block p-2 hover:bg-gray-700 rounded">
          Employee Details
        </Link>
        <Link to="/create-user" className="block p-2 hover:bg-gray-700 rounded">
          Create User
        </Link>
        <Link to="/created-user" className="block p-2xl rounded">
          Manage Users
        </Link>
      </nav>
      {/* Removed UserMenu */}
    </div>
  );
};

export default Sidebar;