/**
 * IPv6 Subnet Calculator Utilities
 * Comprehensive IPv6 subnetting calculations
 */

export interface IPv6SubnetInfo {
  ipAddress: string;
  ipAddressExpanded: string;
  ipAddressCompressed: string;
  prefix: number;
  subnetMask: string;
  networkAddress: string;
  networkAddressCompressed: string;
  firstAddress: string;
  lastAddress: string;
  totalAddresses: string;
  addressType: string;
  scope: string;
  binary: string;
  reverseDNS: string;
  ipv4Mapped?: string;
}

export interface IPv6VLSMSubnet {
  name: string;
  requiredHosts: string;
  allocatedHosts: string;
  prefix: number;
  networkAddress: string;
  networkAddressCompressed: string;
  firstAddress: string;
  lastAddress: string;
  addressRange: string;
}

/**
 * Validates an IPv6 address (supports compressed and expanded forms)
 */
export function isValidIPv6(ip: string): boolean {
  // Remove leading/trailing whitespace
  ip = ip.trim();

  // Check for IPv4-mapped IPv6
  const ipv4MappedRegex = /^::ffff:(\d{1,3}\.){3}\d{1,3}$/i;
  if (ipv4MappedRegex.test(ip)) {
    return true;
  }

  // Split by '::'
  const parts = ip.split('::');

  // Can't have more than one '::'
  if (parts.length > 2) return false;

  // Validate each part
  for (const part of parts) {
    if (part === '') continue;

    const segments = part.split(':');

    for (const segment of segments) {
      if (segment === '') continue;

      // Each segment must be 1-4 hex digits
      if (!/^[0-9a-fA-F]{1,4}$/.test(segment)) {
        return false;
      }
    }
  }

  // Count total segments
  const leftSegments = parts[0] ? parts[0].split(':').filter(s => s !== '') : [];
  const rightSegments = parts[1] ? parts[1].split(':').filter(s => s !== '') : [];
  const totalSegments = leftSegments.length + rightSegments.length;

  // If no '::', must have exactly 8 segments
  if (parts.length === 1) {
    return totalSegments === 8;
  }

  // If '::' is present, total segments must be less than 8
  return totalSegments < 8;
}

/**
 * Validates IPv6 prefix length (0-128)
 */
export function isValidPrefix(prefix: number): boolean {
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 128;
}

/**
 * Expands a compressed IPv6 address to full form
 */
export function expandIPv6(ip: string): string {
  ip = ip.trim().toLowerCase();

  // Handle IPv4-mapped addresses
  if (ip.startsWith('::ffff:')) {
    const ipv4Part = ip.substring(7);
    const ipv4Segments = ipv4Part.split('.');
    if (ipv4Segments.length === 4) {
      const hex1 = parseInt(ipv4Segments[0]).toString(16).padStart(2, '0') +
        parseInt(ipv4Segments[1]).toString(16).padStart(2, '0');
      const hex2 = parseInt(ipv4Segments[2]).toString(16).padStart(2, '0') +
        parseInt(ipv4Segments[3]).toString(16).padStart(2, '0');
      ip = `0:0:0:0:0:ffff:${hex1}:${hex2}`;
    }
  }

  // Split on '::'
  const parts = ip.split('::');

  let leftPart: string[] = [];
  let rightPart: string[] = [];

  if (parts[0]) {
    leftPart = parts[0].split(':');
  }

  if (parts[1]) {
    rightPart = parts[1].split(':');
  }

  // Calculate number of zero segments to insert
  const missingSegments = 8 - (leftPart.length + rightPart.length);
  const middlePart = Array(missingSegments).fill('0000');

  // Combine all parts
  const allSegments = [...leftPart, ...middlePart, ...rightPart];

  // Pad each segment to 4 characters
  return allSegments.map(seg => seg.padStart(4, '0')).join(':');
}

/**
 * Compresses an IPv6 address to shortest form
 */
export function compressIPv6(ip: string): string {
  const expanded = expandIPv6(ip);
  const segments = expanded.split(':');

  // Remove leading zeros from each segment
  let compressed = segments.map(seg => seg.replace(/^0+/, '') || '0').join(':');

  // Find longest sequence of consecutive zeros
  const zeroSequences: Array<{ start: number; length: number }> = [];
  let currentSequence: { start: number; length: number } | null = null;

  const compressedSegments = compressed.split(':');

  compressedSegments.forEach((seg, i) => {
    if (seg === '0') {
      if (currentSequence === null) {
        currentSequence = { start: i, length: 1 };
      } else {
        currentSequence.length++;
      }
    } else {
      if (currentSequence !== null) {
        zeroSequences.push(currentSequence);
        currentSequence = null;
      }
    }
  });

  if (currentSequence !== null) {
    zeroSequences.push(currentSequence);
  }

  // Find longest sequence (prefer first occurrence if tie)
  if (zeroSequences.length > 0) {
    const longest = zeroSequences.reduce((max, seq) =>
      seq.length > max.length ? seq : max
    );

    // Only compress if sequence is 2 or more zeros
    if (longest.length >= 2) {
      const before = compressedSegments.slice(0, longest.start);
      const after = compressedSegments.slice(longest.start + longest.length);

      if (before.length === 0 && after.length === 0) {
        compressed = '::';
      } else if (before.length === 0) {
        compressed = '::' + after.join(':');
      } else if (after.length === 0) {
        compressed = before.join(':') + '::';
      } else {
        compressed = before.join(':') + '::' + after.join(':');
      }
    }
  }

  return compressed;
}

/**
 * Converts IPv6 address to binary representation
 */
export function ipv6ToBinary(ip: string): string {
  const expanded = expandIPv6(ip);
  const segments = expanded.split(':');

  return segments
    .map(seg => parseInt(seg, 16).toString(2).padStart(16, '0'))
    .join(':');
}

/**
 * Converts binary string to IPv6 address
 */
export function binaryToIPv6(binary: string): string {
  // Remove colons if present
  const bits = binary.replace(/:/g, '');

  if (bits.length !== 128) {
    throw new Error('Binary string must be 128 bits');
  }

  const segments: string[] = [];
  for (let i = 0; i < 128; i += 16) {
    const segment = bits.substring(i, i + 16);
    const hex = parseInt(segment, 2).toString(16).padStart(4, '0');
    segments.push(hex);
  }

  return segments.join(':');
}

/**
 * Generates subnet mask from prefix length
 */
export function prefixToSubnetMask(prefix: number): string {
  const bits = '1'.repeat(prefix) + '0'.repeat(128 - prefix);
  return binaryToIPv6(bits);
}

/**
 * Calculates network address from IP and prefix
 */
export function getIPv6NetworkAddress(ip: string, prefix: number): string {
  const expanded = expandIPv6(ip);
  const binary = ipv6ToBinary(expanded);
  const bitsOnly = binary.replace(/:/g, '');

  // Apply mask
  const networkBits = bitsOnly.substring(0, prefix) + '0'.repeat(128 - prefix);

  return binaryToIPv6(networkBits);
}

/**
 * Calculates the first address in subnet (same as network address for IPv6)
 */
export function getIPv6FirstAddress(ip: string, prefix: number): string {
  return getIPv6NetworkAddress(ip, prefix);
}

/**
 * Calculates the last address in subnet
 */
export function getIPv6LastAddress(ip: string, prefix: number): string {
  const expanded = expandIPv6(ip);
  const binary = ipv6ToBinary(expanded);
  const bitsOnly = binary.replace(/:/g, '');

  // Set all host bits to 1
  const lastBits = bitsOnly.substring(0, prefix) + '1'.repeat(128 - prefix);

  return binaryToIPv6(lastBits);
}

/**
 * Calculates total number of addresses in subnet
 * Returns string because number can be astronomically large
 */
export function getTotalIPv6Addresses(prefix: number): string {
  const hostBits = 128 - prefix;

  if (hostBits <= 53) {
    // Can calculate exactly with JavaScript numbers
    return Math.pow(2, hostBits).toLocaleString('en-US');
  }

  // For very large numbers, use BigInt or approximation
  return `2^${hostBits} (≈ ${(2 ** Math.min(hostBits, 53)).toExponential(2)})`;
}

/**
 * Determines the type of IPv6 address
 */
export function getIPv6AddressType(ip: string): string {
  const expanded = expandIPv6(ip);
  const firstSegment = expanded.split(':')[0];
  const firstByte = parseInt(firstSegment.substring(0, 2), 16);

  // Loopback
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') {
    return 'Loopback (::1)';
  }

  // Unspecified
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') {
    return 'Unspecified (::)';
  }

  // IPv4-mapped
  if (expanded.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    return 'IPv4-Mapped';
  }

  // Link-Local (fe80::/10)
  if (firstSegment.startsWith('fe8') || firstSegment.startsWith('fe9') ||
    firstSegment.startsWith('fea') || firstSegment.startsWith('feb')) {
    return 'Link-Local Unicast';
  }

  // Unique Local (fc00::/7)
  if (firstByte >= 0xfc && firstByte <= 0xfd) {
    return 'Unique Local Unicast (ULA)';
  }

  // Multicast (ff00::/8)
  if (firstSegment.startsWith('ff')) {
    return 'Multicast';
  }

  // Global Unicast (2000::/3)
  if (firstByte >= 0x20 && firstByte <= 0x3f) {
    return 'Global Unicast';
  }

  return 'Reserved/Other';
}

/**
 * Determines the scope of IPv6 address
 */
export function getIPv6Scope(ip: string): string {
  const type = getIPv6AddressType(ip);

  if (type.includes('Loopback')) return 'Node-Local';
  if (type.includes('Link-Local')) return 'Link-Local';
  if (type.includes('Unique Local')) return 'Organization-Local';
  if (type.includes('Global Unicast')) return 'Global';
  if (type.includes('Multicast')) {
    const expanded = expandIPv6(ip);
    const secondChar = expanded.split(':')[0].charAt(3);
    const scopeMap: { [key: string]: string } = {
      '1': 'Interface-Local',
      '2': 'Link-Local',
      '4': 'Admin-Local',
      '5': 'Site-Local',
      '8': 'Organization-Local',
      'e': 'Global',
    };
    return `Multicast (${scopeMap[secondChar] || 'Unknown Scope'})`;
  }

  return 'Various';
}

/**
 * Generates reverse DNS notation (ip6.arpa)
 */
export function getIPv6ReverseDNS(ip: string): string {
  const expanded = expandIPv6(ip);
  const hexDigits = expanded.replace(/:/g, '').split('');
  return hexDigits.reverse().join('.') + '.ip6.arpa';
}

/**
 * Extracts IPv4 address from IPv4-mapped IPv6
 */
export function getIPv4FromMapped(ip: string): string | undefined {
  const expanded = expandIPv6(ip);

  if (!expanded.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    return undefined;
  }

  const lastTwoSegments = expanded.split(':').slice(-2);

  const octets: number[] = [];
  lastTwoSegments.forEach(segment => {
    octets.push(parseInt(segment.substring(0, 2), 16));
    octets.push(parseInt(segment.substring(2, 4), 16));
  });

  return octets.join('.');
}

/**
 * Main function to calculate all IPv6 subnet information
 */
export function calculateIPv6Subnet(ip: string, prefix: number): IPv6SubnetInfo | null {
  if (!isValidIPv6(ip) || !isValidPrefix(prefix)) {
    return null;
  }

  const expanded = expandIPv6(ip);
  const compressed = compressIPv6(ip);
  const subnetMask = prefixToSubnetMask(prefix);
  const networkAddress = getIPv6NetworkAddress(ip, prefix);
  const networkAddressCompressed = compressIPv6(networkAddress);
  const firstAddress = getIPv6FirstAddress(ip, prefix);
  const lastAddress = getIPv6LastAddress(ip, prefix);
  const totalAddresses = getTotalIPv6Addresses(prefix);
  const addressType = getIPv6AddressType(ip);
  const scope = getIPv6Scope(ip);
  const binary = ipv6ToBinary(ip);
  const reverseDNS = getIPv6ReverseDNS(ip);
  const ipv4Mapped = getIPv4FromMapped(ip);

  return {
    ipAddress: ip,
    ipAddressExpanded: expanded,
    ipAddressCompressed: compressed,
    prefix,
    subnetMask: compressIPv6(subnetMask),
    networkAddress,
    networkAddressCompressed,
    firstAddress: compressIPv6(firstAddress),
    lastAddress: compressIPv6(lastAddress),
    totalAddresses,
    addressType,
    scope,
    binary,
    reverseDNS,
    ipv4Mapped,
  };
}

/**
 * Calculates the prefix needed for a given number of addresses
 * For IPv6, this is more straightforward than IPv4
 */
export function calculatePrefixForAddresses(addressesNeeded: string): number {
  // Try to parse as number
  let needed: number;

  try {
    // Remove any commas or spaces
    const cleaned = addressesNeeded.replace(/[,\s]/g, '');
    needed = parseFloat(cleaned);

    if (isNaN(needed) || needed <= 0) {
      return 64; // Default to /64
    }
  } catch {
    return 64;
  }

  // Find the smallest prefix that fits
  let hostBits = 0;
  while (Math.pow(2, hostBits) < needed && hostBits < 128) {
    hostBits++;
  }

  return 128 - hostBits;
}

/**
 * IPv6 VLSM Calculator - divides a network into subnets
 */
export function calculateIPv6VLSM(
  networkIP: string,
  networkPrefix: number,
  subnets: { name: string; addresses: string }[]
): IPv6VLSMSubnet[] | null {
  if (!isValidIPv6(networkIP) || !isValidPrefix(networkPrefix)) {
    return null;
  }

  // Sort subnets by addresses needed (descending) for optimal allocation
  const sortedSubnets = [...subnets].sort((a, b) => {
    const aNum = parseFloat(a.addresses.replace(/[,\s]/g, ''));
    const bNum = parseFloat(b.addresses.replace(/[,\s]/g, ''));
    return bNum - aNum;
  });

  const result: IPv6VLSMSubnet[] = [];
  const networkAddress = getIPv6NetworkAddress(networkIP, networkPrefix);
  const networkBinary = ipv6ToBinary(networkAddress);
  const networkBitsOnly = networkBinary.replace(/:/g, '');

  // Track current position as a binary string for proper advancement
  let currentBits = networkBitsOnly;

  for (const subnet of sortedSubnets) {
    const prefix = calculatePrefixForAddresses(subnet.addresses);

    // Check if prefix is valid within the network
    if (prefix < networkPrefix) {
      return null; // Requested subnet is larger than the network
    }

    // Align to subnet boundary: zero out host bits
    const subnetBits = currentBits.substring(0, prefix) + '0'.repeat(128 - prefix);
    const subnetAddress = binaryToIPv6(subnetBits);
    const firstAddress = compressIPv6(subnetAddress);
    const lastAddress = compressIPv6(getIPv6LastAddress(subnetAddress, prefix));
    const totalAddresses = getTotalIPv6Addresses(prefix);

    // Calculate the last address bits to check we're still within bounds
    const lastBits = currentBits.substring(0, prefix) + '1'.repeat(128 - prefix);
    const networkLastBits = networkBitsOnly.substring(0, networkPrefix) + '1'.repeat(128 - networkPrefix);

    if (lastBits > networkLastBits) {
      return null; // Not enough space in the network
    }

    result.push({
      name: subnet.name,
      requiredHosts: subnet.addresses,
      allocatedHosts: totalAddresses,
      prefix,
      networkAddress: subnetAddress,
      networkAddressCompressed: compressIPv6(subnetAddress),
      firstAddress,
      lastAddress,
      addressRange: `${firstAddress} - ${lastAddress}`,
    });

    // Advance to next subnet: increment the subnet portion
    // Add 1 to the prefix-th bit position
    const nextSubnetBits = incrementBinaryAtPosition(subnetBits, prefix);
    if (nextSubnetBits === null) {
      // Overflow - no more space
      if (sortedSubnets.indexOf(subnet) < sortedSubnets.length - 1) {
        return null;
      }
    } else {
      currentBits = nextSubnetBits;
    }
  }

  return result;
}

/**
 * Increments a 128-bit binary string at a given bit position
 * Returns null on overflow
 */
function incrementBinaryAtPosition(bits: string, position: number): string | null {
  const arr = bits.split('');
  let carry = 1;
  for (let i = position - 1; i >= 0 && carry > 0; i--) {
    const sum = parseInt(arr[i]) + carry;
    arr[i] = (sum % 2).toString();
    carry = Math.floor(sum / 2);
  }
  if (carry > 0) return null; // overflow
  // Zero out everything after position
  for (let i = position; i < 128; i++) {
    arr[i] = '0';
  }
  return arr.join('');
}

/**
 * Generates all possible subnets for a given network and new prefix
 */
export function generateIPv6Subnets(
  networkIP: string,
  originalPrefix: number,
  newPrefix: number,
  maxSubnets: number = 100
): IPv6SubnetInfo[] {
  if (!isValidIPv6(networkIP) || !isValidPrefix(originalPrefix) || !isValidPrefix(newPrefix)) {
    return [];
  }

  if (newPrefix <= originalPrefix) {
    return []; // New prefix must be larger (smaller network)
  }

  const subnets: IPv6SubnetInfo[] = [];
  const networkAddress = getIPv6NetworkAddress(networkIP, originalPrefix);
  const networkBinary = ipv6ToBinary(networkAddress);
  const networkBitsOnly = networkBinary.replace(/:/g, '');

  const subnetBits = newPrefix - originalPrefix;
  const totalSubnets = Math.pow(2, Math.min(subnetBits, 20)); // Limit to prevent overflow
  const actualSubnets = Math.min(totalSubnets, maxSubnets);

  for (let i = 0; i < actualSubnets; i++) {
    // Create subnet address
    const subnetSuffix = i.toString(2).padStart(subnetBits, '0');
    const hostBits = '0'.repeat(128 - newPrefix);
    const subnetBitsOnly = networkBitsOnly.substring(0, originalPrefix) + subnetSuffix + hostBits;

    const subnetAddress = binaryToIPv6(subnetBitsOnly);
    const subnetInfo = calculateIPv6Subnet(subnetAddress, newPrefix);

    if (subnetInfo) {
      subnets.push(subnetInfo);
    }
  }

  return subnets;
}

/**
 * Common IPv6 prefix lengths and their typical uses
 */
export const COMMON_IPV6_PREFIXES = [
  { prefix: 128, name: 'Single Host', description: 'Un singolo indirizzo IPv6' },
  { prefix: 64, name: 'Standard Subnet', description: 'Subnet standard per LAN (raccomandato)' },
  { prefix: 56, name: 'Home/Small Business', description: 'Allocazione tipica per utenti domestici' },
  { prefix: 48, name: 'Site/Organization', description: 'Allocazione tipica per organizzazioni' },
  { prefix: 32, name: 'ISP Allocation', description: 'Allocazione tipica per ISP' },
  { prefix: 16, name: 'Large ISP/RIR', description: 'Allocazione per grandi ISP o RIR' },
  { prefix: 3, name: 'Global Unicast', description: 'Spazio Global Unicast (2000::/3)' },
];

/**
 * Checks for overlapping subnets in an IPv6 VLSM allocation
 */
export interface IPv6OverlapInfo {
  subnet1: string;
  subnet2: string;
  description: string;
}

export function checkIPv6VLSMOverlap(subnets: IPv6VLSMSubnet[]): IPv6OverlapInfo[] {
  const overlaps: IPv6OverlapInfo[] = [];

  for (let i = 0; i < subnets.length; i++) {
    const startA = ipv6ToBinary(subnets[i].networkAddress).replace(/:/g, '');
    const endA = ipv6ToBinary(getIPv6LastAddress(subnets[i].networkAddress, subnets[i].prefix)).replace(/:/g, '');

    for (let j = i + 1; j < subnets.length; j++) {
      const startB = ipv6ToBinary(subnets[j].networkAddress).replace(/:/g, '');
      const endB = ipv6ToBinary(getIPv6LastAddress(subnets[j].networkAddress, subnets[j].prefix)).replace(/:/g, '');

      // Check if ranges overlap using string comparison (works for fixed-length binary)
      if (startA <= endB && startB <= endA) {
        overlaps.push({
          subnet1: subnets[i].name,
          subnet2: subnets[j].name,
          description: `${subnets[i].networkAddressCompressed}/${subnets[i].prefix} si sovrappone con ${subnets[j].networkAddressCompressed}/${subnets[j].prefix}`,
        });
      }
    }
  }

  return overlaps;
}
