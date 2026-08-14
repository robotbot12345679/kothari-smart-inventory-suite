export interface PermissionDef {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  group: string;
  permissions: PermissionDef[];
}

export const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    group: "Overview",
    permissions: [
      { key: "dashboard.view", label: "View Dashboard", description: "See the home dashboard and KPIs" },
      { key: "analytics.view", label: "View Analytics", description: "Access sales analytics and trends" },
      { key: "reports.view", label: "View Reports", description: "Access reports and exports" },
      { key: "organization.view", label: "View Organization", description: "See the list of users in the organization" },
    ],
  },
  {
    group: "Catalogue & Stock",
    permissions: [
      { key: "products.view", label: "View Products", description: "Browse the product catalogue" },
      { key: "products.manage", label: "Manage Products", description: "Create, edit and delete products" },
      { key: "categories.manage", label: "Manage Categories", description: "Create and edit product categories" },
      { key: "inventory.manage", label: "Manage Inventory", description: "Update stock levels and inventory" },
    ],
  },
  {
    group: "Sales",
    permissions: [
      { key: "pos.use", label: "Use Point of Sale", description: "Run the POS and complete payments" },
      { key: "orders.view", label: "View Orders", description: "See orders and invoices" },
      { key: "orders.manage", label: "Manage Orders", description: "Create, edit and delete orders" },
      { key: "customers.view", label: "View Customers", description: "See the customer directory" },
      { key: "customers.manage", label: "Manage Customers", description: "Create, edit and delete customers" },
      { key: "shipping.manage", label: "Manage Shipping", description: "Update shipping and tracking" },
    ],
  },
  {
    group: "Purchasing & Billing",
    permissions: [
      { key: "suppliers.manage", label: "Manage Suppliers", description: "Suppliers, purchase bills and payments" },
      { key: "bills.view", label: "View Bills Report", description: "Access the bills report" },
      { key: "settings.billing", label: "Billing Settings", description: "Change the shop billing and receipt template" },
    ],
  },
  {
    group: "Administration",
    permissions: [
      { key: "admin.access", label: "Admin Panel", description: "Access the admin panel, backups and access levels" },
    ],
  },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_CATALOG.flatMap((g) =>
  g.permissions.map((p) => p.key)
);

export const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  PERMISSION_CATALOG.flatMap((g) => g.permissions.map((p) => [p.key, p.label]))
);

/** Permission required to open each route. `null` means always available. */
export const ROUTE_PERMISSIONS: Record<string, string | null> = {
  "/dashboard": "dashboard.view",
  "/products": "products.view",
  "/orders": "orders.view",
  "/customers": "customers.view",
  "/reports": "reports.view",
  "/settings": null,
  "/pos": "pos.use",
  "/analytics": "analytics.view",
  "/shipping": "shipping.manage",
  "/inventory": "inventory.manage",
  "/bills": "bills.view",
  "/suppliers": "suppliers.manage",
  "/product-comparison": "products.view",
  "/organization": "organization.view",
  "/admin": "admin.access",
};

export const DEFAULT_USER_PASSWORD = "user@4646";
