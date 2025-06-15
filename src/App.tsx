
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

const MainLayout = ({ children }: { children: React.ReactNode }) => {
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
            {/* Public routes without sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* All other routes with sidebar - accessible to everyone */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/committee" element={<CommitteePage />} />
                  <Route path="/committee/create" element={<CommitteePage />} />
                  <Route path="/committees/:id" element={<CommitteeDetail />} />
                  <Route path="/specifications" element={<Specifications />} />
                  <Route path="/specification/:id" element={<SpecificationManagement />} />
                  <Route path="/tenders" element={<TendersPage />} />
                  <Route path="/procurement-plan" element={<ProcurementPlanPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/employee-details" element={<EmployeeDetailList />} />
                  <Route path="/employees/edit/:userId" element={<EmployeeEdit />} />
                  <Route path="/committees/edit/:committeeId" element={<CommitteeUpdate />} />
                  <Route path="/role-hierarchy" element={<RoleHierarchyTree />} />
                  <Route path="/complaints" element={<ExternalAgency />} />
                  <Route path="/project/:id" element={<ProjectDiscussion />} />
                  <Route path="/create-user" element={<CreateUser />} />
                  <Route path="/created-user" element={<PrivateRoute component={CreatedUserList} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
