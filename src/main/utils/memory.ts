import os from 'os';

function bytesToSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function bytesToMb(bytes: number): number {
  return bytes / 1024 / 1024;
}

export function getOsTotalMemInMb(): number {
  return bytesToMb(os.totalmem());
}

export function getOsTotalMem(): number {
  return os.totalmem();
}

export function getOsFreeMem(): number {
  return os.freemem();
}

export function getOsFreeMemInMb(): number {
  return bytesToMb(os.freemem());
}

export function getOsUsedMem(): number {
  return getOsTotalMem() - getOsFreeMem();
}

export function getOsUsedMemInMb(): number {
  return getOsTotalMemInMb() - getOsFreeMemInMb();
}

export function getOsUsedMemPercentage(): number {
  return (getOsUsedMem() / getOsTotalMem()) * 100;
}

export function getVideoRam(): number {}
