import test from 'node:test';
import assert from 'node:assert/strict';
import * as userModel from '../src/models/userModel.js';

test('mock authentication should accept the seeded admin credentials', async () => {
  const user = await userModel.getUserByUsername('admin');
  assert.ok(user, 'admin user should exist in mock data');
  const isValid = await userModel.verifyPassword('Admin123!', user.password_hash, user.username);
  assert.equal(isValid, true);
});

test('mock registration should persist a created user', async () => {
  const created = await userModel.createUser({
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'Secret123!',
    role: 'user'
  });

  const found = await userModel.getUserByUsername('newuser');

  assert.ok(created.id, 'created user should have an id');
  assert.equal(found.username, 'newuser');
  assert.equal(found.email, 'newuser@example.com');

  const isValid = await userModel.verifyPassword('Secret123!', found.password_hash, found.username);
  assert.equal(isValid, true, 'a registered mock user should be able to sign in');
});
