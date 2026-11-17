import * as userService from '../services/userService.js';

export async function getMe(req, res) {
  const user = await userService.getMyPage(req.user.id);
  res.json({ user });
}

export async function updateMe(req, res) {
  const user = await userService.updateProfile(req.user.id, req.valid.body);
  res.json({ user });
}

export async function uploadProfileImage(req, res) {
  const user = await userService.updateProfileImage(req.user.id, req.file);
  res.json({ user });
}

export async function changePassword(req, res) {
  const result = await userService.changePassword(req.user.id, req.valid.body);
  res.json(result); // { token }
}

export async function deleteAccount(req, res) {
  await userService.deleteAccount(req.user.id, req.valid.body);
  res.status(204).end();
}

export async function deleteProfileImage(req, res) {
  const user = await userService.removeProfileImage(req.user.id);
  res.json({ user });
}
