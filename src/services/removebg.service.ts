import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { buildPublicUrl, ensureUploadDir } from './storage.service';

export async function removeImageBackground(imageUrl: string): Promise<string> {
  ensureUploadDir();

  const blob = await removeBackground(imageUrl);

  const buffer = Buffer.from(await blob.arrayBuffer());
  const filename = `${uuidv4()}-nobg.png`;
  const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
  const filePath = path.resolve(uploadDir, filename);

  fs.writeFileSync(filePath, buffer);

  return buildPublicUrl(filename);
}
