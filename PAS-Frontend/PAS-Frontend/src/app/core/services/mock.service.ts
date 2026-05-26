import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockService {

  employees = [
    { id: '1', employeeCode: 'EMP-001', fullName: 'Abebe Girma', department: 'IT', position: 'Developer', email: 'abebe@africom.et', phone: '0911000001', isActive: true },
    { id: '2', employeeCode: 'EMP-002', fullName: 'Tigist Haile', department: 'Finance', position: 'Accountant', email: 'tigist@africom.et', phone: '0911000002', isActive: true },
    { id: '3', employeeCode: 'EMP-003', fullName: 'Dawit Bekele', department: 'HR', position: 'Manager', email: 'dawit@africom.et', phone: '0911000003', isActive: false },
    { id: '4', employeeCode: 'EMP-004', fullName: 'Sara Tesfaye', department: 'Procurement', position: 'Officer', email: 'sara@africom.et', phone: '0911000004', isActive: true },
    { id: '5', employeeCode: 'EMP-005', fullName: 'Yonas Alemu', department: 'IT', position: 'Network Engineer', email: 'yonas@africom.et', phone: '0911000005', isActive: true },
  ];

  properties = [
    { id: '1', propertyCode: 'PROP-001', name: 'Dell Laptop XPS 15', category: 'Electronics', condition: 'Good', location: 'Office A', isActive: true, acquisitionDate: '2023-01-15' },
    { id: '2', propertyCode: 'PROP-002', name: 'HP Printer LaserJet', category: 'Electronics', condition: 'Fair', location: 'Office B', isActive: true, acquisitionDate: '2022-06-20' },
    { id: '3', propertyCode: 'PROP-003', name: 'Office Chair Executive', category: 'Furniture', condition: 'Good', location: 'Conference Room', isActive: true, acquisitionDate: '2023-03-10' },
    { id: '4', propertyCode: 'PROP-004', name: 'Conference Table', category: 'Furniture', condition: 'Good', location: 'Conference Room', isActive: true, acquisitionDate: '2021-11-05' },
    { id: '5', propertyCode: 'PROP-005', name: 'Projector Epson', category: 'Electronics', condition: 'Poor', location: 'Training Room', isActive: false, acquisitionDate: '2020-08-15' },
  ];

  inventory = [
    { id: '1', itemCode: 'ITM-001', name: 'A4 Paper Ream', category: 'Stationery', unit: 'Ream', quantity: 150, minimumQuantity: 20, location: 'Store A', isActive: true },
    { id: '2', itemCode: 'ITM-002', name: 'Toner Cartridge HP', category: 'Electronics', unit: 'Pcs', quantity: 5, minimumQuantity: 10, location: 'Store B', isActive: true },
    { id: '3', itemCode: 'ITM-003', name: 'Ballpoint Pens Box', category: 'Stationery', unit: 'Box', quantity: 30, minimumQuantity: 5, location: 'Store A', isActive: true },
    { id: '4', itemCode: 'ITM-004', name: 'Cleaning Supplies', category: 'Maintenance', unit: 'Set', quantity: 8, minimumQuantity: 3, location: 'Store C', isActive: true },
    { id: '5', itemCode: 'ITM-005', name: 'Network Cable Cat6', category: 'IT Supplies', unit: 'Meter', quantity: 200, minimumQuantity: 50, location: 'IT Store', isActive: true },
  ];

  inspections = [
    { id: '1', inspectionCode: 'INS-001', propertyName: 'Dell Laptop XPS 15', inspectorName: 'Yonas Alemu', status: 'Completed', scheduledDate: '2025-01-10', completedDate: '2025-01-10', findings: 'Good condition' },
    { id: '2', inspectionCode: 'INS-002', propertyName: 'HP Printer LaserJet', inspectorName: 'Sara Tesfaye', status: 'Pending', scheduledDate: '2025-05-20', completedDate: '', findings: '' },
    { id: '3', inspectionCode: 'INS-003', propertyName: 'Projector Epson', inspectorName: 'Dawit Bekele', status: 'Failed', scheduledDate: '2025-02-15', completedDate: '2025-02-15', findings: 'Needs replacement' },
    { id: '4', inspectionCode: 'INS-004', propertyName: 'Conference Table', inspectorName: 'Tigist Haile', status: 'InProgress', scheduledDate: '2025-05-12', completedDate: '', findings: '' },
  ];

  notifications = [
    { id: '1', title: 'Low Stock Alert', message: 'Toner Cartridge HP is below minimum stock level', type: 'Warning', isRead: false, createdAt: '2025-05-10T09:00:00' },
    { id: '2', title: 'Inspection Due', message: 'HP Printer LaserJet inspection is scheduled for today', type: 'Info', isRead: false, createdAt: '2025-05-11T08:00:00' },
    { id: '3', title: 'Transfer Approved', message: 'Your transfer request TRF-001 has been approved', type: 'Success', isRead: true, createdAt: '2025-05-09T14:00:00' },
    { id: '4', title: 'System Update', message: 'PAS system will be updated tonight at 10 PM', type: 'Info', isRead: true, createdAt: '2025-05-08T10:00:00' },
  ];

  suppliers = [
    { id: '1', supplierName: 'Tech Solutions PLC', contactPerson: 'Abebe Tekle', phone: '0111234567', email: 'info@techsolutions.et', tinNumber: '0012345678', isActive: true },
    { id: '2', supplierName: 'Office Pro Ethiopia', contactPerson: 'Meron Hailu', phone: '0119876543', email: 'contact@officepro.et', tinNumber: '0087654321', isActive: true },
    { id: '3', supplierName: 'Global IT Supplies', contactPerson: 'Solomon Kebede', phone: '0115554433', email: 'sales@globalit.et', tinNumber: '0056781234', isActive: true },
  ];

  receiving = [
    { id: '1', grnNumber: 'GRN-001', status: 'Approved', receivedDate: '2025-04-15', notes: 'All items received in good condition' },
    { id: '2', grnNumber: 'GRN-002', status: 'Pending', receivedDate: '2025-05-10', notes: 'Awaiting inspection' },
    { id: '3', grnNumber: 'GRN-003', status: 'Rejected', receivedDate: '2025-03-20', notes: 'Items damaged during transit' },
  ];

  transfers = [
    { id: '1', fromLocation: 'Store A', toLocation: 'Office B', status: 'Completed', transferDate: '2025-04-10', reason: 'Department request' },
    { id: '2', fromLocation: 'IT Store', toLocation: 'Office A', status: 'Pending', transferDate: '2025-05-12', reason: 'New employee setup' },
    { id: '3', fromLocation: 'Store B', toLocation: 'Training Room', status: 'Completed', transferDate: '2025-03-25', reason: 'Training materials' },
  ];

  disposals = [
    { id: '1', disposalMethod: 'Auction', reason: 'End of life', status: 'Approved', disposalDate: '2025-03-01', approvedBy: 'Admin' },
    { id: '2', disposalMethod: 'Scrap', reason: 'Beyond repair', status: 'Pending', disposalDate: '2025-05-15', approvedBy: null },
    { id: '3', disposalMethod: 'Donation', reason: 'Surplus equipment', status: 'Approved', disposalDate: '2025-02-10', approvedBy: 'Manager' },
  ];

  requisitions = [
    { id: '1', srNumber: 'SR-001', status: 'Approved', requestedBy: 'Abebe Girma', createdAt: '2025-04-01', notes: 'Urgent office supplies' },
    { id: '2', srNumber: 'SR-002', status: 'Pending', requestedBy: 'Tigist Haile', createdAt: '2025-05-10', notes: 'Monthly stationery' },
    { id: '3', srNumber: 'SR-003', status: 'Rejected', requestedBy: 'Dawit Bekele', createdAt: '2025-03-15', notes: 'Out of budget' },
    { id: '4', srNumber: 'SR-004', status: 'Draft', requestedBy: 'Sara Tesfaye', createdAt: '2025-05-11', notes: 'IT equipment request' },
  ];

  vouchers = [
    { id: '1', sivNumber: 'SIV-001', issuedTo: 'IT Department', status: 'Issued', issueDate: '2025-04-05' },
    { id: '2', sivNumber: 'SIV-002', issuedTo: 'Finance Department', status: 'Pending', issueDate: '2025-05-11' },
    { id: '3', sivNumber: 'SIV-003', issuedTo: 'HR Department', status: 'Cancelled', issueDate: '2025-03-20' },
  ];

  items = [
    { id: '1', sku: 'SKU-001', itemName: 'A4 Paper', category: 'Stationery', unitOfMeasure: 'Ream', minimumStockLevel: 20, description: 'Standard A4 paper' },
    { id: '2', sku: 'SKU-002', itemName: 'Toner HP 85A', category: 'Electronics', unitOfMeasure: 'Pcs', minimumStockLevel: 5, description: 'HP LaserJet toner' },
    { id: '3', sku: 'SKU-003', itemName: 'Network Switch 24-Port', category: 'IT Equipment', unitOfMeasure: 'Pcs', minimumStockLevel: 2, description: 'Managed network switch' },
  ];

  warehouses = [
    { id: '1', warehouseName: 'Main Warehouse', locationCode: 'WH-001', capacity: 1000, description: 'Primary storage facility' },
    { id: '2', warehouseName: 'IT Store', locationCode: 'WH-002', capacity: 200, description: 'IT equipment storage' },
    { id: '3', warehouseName: 'Stationery Store', locationCode: 'WH-003', capacity: 500, description: 'Office supplies storage' },
  ];

  users = [
    { id: '1', username: 'admin', fullName: 'System Administrator', email: 'admin@africom.et', isActive: true, roles: ['Admin'] },
    { id: '2', username: 'manager1', fullName: 'Abebe Manager', email: 'manager@africom.et', isActive: true, roles: ['Manager'] },
    { id: '3', username: 'staff1', fullName: 'Tigist Staff', email: 'staff@africom.et', isActive: true, roles: ['Staff'] },
    { id: '4', username: 'inspector1', fullName: 'Dawit Inspector', email: 'inspector@africom.et', isActive: false, roles: ['Inspector'] },
  ];

  roles = [
    { id: '1', name: 'Admin', description: 'Full system access', permissions: ['all'] },
    { id: '2', name: 'Manager', description: 'Manage operations', permissions: ['read', 'write', 'approve'] },
    { id: '3', name: 'Staff', description: 'Basic access', permissions: ['read', 'write'] },
    { id: '4', name: 'Inspector', description: 'Inspection access', permissions: ['read', 'inspect'] },
    { id: '5', name: 'Approver', description: 'Approval access', permissions: ['read', 'approve'] },
    { id: '6', name: 'StoreOfficer', description: 'Store management', permissions: ['read', 'write', 'store'] },
  ];

  dashboard = {
    totalProperties: 5,
    totalEmployees: 5,
    totalInventoryItems: 5,
    pendingInspections: 2,
    pendingRequisitions: 2,
    pendingReceiving: 1,
    totalSuppliers: 3,
    totalWarehouses: 3
  };
}