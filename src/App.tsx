import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from "./components/layout/Navigation";
import Index from '@/pages/Index';
import CommitteePage from '@/pages/CommitteePage';
import CommitteeDetail from '@/components/committee/CommitteeDetail';
import SpecificationManagement from '@/components/specification/SpecificationManagement';
import Specifications from '@/pages/Specifications'; // Added
import NotFound from '@/pages/NotFound';
import TendersPage from '@/pages/TendersPages';
import ProcurementPlanPage from '@/pages/ProcurementPlanPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import Login from '@/components/auth/LoginForm';
import Register from '@/components/auth/RegistrationForm';
import EmployeeEdit from './components/employee/EmployeeEdit';
import CommitteeUpdate from './components/committee/edit/CommitteEdit';
import RoleHierarchyTree from './components/home/RoleHierarchyTree';
import {ExternalAgency} from '@/components/external-agency/ExternalAgency';
import ProjectDiscussion from '@/pages/ProjectDiscussion';
import Unauthorized from '@/pages/Unauthorized';

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import './App.css';
import UserList from './components/auth/UserList';
import EmployeeDetailList from './components/auth/EmployeeDetail';
import CreateUser from './components/auth/CreateUser';

import CreatedUserList from './components/CreatedUserList';
import PrivateRoute from './components/PrivateRoute';

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role?.role_name && !allowedRoles.includes(user.role.role_name)) {
    console.log(`ProtectedRoute: User role ${user.role.role_name} not allowed, redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/committee" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
              <Route path="/committee/create" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
              <Route path="/committees/:id" element={<ProtectedRoute><CommitteeDetail /></ProtectedRoute>} />
              <Route path="/specifications" element={<ProtectedRoute><Specifications /></ProtectedRoute>} /> {/* Added */}
              <Route path="/specification/:id" element={<ProtectedRoute><SpecificationManagement /></ProtectedRoute>} />
              <Route path="/tenders" element={<ProtectedRoute><TendersPage /></ProtectedRoute>} />
              <Route path="/procurement-plan" element={<ProtectedRoute><ProcurementPlanPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
              <Route path="/employee-details" element={<EmployeeDetailList />} />
              <Route path="/employees/edit/:userId" element={<ProtectedRoute><EmployeeEdit /></ProtectedRoute>} />
              <Route path="/committees/edit/:committeeId" element={<ProtectedRoute><CommitteeUpdate /></ProtectedRoute>} />
              <Route path="/role-hierarchy" element={<ProtectedRoute><RoleHierarchyTree /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><ExternalAgency /></ProtectedRoute>} />
              <Route path="/project/:id" element={<ProtectedRoute><ProjectDiscussion /></ProtectedRoute>} />
              <Route path="/create-user" element={<ProtectedRoute ><CreateUser /></ProtectedRoute>} />
              <Route
                path="/created-user"
                element={<PrivateRoute component={CreatedUserList} />}
              />
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Navigation from "./components/layout/Navigation";
// import Index from '@/pages/Index';
// import CommitteePage from '@/pages/CommitteePage';
// import CommitteeDetail from '@/components/committee/CommitteeDetail';
// import SpecificationManagement from '@/components/specification/SpecificationManagement';
// import NotFound from '@/pages/NotFound';
// import TendersPage from '@/pages/TendersPage';
// import ProcurementPlanPage from '@/pages/ProcurementPlanPage';
// import NotificationsPage from '@/pages/NotificationsPage';
// import SettingsPage from '@/pages/SettingsPage';
// import Login from '@/components/auth/LoginForm';
// import Register from '@/components/auth/RegistrationForm';
// import EmployeeEdit from './components/employee/EmployeeEdit';
// import CommitteeUpdate from './components/committee/edit/CommitteEdit';
// import RoleHierarchyTree from './components/home/RoleHierarchyTree';
// import {ExternalAgency} from '@/components/external-agency/ExternalAgency'; // Import ExternalAgency
// import ProjectDiscussion from '@/pages/ProjectDiscussion';
// import Unauthorized from '@/pages/Unauthorized';

// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import { Toaster } from "@/components/ui/toaster";
// import './App.css';
// import UserList from './components/auth/UserList';
// import EmployeeDetailList from './components/auth/EmployeeDetail';
// import CreateUser from './components/auth/CreateUser';

// import CreatedUserList from './components/CreatedUserList';
// import PrivateRoute from './components/PrivateRoute';

// const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     console.log("ProtectedRoute: Not authenticated, redirecting to /login");
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && user?.role?.role_name && !allowedRoles.includes(user.role.role_name)) {
//     console.log(`ProtectedRoute: User role ${user.role.role_name} not allowed, redirecting to /unauthorized`);
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="min-h-screen">
//           <Navigation />
//           <main>
//             <Routes>
//               {/* Public routes */}
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
//               {/* <Route path="/reset-password/:uid/:token" element={<ResetPassword />} /> */}
//               <Route path="/unauthorized" element={<Unauthorized />} />

//               {/* Protected routes */}
//               <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
//               <Route path="/committee" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
//               <Route path="/committee/create" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
//               <Route path="/committees/:id" element={<ProtectedRoute><CommitteeDetail /></ProtectedRoute>} />
//               <Route path="/specification/:id" element={<ProtectedRoute><SpecificationManagement /></ProtectedRoute>} />
//               <Route path="/tenders" element={<ProtectedRoute><TendersPage /></ProtectedRoute>} />
//               <Route path="/procurement-plan" element={<ProtectedRoute><ProcurementPlanPage /></ProtectedRoute>} />
//               <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
//               <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
//               <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
//               <Route path="/employee-details" element={<EmployeeDetailList />} />
//               <Route path="/employees/edit/:userId" element={<ProtectedRoute><EmployeeEdit /></ProtectedRoute>} />
//               <Route path="/committees/edit/:committeeId" element={<ProtectedRoute><CommitteeUpdate /></ProtectedRoute>} />
//               <Route path="/role-hierarchy" element={<ProtectedRoute><RoleHierarchyTree /></ProtectedRoute>} />
//               <Route path="/complaints" element={<ProtectedRoute><ExternalAgency /></ProtectedRoute>} /> {/* Add Complaints route */}
//               <Route path="/project/:id" element={<ProtectedRoute><ProjectDiscussion /></ProtectedRoute>} />
//               <Route path="/create-user" element={<ProtectedRoute ><CreateUser /></ProtectedRoute>} />
//               <Route
//                           path="/created-user"
//                           element={<PrivateRoute component={CreatedUserList} />}
//                         />
//               {/* 404 route */}
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </main>
//           <Toaster />
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;


