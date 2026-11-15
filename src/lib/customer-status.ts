export type CustomerStatus = "Active" | "Inactive";

export const normalizeCustomerStatus = (status?: string | null): CustomerStatus =>
  status?.trim().toLowerCase() === "inactive" ? "Inactive" : "Active";