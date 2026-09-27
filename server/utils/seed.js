import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Voucher from '../models/Voucher.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voucher_portal';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Voucher.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing database records.');

    // Create Manager
    const manager = await User.create({
      name: 'Sarah Connor (Manager)',
      email: 'manager@company.com',
      password: 'Password123',
      role: 'manager',
    });

    // Create Employees
    const emp1 = await User.create({
      name: 'John Doe (DevOps)',
      email: 'john.doe@company.com',
      password: 'Password123',
      role: 'employee',
    });

    const emp2 = await User.create({
      name: 'Jane Smith (Cloud Engineer)',
      email: 'jane.smith@company.com',
      password: 'Password123',
      role: 'employee',
    });

    const emp3 = await User.create({
      name: 'Alice Wong (Frontend Lead)',
      email: 'alice.wong@company.com',
      password: 'Password123',
      role: 'employee',
    });

    console.log('Created Manager & 3 Employees.');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90); // 90 days in future

    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 5); // 5 days in future

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days in past (Expired)

    // Seed Vouchers
    const vouchersData = [
      {
        code: 'AWS-ARCH-9001',
        name: 'AWS Solutions Architect Associate',
        category: 'Cloud',
        value: 300,
        expiryDate: futureDate,
        status: 'available',
        createdBy: manager._id,
      },
      {
        code: 'AWS-DEVOPS-9002',
        name: 'AWS DevOps Engineer Professional',
        category: 'Cloud',
        value: 300,
        expiryDate: futureDate,
        status: 'available',
        createdBy: manager._id,
      },
      {
        code: 'CKA-K8S-8001',
        name: 'Certified Kubernetes Administrator (CKA)',
        category: 'DevOps',
        value: 395,
        expiryDate: futureDate,
        status: 'available',
        createdBy: manager._id,
      },
      {
        code: 'GCP-PCA-7001',
        name: 'Google Cloud Professional Architect',
        category: 'Cloud',
        value: 200,
        expiryDate: nearExpiryDate,
        status: 'available',
        createdBy: manager._id,
      },
      // Expired voucher assigned to John Doe for Case 5 UI testing
      {
        code: 'EXPIRED-AZURE-100',
        name: 'Microsoft Azure Fundamentals (EXPIRED)',
        category: 'Cloud',
        value: 100,
        expiryDate: pastDate,
        status: 'assigned',
        assignedTo: emp1._id,
        assignedAt: new Date(),
        createdBy: manager._id,
      },
      // Pre-assigned voucher for testing employee redemption & manager revocation
      {
        code: 'SEC-COMPTIA-5001',
        name: 'CompTIA Security+ Certification',
        category: 'Security',
        value: 370,
        expiryDate: futureDate,
        status: 'assigned',
        assignedTo: emp1._id,
        assignedAt: new Date(),
        createdBy: manager._id,
      },
      // Pre-redeemed voucher for testing edge cases
      {
        code: 'CISSP-SEC-6001',
        name: 'CISSP Cybersecurity Master',
        category: 'Security',
        value: 749,
        expiryDate: futureDate,
        status: 'redeemed',
        assignedTo: emp2._id,
        assignedAt: new Date(Date.now() - 86400000),
        redeemedAt: new Date(),
        createdBy: manager._id,
      },
    ];

    const createdVouchers = await Voucher.insertMany(vouchersData);
    console.log(`Created ${createdVouchers.length} sample vouchers.`);

    // Audit logs for initial vouchers
    const auditLogs = createdVouchers.map((v) => ({
      voucher: v._id,
      voucherCode: v.code,
      action: v.status === 'assigned' ? 'ASSIGNED' : v.status === 'redeemed' ? 'REDEEMED' : 'CREATED',
      performedBy: manager._id,
      performedByName: manager.name,
      performedByRole: manager.role,
      targetEmployee: v.assignedTo || null,
      targetEmployeeName: v.assignedTo ? (v.assignedTo.toString() === emp1._id.toString() ? emp1.name : emp2.name) : null,
      details: `Initial database seed action for ${v.code}`,
    }));

    await AuditLog.insertMany(auditLogs);
    console.log('Created audit log entries.');

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
