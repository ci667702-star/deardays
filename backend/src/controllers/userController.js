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

export async function deleteProfileImage(req, res) {
  const user = await userService.removeProfileImage(req.user.id);
  res.json({ user });
}
