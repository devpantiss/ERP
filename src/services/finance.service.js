import { createCrudService } from "./mockApiClient.js"

export const financeService = {
  invoices: createCrudService("invoices"),
  salaries: createCrudService("salaries"),
  reimbursements: createCrudService("reimbursements"),
  revenue: createCrudService("revenue"),
  procurements: createCrudService("procurements"),
}
