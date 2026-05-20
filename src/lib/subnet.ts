/**
 * Subnet Calculator Utilities
 * Comprehensive IPv4 subnetting calculations
 */

export interface SubnetInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  subnetMaskBinary: string;
  wildcardMask: string;
  networkAddress: string;
  networkAddressBinary: string;
  broadcastAddress: string;
  broadcastAddressBinary: string;
  firstUsableIP: string;
  lastUsableIP: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  binary: string;
}

export interface VLSMSubnet {
  name: string;
  requiredHosts: number;
  allocatedHosts: number;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  broadcastAddress: string;
}

/**
 * Validates an IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);

  if (!match) return false;

  return match.slice(1).every(octet => {
    const num = parseInt(octet);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validates CIDR notation (0-32)
 */
export function isValidCIDR(cidr: number): boolean {
  return Number.isInteger(cidr) && cidr >= 0 && cidr <= 32;
}

/**
 * Converts an IPv4 address to a 32-bit integer
 */
export function ipToInt(ip: string): number {
  const octets = ip.split('.').map(Number);
  return ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

/**
 * Converts a 32-bit integer to an IPv4 address
 */
export function intToIp(int: number): string {
  return [
    (int >>> 24) & 0xFF,
    (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF,
    int & 0xFF
  ].join('.');
}

/**
 * Converts an IPv4 address to binary notation
 */
export function ipToBinary(ip: string): string {
  return ip.split('.')
    .map(octet => parseInt(octet).toString(2).padStart(8, '0'))
    .join('.');
}

/**
 * Converts CIDR notation to subnet mask
 */
export function cidrToSubnetMask(cidr: number): string {
  const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

/**
 * Converts subnet mask to CIDR notation
 */
export function subnetMaskToCIDR(mask: string): number {
  const binary = ipToBinary(mask).replace(/\./g, '');
  // Validate contiguous mask: all 1s followed by all 0s
  const firstZero = binary.indexOf('0');
  if (firstZero === -1) return 32; // All 1s
  const onesAfterZero = binary.substring(firstZero).indexOf('1');
  if (onesAfterZero !== -1) return -1; // Invalid non-contiguous mask
  return firstZero;
}

/**
 * Calculates the wildcard mask from CIDR
 */
export function getWildcardMask(cidr: number): string {
  const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  return intToIp(wildcard);
}

/**
 * Calculates the network address
 */
export function getNetworkAddress(ip: string, cidr: number): string {
  const ipInt = ipToInt(ip);
  const maskInt = (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  return intToIp(networkInt);
}

/**
 * Calculates the broadcast address
 */
export function getBroadcastAddress(ip: string, cidr: number): string {
  const networkInt = ipToInt(getNetworkAddress(ip, cidr));
  const wildcardInt = ipToInt(getWildcardMask(cidr));
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  return intToIp(broadcastInt);
}

/**
 * Calculates the first usable IP address
 */
export function getFirstUsableIP(ip: string, cidr: number): string {
  if (cidr === 32) return ip; // Single host
  if (cidr === 31) return getNetworkAddress(ip, cidr); // Point-to-point (RFC 3021)

  const networkInt = ipToInt(getNetworkAddress(ip, cidr));
  return intToIp(networkInt + 1);
}

/**
 * Calculates the last usable IP address
 */
export function getLastUsableIP(ip: string, cidr: number): string {
  if (cidr === 32) return ip; // Single host
  if (cidr === 31) return getBroadcastAddress(ip, cidr); // Point-to-point (RFC 3021)

  const broadcastInt = ipToInt(getBroadcastAddress(ip, cidr));
  return intToIp(broadcastInt - 1);
}

/**
 * Calculates total number of addresses in subnet
 */
export function getTotalHosts(cidr: number): number {
  return Math.pow(2, 32 - cidr);
}

/**
 * Calculates number of usable host addresses
 */
export function getUsableHosts(cidr: number): number {
  if (cidr === 32) return 1; // Single host
  if (cidr === 31) return 2; // Point-to-point (RFC 3021)
  return Math.pow(2, 32 - cidr) - 2; // Subtract network and broadcast
}

/**
 * Determines the IP class (A, B, C, D, E)
 */
export function getIPClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0]);

  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';

  return 'Unknown';
}

/**
 * Determines if IP is private, public, loopback, etc.
 */
export function getIPType(ip: string): string {
  const octets = ip.split('.').map(Number);
  const firstOctet = octets[0];
  const secondOctet = octets[1];

  // Loopback
  if (firstOctet === 127) return 'Loopback';

  // Private ranges
  if (firstOctet === 10) return 'Private';
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return 'Private';
  if (firstOctet === 192 && secondOctet === 168) return 'Private';

  // Link-local
  if (firstOctet === 169 && secondOctet === 254) return 'Link-Local';

  // Multicast
  if (firstOctet >= 224 && firstOctet <= 239) return 'Multicast';

  // Reserved
  if (firstOctet >= 240) return 'Reserved';

  return 'Public';
}

/**
 * Main function to calculate all subnet information
 */
export function calculateSubnet(ip: string, cidr: number): SubnetInfo | null {
  if (!isValidIPv4(ip) || !isValidCIDR(cidr)) {
    return null;
  }

  const subnetMask = cidrToSubnetMask(cidr);
  const wildcardMask = getWildcardMask(cidr);
  const networkAddress = getNetworkAddress(ip, cidr);
  const broadcastAddress = getBroadcastAddress(ip, cidr);
  const firstUsableIP = getFirstUsableIP(ip, cidr);
  const lastUsableIP = getLastUsableIP(ip, cidr);

  return {
    ipAddress: ip,
    cidr,
    subnetMask,
    subnetMaskBinary: ipToBinary(subnetMask),
    wildcardMask,
    networkAddress,
    networkAddressBinary: ipToBinary(networkAddress),
    broadcastAddress,
    broadcastAddressBinary: ipToBinary(broadcastAddress),
    firstUsableIP,
    lastUsableIP,
    totalHosts: getTotalHosts(cidr),
    usableHosts: getUsableHosts(cidr),
    ipClass: getIPClass(ip),
    ipType: getIPType(ip),
    binary: ipToBinary(ip),
  };
}

/**
 * Calculates the CIDR needed for a given number of hosts
 */
export function calculateCIDRForHosts(hostsNeeded: number): number {
  // Need to account for network and broadcast addresses
  const totalNeeded = hostsNeeded + 2;

  // Find the smallest power of 2 that fits
  let bits = 0;
  while (Math.pow(2, bits) < totalNeeded) {
    bits++;
  }

  return 32 - bits;
}

/**
 * VLSM Calculator - divides a network into subnets based on host requirements
 */
export function calculateVLSM(
  networkIP: string,
  networkCIDR: number,
  subnets: { name: string; hosts: number }[]
): VLSMSubnet[] | null {
  if (!isValidIPv4(networkIP) || !isValidCIDR(networkCIDR)) {
    return null;
  }

  // Sort subnets by hosts needed (descending) for optimal allocation
  const sortedSubnets = [...subnets].sort((a, b) => b.hosts - a.hosts);

  const result: VLSMSubnet[] = [];
  let currentNetworkInt = ipToInt(getNetworkAddress(networkIP, networkCIDR));

  for (const subnet of sortedSubnets) {
    const cidr = calculateCIDRForHosts(subnet.hosts);
    const allocatedHosts = getUsableHosts(cidr);

    // Check if we have enough space
    const subnetSize = getTotalHosts(cidr);
    const networkEnd = ipToInt(getBroadcastAddress(networkIP, networkCIDR));

    if (currentNetworkInt + subnetSize - 1 > networkEnd) {
      // Not enough space
      return null;
    }

    const subnetAddress = intToIp(currentNetworkInt);
    const subnetMask = cidrToSubnetMask(cidr);
    const firstUsable = getFirstUsableIP(subnetAddress, cidr);
    const lastUsable = getLastUsableIP(subnetAddress, cidr);
    const broadcast = getBroadcastAddress(subnetAddress, cidr);

    result.push({
      name: subnet.name,
      requiredHosts: subnet.hosts,
      allocatedHosts,
      cidr,
      subnetMask,
      networkAddress: subnetAddress,
      firstUsableIP: firstUsable,
      lastUsableIP: lastUsable,
      broadcastAddress: broadcast,
    });

    // Move to next available network
    currentNetworkInt += subnetSize;
  }

  return result;
}

/**
 * Generates all possible subnets for a given network and new CIDR
 */
export function generateSubnets(
  networkIP: string,
  originalCIDR: number,
  newCIDR: number
): SubnetInfo[] {
  if (!isValidIPv4(networkIP) || !isValidCIDR(originalCIDR) || !isValidCIDR(newCIDR)) {
    return [];
  }

  if (newCIDR <= originalCIDR) {
    return []; // New CIDR must be larger (smaller network)
  }

  const subnets: SubnetInfo[] = [];
  const networkStart = ipToInt(getNetworkAddress(networkIP, originalCIDR));
  const networkEnd = ipToInt(getBroadcastAddress(networkIP, originalCIDR));
  const subnetSize = getTotalHosts(newCIDR);

  let currentIP = networkStart;

  while (currentIP <= networkEnd) {
    const subnetInfo = calculateSubnet(intToIp(currentIP), newCIDR);
    if (subnetInfo) {
      subnets.push(subnetInfo);
    }
    currentIP += subnetSize;
  }

  return subnets;
}

/**
 * Checks for overlapping subnets in a VLSM allocation
 * Returns an array of overlapping pairs with details
 */
export interface OverlapInfo {
  subnet1: string;
  subnet2: string;
  description: string;
}

export function checkVLSMOverlap(subnets: VLSMSubnet[]): OverlapInfo[] {
  const overlaps: OverlapInfo[] = [];

  for (let i = 0; i < subnets.length; i++) {
    const startA = ipToInt(subnets[i].networkAddress);
    const endA = ipToInt(subnets[i].broadcastAddress);

    for (let j = i + 1; j < subnets.length; j++) {
      const startB = ipToInt(subnets[j].networkAddress);
      const endB = ipToInt(subnets[j].broadcastAddress);

      // Check if ranges overlap
      if (startA <= endB && startB <= endA) {
        overlaps.push({
          subnet1: subnets[i].name,
          subnet2: subnets[j].name,
          description: `${subnets[i].networkAddress}/${subnets[i].cidr} si sovrappone con ${subnets[j].networkAddress}/${subnets[j].cidr}`,
        });
      }
    }
  }

  return overlaps;
}
