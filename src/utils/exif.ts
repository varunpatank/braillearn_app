export async function parseExifGps(file: File): Promise<{ latitude: number; longitude: number } | null> {
  if (!file || !(file.type?.includes('jpeg') || file.type?.includes('jpg'))) return null;
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  const readUint16 = (off: number, little = false) => view.getUint16(off, little);
  const readUint32 = (off: number, little = false) => view.getUint32(off, little);

  if (readUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const len = readUint16(offset + 2, false);

    if (marker === 0xe1) {
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
        view.getUint8(offset + 8),
        view.getUint8(offset + 9)
      );

      if (exifHeader === 'Exif\0\0') {
        const tiffStart = offset + 10;
        const little = readUint16(tiffStart, false) === 0x4949; // 'II'
        const firstIFDOffset = readUint32(tiffStart + 4, little);
        const ifd0 = tiffStart + firstIFDOffset;
        const numEntries = readUint16(ifd0, little);

        let gpsPointer = 0;
        for (let i = 0; i < numEntries; i++) {
          const entry = ifd0 + 2 + i * 12;
          const tag = readUint16(entry, little);
          const value = readUint32(entry + 8, little);
          if (tag === 0x8825) {
            gpsPointer = tiffStart + value;
            break;
          }
        }

        if (!gpsPointer || gpsPointer >= view.byteLength) return null;

        const gpsEntries = readUint16(gpsPointer, little);
        let latRef: string | undefined;
        let lonRef: string | undefined;
        let latOffset = 0;
        let lonOffset = 0;

        for (let i = 0; i < gpsEntries; i++) {
          const entry = gpsPointer + 2 + i * 12;
          const tag = readUint16(entry, little);
          const valOffset = readUint32(entry + 8, little);

          if (tag === 0x0001) {
            const charCode = view.getUint8(entry + 8);
            latRef = String.fromCharCode(charCode);
          } else if (tag === 0x0003) {
            const charCode = view.getUint8(entry + 8);
            lonRef = String.fromCharCode(charCode);
          } else if (tag === 0x0002) {
            latOffset = tiffStart + valOffset;
          } else if (tag === 0x0004) {
            lonOffset = tiffStart + valOffset;
          }
        }

        const readRational = (off: number) => {
          const num = readUint32(off, little);
          const den = readUint32(off + 4, little);
          return den === 0 ? 0 : num / den;
        };

        if (latOffset && lonOffset) {
          try {
            const latDeg = readRational(latOffset);
            const latMin = readRational(latOffset + 8);
            const latSec = readRational(latOffset + 16);
            const lonDeg = readRational(lonOffset);
            const lonMin = readRational(lonOffset + 8);
            const lonSec = readRational(lonOffset + 16);

            let lat = latDeg + latMin / 60 + latSec / 3600;
            let lon = lonDeg + lonMin / 60 + lonSec / 3600;
            if (latRef && latRef.toUpperCase() === 'S') lat = -lat;
            if (lonRef && lonRef.toUpperCase() === 'W') lon = -lon;

            if (Number.isFinite(lat) && Number.isFinite(lon)) return { latitude: lat, longitude: lon };
          } catch (e) {
            return null;
          }
        }
      }
    }

    offset += 2 + len;
  }

  return null;
}