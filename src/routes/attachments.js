const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { HttpError, bad, wrap, posInt, audit, timeline } = require('../util');

const DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(DIR, { recursive: true });
const EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'application/pdf': '.pdf' };
const SIG = {
  'image/png': b => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8,
  'image/webp': b => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
  'application/pdf': b => b.subarray(0, 4).toString() === '%PDF'
};
const upload = multer({
  storage: multer.diskStorage({ destination: DIR, filename: (_q, f, cb) => cb(null, crypto.randomBytes(16).toString('hex') + (EXT[f.mimetype] || '')) }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_q, f, cb) => EXT[f.mimetype] ? cb(null, true) : cb(bad('Only PNG, JPEG, WebP or PDF files are accepted'))
});

router.get('/incidents/:id/attachments', wrap(async (req, res) => {
  const [rows] = await db.query(
    'SELECT a.attachment_id, a.file_name, a.mime, a.size_bytes, a.uploaded_at, u.full_name AS uploader FROM incident_attachments a JOIN users u ON u.user_id = a.uploaded_by WHERE a.incident_id = ? ORDER BY a.attachment_id',
    [posInt(req.params.id, 'id')]);
  res.json(rows);
}));

router.post('/incidents/:id/attachments', upload.single('file'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  if (!req.file) throw bad('Choose a file to upload');
  const drop = () => fs.unlink(req.file.path, () => {});
  const fd = fs.openSync(req.file.path, 'r'), head = Buffer.alloc(12);
  fs.readSync(fd, head, 0, 12, 0); fs.closeSync(fd);
  if (!SIG[req.file.mimetype](head)) { drop(); throw bad('File content does not match its type'); }
  const [[i]] = await db.query('SELECT 1 AS ok FROM incidents WHERE incident_id = ?', [id]);
  if (!i) { drop(); throw new HttpError(404, 'Incident not found'); }
  const name = path.basename(req.file.originalname).replace(/[\x00-\x1f"\\/]/g, '_').slice(0, 160) || 'file';
  const [r] = await db.query(
    'INSERT INTO incident_attachments (incident_id, file_name, file_path, uploaded_by, mime, size_bytes) VALUES (?,?,?,?,?,?)',
    [id, name, req.file.filename, req.user.id, req.file.mimetype, req.file.size]);
  await timeline(db, id, req.user.id, `Attachment added: ${name}`);
  await audit(db, req.user.id, 'upload', 'attachment', r.insertId, { name });
  res.status(201).json({ attachment_id: r.insertId });
}));

router.get('/attachments/:id/download', wrap(async (req, res) => {
  const [[a]] = await db.query('SELECT file_name, file_path, mime FROM incident_attachments WHERE attachment_id = ?', [posInt(req.params.id, 'id')]);
  if (!a) throw new HttpError(404, 'File not found');
  const full = path.join(DIR, path.basename(a.file_path));
  if (!fs.existsSync(full)) throw new HttpError(404, 'File is missing from storage');
  res.set('Content-Type', a.mime || 'application/octet-stream');
  res.download(full, a.file_name);
}));

router.delete('/attachments/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const [[a]] = await db.query('SELECT file_path, uploaded_by FROM incident_attachments WHERE attachment_id = ?', [id]);
  if (!a) throw new HttpError(404, 'File not found');
  if (a.uploaded_by !== req.user.id && !['admin', 'coordinator'].includes(req.user.role)) throw new HttpError(403, 'Only the uploader or a coordinator can delete this');
  await db.query('DELETE FROM incident_attachments WHERE attachment_id = ?', [id]);
  fs.unlink(path.join(DIR, path.basename(a.file_path)), () => {});
  await audit(db, req.user.id, 'delete', 'attachment', id);
  res.json({ ok: true });
}));

module.exports = router;
