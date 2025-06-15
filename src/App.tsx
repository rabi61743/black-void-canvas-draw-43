
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/layout/AppSidebar";
import Index from '@/pages/Index';
import CommitteePage from '@/pages/CommitteePage';
import CommitteeDetail from '@/components/committee/CommitteeDetail';
import SpecificationManagement from '@/components/specification/SpecificationManagement';
import Specifications from '@/pages/Specifications';
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

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Procurement Portal</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-white min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public routes - no sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes - with sidebar */}
            <Route path="/*" element={
              <AuthenticatedLayout>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/committee" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
                  <Route path="/committee/create" element={<ProtectedRoute><CommitteePage /></ProtectedRoute>} />
                  <Route path="/committees/:id" element={<ProtectedRoute><CommitteeDetail /></ProtectedRoute>} />
                  <Route path="/specifications" element={<ProtectedRoute><Specifications /></ProtectedRoute>} />
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
                  <Route path="/create-user" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
                  <Route path="/created-user" element={<PrivateRoute component={CreatedUserList} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthenticatedLayout>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
