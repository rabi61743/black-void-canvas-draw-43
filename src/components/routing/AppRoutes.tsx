
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
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
import EmployeeEdit from '@/components/employee/EmployeeEdit';
import CommitteeUpdate from '@/components/committee/edit/CommitteEdit';
import RoleHierarchyTree from '@/components/home/RoleHierarchyTree';
import { ExternalAgency } from '@/components/external-agency/ExternalAgency';
import ProjectDiscussion from '@/pages/ProjectDiscussion';
import Unauthorized from '@/pages/Unauthorized';
import UserList from '@/components/auth/UserList';
import EmployeeDetailList from '@/components/auth/EmployeeDetail';
import CreateUser from '@/components/auth/CreateUser';
import CreatedUserList from '@/components/CreatedUserList';
import PrivateRoute from '@/components/PrivateRoute';
import { MainLayout } from '@/components/layout/MainLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes without sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* All other routes with conditional sidebar */}
      <Route path="/*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/committee" element={
              <ProtectedRoute>
                <CommitteePage />
              </ProtectedRoute>
            } />
            <Route path="/committee/create" element={
              <ProtectedRoute>
                <CommitteePage />
              </ProtectedRoute>
            } />
            <Route path="/committees/:id" element={
              <ProtectedRoute>
                <CommitteeDetail />
              </ProtectedRoute>
            } />
            <Route path="/specifications" element={
              <ProtectedRoute>
                <Specifications />
              </ProtectedRoute>
            } />
            <Route path="/specification/:id" element={
              <ProtectedRoute>
                <SpecificationManagement />
              </ProtectedRoute>
            } />
            <Route path="/tenders" element={
              <ProtectedRoute>
                <TendersPage />
              </ProtectedRoute>
            } />
            <Route path="/procurement-plan" element={
              <ProtectedRoute>
                <ProcurementPlanPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            } />
            <Route path="/employee-details" element={
              <ProtectedRoute>
                <EmployeeDetailList />
              </ProtectedRoute>
            } />
            <Route path="/employees/edit/:userId" element={
              <ProtectedRoute>
                <EmployeeEdit />
              </ProtectedRoute>
            } />
            <Route path="/committees/edit/:committeeId" element={
              <ProtectedRoute>
                <CommitteeUpdate />
              </ProtectedRoute>
            } />
            <Route path="/role-hierarchy" element={
              <ProtectedRoute>
                <RoleHierarchyTree />
              </ProtectedRoute>
            } />
            <Route path="/complaints" element={
              <ProtectedRoute>
                <ExternalAgency />
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <ProjectDiscussion />
              </ProtectedRoute>
            } />
            <Route path="/create-user" element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            } />
            <Route path="/created-user" element={
              <ProtectedRoute>
                <PrivateRoute component={CreatedUserList} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
};
