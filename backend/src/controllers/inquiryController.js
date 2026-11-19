import * as inquiryService from '../services/inquiryService.js';

export async function listMine(req, res) {
  const items = await inquiryService.listMyInquiries(req.user.id);
  res.json({ items });
}

export async function create(req, res) {
  const inquiry = await inquiryService.createInquiry(req.user.id, req.valid.body);
  res.status(201).json({ inquiry });
}

export async function removeMine(req, res) {
  await inquiryService.deleteMyInquiry(req.user.id, req.valid.params.id);
  res.status(204).end();
}

export async function listForAdmin(req, res) {
  res.json(await inquiryService.listForAdmin(req.valid.query));
}

export async function updateForAdmin(req, res) {
  const inquiry = await inquiryService.updateForAdmin(req.valid.params.id, req.valid.body);
  res.json({ inquiry });
}

export async function removeForAdmin(req, res) {
  await inquiryService.deleteForAdmin(req.valid.params.id);
  res.status(204).end();
}
