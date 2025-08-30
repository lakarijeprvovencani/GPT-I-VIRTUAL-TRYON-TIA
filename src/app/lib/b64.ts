export async function fileToB64(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  return buf.toString('base64');
}
