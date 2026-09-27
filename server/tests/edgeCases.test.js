import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Voucher from '../models/Voucher.js';

let mongoServer;
let managerToken, employee1Token, employee2Token;
let managerUser, employee1User, employee2User;
let validAvailableVoucher, expiredVoucher, assignedVoucher, redeemedVoucher;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_123';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Voucher.deleteMany({});

  // Register Manager
  const mgrRes = await request(app).post('/api/auth/register').send({
    name: 'Test Manager',
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager',
  });
  managerToken = mgrRes.body.token;
  managerUser = mgrRes.body.user;

  // Register Employee 1
  const emp1Res = await request(app).post('/api/auth/register').send({
    name: 'Employee One',
    email: 'emp1@test.com',
    password: 'password123',
    role: 'employee',
  });
  employee1Token = emp1Res.body.token;
  employee1User = emp1Res.body.user;

  // Register Employee 2
  const emp2Res = await request(app).post('/api/auth/register').send({
    name: 'Employee Two',
    email: 'emp2@test.com',
    password: 'password123',
    role: 'employee',
  });
  employee2Token = emp2Res.body.token;
  employee2User = emp2Res.body.user;

  const future = new Date(Date.now() + 30 * 86400000);
  const past = new Date(Date.now() - 5 * 86400000);

  // Available valid voucher
  validAvailableVoucher = await Voucher.create({
    code: 'AWS-AVAIL-100',
    name: 'AWS Solutions Architect',
    category: 'Cloud',
    value: 300,
    expiryDate: future,
    status: 'available',
    createdBy: managerUser.id,
  });

  // Expired voucher
  expiredVoucher = await Voucher.create({
    code: 'AWS-EXPIRED-200',
    name: 'AWS SysOps (Expired)',
    category: 'Cloud',
    value: 200,
    expiryDate: past,
    status: 'available',
    createdBy: managerUser.id,
  });

  // Assigned voucher to Employee 1
  assignedVoucher = await Voucher.create({
    code: 'AZURE-ASSIGNED-300',
    name: 'Azure Administrator',
    category: 'Cloud',
    value: 250,
    expiryDate: future,
    status: 'assigned',
    assignedTo: employee1User.id,
    assignedAt: new Date(),
    createdBy: managerUser.id,
  });

  // Redeemed voucher by Employee 1
  redeemedVoucher = await Voucher.create({
    code: 'CKA-REDEEMED-400',
    name: 'CKA Kubernetes',
    category: 'DevOps',
    value: 395,
    expiryDate: future,
    status: 'redeemed',
    assignedTo: employee1User.id,
    assignedAt: new Date(Date.now() - 86400000),
    redeemedAt: new Date(),
    createdBy: managerUser.id,
  });
});

describe('Employee Certification Portal - Edge Cases Verification (Section 7)', () => {
  // Case 1: Manager tries to assign a voucher that has already been assigned
  test('Case 1: Manager tries to assign a voucher that has already been assigned', async () => {
    const res = await request(app)
      .post('/api/vouchers/assign')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        voucherId: assignedVoucher._id,
        employeeId: employee2User.id,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VOUCHER_ALREADY_ASSIGNED');
  });

  // Case 2: Manager tries to assign an expired voucher
  test('Case 2: Manager tries to assign an expired voucher', async () => {
    const res = await request(app)
      .post('/api/vouchers/assign')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        voucherId: expiredVoucher._id,
        employeeId: employee1User.id,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VOUCHER_EXPIRED');
  });

  // Case 3: Employee tries to redeem another employee\'s voucher
  test("Case 3: Employee tries to redeem another employee's voucher", async () => {
    const res = await request(app)
      .post(`/api/vouchers/${assignedVoucher._id}/redeem`)
      .set('Authorization', `Bearer ${employee2Token}`)
      .send();

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED_VOUCHER_REDEMPTION');
  });

  // Case 4: Employee tries to redeem an already redeemed voucher
  test('Case 4: Employee tries to redeem an already redeemed voucher', async () => {
    const res = await request(app)
      .post(`/api/vouchers/${redeemedVoucher._id}/redeem`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VOUCHER_ALREADY_REDEEMED');
  });

  // Case 5: Employee tries to redeem an expired voucher
  test('Case 5: Employee tries to redeem an expired voucher', async () => {
    // Assign expired voucher to employee 1 directly for test
    expiredVoucher.assignedTo = employee1User.id;
    expiredVoucher.status = 'assigned';
    await expiredVoucher.save();

    const res = await request(app)
      .post(`/api/vouchers/${expiredVoucher._id}/redeem`)
      .set('Authorization', `Bearer ${employee1Token}`)
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VOUCHER_EXPIRED');
  });

  // Case 6: Manager tries to revoke a voucher that has already been redeemed
  test('Case 6: Manager tries to revoke a voucher that has already been redeemed', async () => {
    const res = await request(app)
      .post(`/api/vouchers/${redeemedVoucher._id}/revoke`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('CANNOT_REVOKE_REDEEMED_VOUCHER');
  });

  // Case 7: Invalid employee or voucher ID is provided
  test('Case 7: Invalid employee or voucher ID is provided', async () => {
    const res = await request(app)
      .post('/api/vouchers/assign')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        voucherId: 'invalid-object-id-123',
        employeeId: employee1User.id,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_VOUCHER_ID');
  });

  // Case 8: Required information is missing from the request
  test('Case 8: Required information is missing from the request', async () => {
    const res = await request(app)
      .post('/api/vouchers/assign')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        voucherId: validAvailableVoucher._id,
        // employeeId missing
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('MISSING_REQUIRED_FIELDS');
  });
});
