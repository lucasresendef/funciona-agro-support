import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { InventoryBalancePage } from "@/modules/admin/InventoryBalancePage";
import { InventoryLocationsPage } from "@/modules/admin/InventoryLocationsPage";
import { LoginPage } from "@/modules/auth/LoginPage";
import { FarmPermissionsPage } from "@/modules/farm-permissions/FarmPermissionsPage";
import { FarmsPage } from "@/modules/farms/FarmsPage";
import { FieldsPage } from "@/modules/fields/FieldsPage";
import { HomePage } from "@/modules/home/HomePage";
import { FieldReportPage } from "@/modules/insights/FieldReportPage";
import { MetricsPage } from "@/modules/insights/MetricsPage";
import { OperationsPage } from "@/modules/operations/OperationsPage";
import { ProductsPage } from "@/modules/products/ProductsPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { NewTenantPage } from "@/modules/tenants/NewTenantPage";
import { TenantDetailPage } from "@/modules/tenants/TenantDetailPage";
import { TenantsPage } from "@/modules/tenants/TenantsPage";
import { UnitsPage } from "@/modules/units/UnitsPage";
import { UsersPage } from "@/modules/users/UsersPage";
import { AccessDeniedPage } from "@/pages/AccessDeniedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { routes } from "@/shared/config/routes";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppAdminGuard } from "./guards/AppAdminGuard";
import { AuthGuard } from "./guards/AuthGuard";
import { SupportAdminGuard } from "./guards/SupportAdminGuard";
import { TenantMemberGuard } from "./guards/TenantMemberGuard";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: routes.login, element: <LoginPage /> },
      { path: routes.accessDenied, element: <AccessDeniedPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          { path: routes.home, element: <HomePage /> },
          { path: routes.units, element: <UnitsPage /> },
          {
            element: <SupportAdminGuard />,
            children: [
              { path: routes.tenants, element: <TenantsPage /> },
              { path: routes.tenantsNew, element: <NewTenantPage /> },
              { path: routes.tenantDetail, element: <TenantDetailPage /> },
              { path: routes.supportUnits, element: <Navigate to={routes.units} replace /> },
              { path: routes.supportProducts, element: <Navigate to={routes.tenants} replace /> },
            ],
          },
          {
            element: <TenantMemberGuard />,
            children: [
              { path: routes.farms, element: <FarmsPage /> },
              { path: routes.fields, element: <FieldsPage /> },
              { path: routes.products, element: <ProductsPage /> },
              { path: routes.operations, element: <OperationsPage /> },
              { path: routes.metrics, element: <MetricsPage /> },
              { path: routes.fieldReport, element: <FieldReportPage /> },
            ],
          },
          {
            element: <AppAdminGuard />,
            children: [
              { path: routes.users, element: <UsersPage /> },
              { path: routes.farmPermissions, element: <FarmPermissionsPage /> },
              { path: routes.inventoryLocations, element: <InventoryLocationsPage /> },
              { path: routes.inventoryBalance, element: <InventoryBalancePage /> },
              { path: routes.reports, element: <ReportsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to={routes.home} replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
