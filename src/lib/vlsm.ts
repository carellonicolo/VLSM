export interface Block {
  net: number;
  prefix: number;
}

export interface AllocatedSubnet {
  nome: string;
  net: number;
  prefix: number;
}

export function parseIp(s: string): number {
  const trimmed = s.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) throw new Error(`IP non valido: ${s}`);
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) throw new Error(`Ottetto non valido: ${part}`);
    const n = Number(part);
    if (n < 0 || n > 255) throw new Error(`Ottetto fuori range: ${part}`);
    result = (result * 256 + n) >>> 0;
  }
  return result >>> 0;
}

export function formatIp(n: number): string {
  const u = n >>> 0;
  return [(u >>> 24) & 0xff, (u >>> 16) & 0xff, (u >>> 8) & 0xff, u & 0xff].join('.');
}

export function parseCidr(s: string): { ip: number; prefix: number } {
  const m = s.trim().match(/^([\d.]+)\s*\/\s*(\d{1,2})$/);
  if (!m) throw new Error(`CIDR non valido: ${s}`);
  const prefix = Number(m[2]);
  if (prefix < 0 || prefix > 32) throw new Error(`Prefisso fuori range: ${prefix}`);
  return { ip: parseIp(m[1]), prefix };
}

export function prefixToMask(prefix: number): number {
  if (prefix < 0 || prefix > 32) throw new Error(`Prefisso fuori range: ${prefix}`);
  if (prefix === 0) return 0 >>> 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function formatMask(prefix: number): string {
  return formatIp(prefixToMask(prefix));
}

export function maskToPrefix(mask: number): number {
  let count = 0;
  let m = mask >>> 0;
  for (let i = 0; i < 32; i++) {
    if ((m & 0x80000000) >>> 0) count++;
    else break;
    m = (m << 1) >>> 0;
  }
  return count;
}

export function networkAddress(ip: number, prefix: number): number {
  return (ip & prefixToMask(prefix)) >>> 0;
}

export function broadcastAddress(net: number, prefix: number): number {
  const mask = prefixToMask(prefix);
  return (net | (~mask >>> 0)) >>> 0;
}

export function firstHost(net: number, prefix: number): number {
  if (prefix >= 31) return net;
  return (net + 1) >>> 0;
}

export function lastHost(net: number, prefix: number): number {
  if (prefix >= 31) return broadcastAddress(net, prefix);
  return (broadcastAddress(net, prefix) - 1) >>> 0;
}

export function hostsCount(prefix: number): number {
  if (prefix >= 31) return prefix === 32 ? 1 : 2;
  return Math.pow(2, 32 - prefix) - 2;
}

export function blockSize(prefix: number): number {
  return Math.pow(2, 32 - prefix);
}

export function minPrefixForHosts(hosts: number): number {
  if (hosts <= 0) return 32;
  for (let p = 30; p >= 0; p--) {
    if (hostsCount(p) >= hosts) return p;
  }
  return 0;
}

export function allocateVlsm(
  parent: { ip: number; prefix: number },
  requisiti: { nome: string; host: number }[]
): AllocatedSubnet[] {
  const sorted = [...requisiti].sort((a, b) => b.host - a.host);
  const result: AllocatedSubnet[] = [];
  let cursor = parent.ip >>> 0;
  const parentEnd = (broadcastAddress(parent.ip, parent.prefix) + 1) >>> 0;
  for (const req of sorted) {
    const prefix = minPrefixForHosts(req.host);
    const size = blockSize(prefix);
    const aligned = alignUp(cursor, size);
    if (aligned + size > parentEnd) {
      throw new Error(`Spazio insufficiente per ${req.nome}`);
    }
    result.push({ nome: req.nome, net: aligned >>> 0, prefix });
    cursor = (aligned + size) >>> 0;
  }
  return result;
}

function alignUp(n: number, size: number): number {
  const rem = n % size;
  return rem === 0 ? n : (n + (size - rem)) >>> 0;
}

function largestAlignedPrefix(start: number, limitExclusive: number): number {
  let prefix = 32;
  for (let p = 0; p <= 32; p++) {
    const size = blockSize(p);
    if (start % size === 0 && start + size <= limitExclusive) {
      prefix = p;
      break;
    }
  }
  return prefix;
}

export function findResidualBlocks(parent: Block, allocated: Block[]): Block[] {
  const sorted = [...allocated].sort((a, b) => a.net - b.net);
  const parentEndExclusive = (broadcastAddress(parent.net, parent.prefix) + 1) >>> 0;
  let cursor = parent.net >>> 0;
  const out: Block[] = [];
  for (const a of sorted) {
    if (a.net > cursor) {
      pushGap(out, cursor, a.net);
    }
    cursor = (a.net + blockSize(a.prefix)) >>> 0;
  }
  if (cursor < parentEndExclusive) {
    pushGap(out, cursor, parentEndExclusive);
  }
  return out;
}

function pushGap(out: Block[], start: number, endExclusive: number) {
  let cursor = start >>> 0;
  while (cursor < endExclusive) {
    const prefix = largestAlignedPrefix(cursor, endExclusive);
    out.push({ net: cursor, prefix });
    cursor = (cursor + blockSize(prefix)) >>> 0;
  }
}

export function blockContains(outer: Block, inner: Block): boolean {
  const outerEnd = (outer.net + blockSize(outer.prefix)) >>> 0;
  const innerEnd = (inner.net + blockSize(inner.prefix)) >>> 0;
  return inner.net >= outer.net && innerEnd <= outerEnd;
}

export function isAligned(net: number, prefix: number): boolean {
  return net % blockSize(prefix) === 0;
}
