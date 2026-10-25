import React, { useState } from 'react';
import { Layers, Shield, Check, Copy } from 'lucide-react';

interface HeaderField {
  id: string;
  name: string;
  shortName: string;
  bits: number;
  colSpan: string;
  accent: 'blue' | 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'neutral';
  offset: string;
  example: string;
  description: string;
  securityNote: string;
}

const IPV4_FIELDS: HeaderField[] = [
  // Word 0 (0-31)
  {
    id: 'version',
    name: 'Version',
    shortName: 'VER',
    bits: 4,
    colSpan: 'col-span-4',
    accent: 'blue',
    offset: 'Bits 0–3',
    example: '0100 (4 in binary)',
    description: 'Specifies the IP format version. Always 4 for standard IPv4.',
    securityNote: 'Packets with version numbers other than 4 or 6 are immediately dropped by OS network stacks.'
  },
  {
    id: 'ihl',
    name: 'Internet Header Length',
    shortName: 'IHL',
    bits: 4,
    colSpan: 'col-span-4',
    accent: 'indigo',
    offset: 'Bits 4–7',
    example: '0101 (5 words = 20 Bytes)',
    description: 'Number of 32-bit words in the header. Minimum value is 5 (20 bytes); maximum is 15 (60 bytes with optional fields).',
    securityNote: 'Packets with IHL < 5 are malformed and discarded. Security scanners monitor abnormal options added after byte 20.'
  },
  {
    id: 'dscp',
    name: 'Type of Service / DSCP',
    shortName: 'DSCP/ECN',
    bits: 8,
    colSpan: 'col-span-8',
    accent: 'purple',
    offset: 'Bits 8–15',
    example: '0x00 (Best Effort) / CS0',
    description: 'Differentiated Services Code Point (DSCP 6b) and Explicit Congestion Notification (ECN 2b) for Quality of Service (QoS).',
    securityNote: 'ECN flags allow routers to signal network congestion without dropping packets prematurely.'
  },
  {
    id: 'totalLength',
    name: 'Total Length',
    shortName: 'Total Length',
    bits: 16,
    colSpan: 'col-span-16',
    accent: 'emerald',
    offset: 'Bits 16–31',
    example: '0x05DC (1500 bytes MTU)',
    description: 'Total size of the entire packet (IPv4 header + payload) in bytes. Maximum theoretical packet size is 65,535 bytes.',
    securityNote: 'Historical "Ping of Death" attacks exploited discrepancies where total length exceeded 65,535 bytes, causing OS memory overflow.'
  },

  // Word 1 (32-63)
  {
    id: 'id',
    name: 'Identification',
    shortName: 'Identification',
    bits: 16,
    colSpan: 'col-span-16',
    accent: 'neutral',
    offset: 'Bits 32–47',
    example: '0x3A2F (14895)',
    description: 'A unique integer assigned by the sender to identify fragments originating from the same parent packet.',
    securityNote: 'Predictable sequential IDs can allow attackers to perform idle port scans (Zombie Scans) and TCP injection.'
  },
  {
    id: 'flags',
    name: 'Control Flags',
    shortName: 'Flags [DF, MF]',
    bits: 3,
    colSpan: 'col-span-4',
    accent: 'amber',
    offset: 'Bits 48–50',
    example: '[0, DF=1, MF=0]',
    description: 'Bit 0: Reserved (always 0). Bit 1: Don\'t Fragment (DF). Bit 2: More Fragments (MF).',
    securityNote: 'DF=1 enables Path MTU Discovery. If a router cannot forward without fragmentation and DF=1, it drops the packet and responds with ICMP Fragmentation Needed.'
  },
  {
    id: 'fragOffset',
    name: 'Fragment Offset',
    shortName: 'Fragment Offset',
    bits: 13,
    colSpan: 'col-span-12',
    accent: 'neutral',
    offset: 'Bits 51–63',
    example: '0x0000 (0 offset)',
    description: 'Specifies the position of fragmented data relative to the beginning of the unfragmented payload in 8-byte blocks.',
    securityNote: 'Overlapping fragment attacks (Teardrop attack) exploit flawed fragment offset calculations to crash unpatched kernels.'
  },

  // Word 2 (64-95)
  {
    id: 'ttl',
    name: 'Time to Live (TTL)',
    shortName: 'TTL',
    bits: 8,
    colSpan: 'col-span-8',
    accent: 'rose',
    offset: 'Bits 64–71',
    example: '64 (Linux) / 128 (Windows)',
    description: 'Hop limit counter decremented by 1 at every router hop. When TTL reaches 0, the packet is discarded.',
    securityNote: 'Traceroute systematically increments TTL starting from 1 to map internet topologies via ICMP Time Exceeded (Type 11) replies.'
  },
  {
    id: 'protocol',
    name: 'Protocol ID',
    shortName: 'Protocol ID',
    bits: 8,
    colSpan: 'col-span-8',
    accent: 'cyan',
    offset: 'Bits 72–79',
    example: '0x06 (TCP) • 0x11 (UDP)',
    description: 'Identifies the transport-layer protocol encapsulated within the IP payload (0x06 for TCP, 0x11 for UDP, 0x01 for ICMP).',
    securityNote: 'Firewalls inspect this field to permit or deny specific traffic types at wire speed.'
  },
  {
    id: 'checksum',
    name: 'Header Checksum',
    shortName: 'Header Checksum',
    bits: 16,
    colSpan: 'col-span-16',
    accent: 'neutral',
    offset: 'Bits 80–95',
    example: '0xB24E (1\'s complement)',
    description: '16-bit one\'s complement sum covering ONLY the IPv4 header (payload checksums are delegated to TCP/UDP).',
    securityNote: 'Because TTL decrements at each router hop, intermediate routers must recalculate the checksum on every single pass.'
  },

  // Word 3 (96-127)
  {
    id: 'srcIp',
    name: 'Source IP Address',
    shortName: 'Source IP Address (32 bits)',
    bits: 32,
    colSpan: 'col-span-32',
    accent: 'blue',
    offset: 'Bits 96–127 (Byte 12–15)',
    example: '192.168.1.100 (0xC0A80164)',
    description: 'The 32-bit IPv4 address of the original sending host.',
    securityNote: 'IP spoofing can forge this address unless egress filtering (BCP 38 / Reverse Path Forwarding) is enforced by ISPs.'
  },

  // Word 4 (128-159)
  {
    id: 'dstIp',
    name: 'Destination IP Address',
    shortName: 'Destination IP Address (32 bits)',
    bits: 32,
    colSpan: 'col-span-32',
    accent: 'emerald',
    offset: 'Bits 128–159 (Byte 16–19)',
    example: '142.250.190.46 (Google Gateway)',
    description: 'The 32-bit IPv4 address of the intended recipient device.',
    securityNote: 'Routers consult their routing tables (CIDR prefix matching) to decide the next-hop interface for this address.'
  }
];

export const Ipv4PacketHeaderVisualizer: React.FC = () => {
  const [selectedField, setSelectedField] = useState<HeaderField>(IPV4_FIELDS[7]); // Default to TTL
  const [viewMode, setViewMode] = useState<'matrix' | 'ascii'>('matrix');
  const [copied, setCopied] = useState(false);

  const rawAsciiSpec = `+---------------------------------------------------------------+
| Version (4b) | IHL (4b) | Type of Service / DSCP (8b) | Total Length (16b) |
+---------------------------------------------------------------+
| Identification (16b) | Flags: [DF, MF] (3b) | Fragment Offset (13b)      |
+---------------------------------------------------------------+
| Time to Live (TTL) (8b) | Protocol ID (8b) | Header Checksum (16b)      |
+---------------------------------------------------------------+
| Source IP Address (32 bits)                                   |
+---------------------------------------------------------------+
| Destination IP Address (32 bits)                              |
+---------------------------------------------------------------+`;

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(rawAsciiSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAccentStyles = (accent: HeaderField['accent'], isSelected: boolean) => {
    switch (accent) {
      case 'blue':
        return isSelected
          ? 'bg-blue-500/25 text-blue-900 dark:text-blue-100 font-bold'
          : 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20';
      case 'indigo':
        return isSelected
          ? 'bg-indigo-500/25 text-indigo-900 dark:text-indigo-100 font-bold'
          : 'bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20';
      case 'purple':
        return isSelected
          ? 'bg-purple-500/25 text-purple-900 dark:text-purple-100 font-bold'
          : 'bg-purple-500/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20';
      case 'emerald':
        return isSelected
          ? 'bg-emerald-500/25 text-emerald-900 dark:text-emerald-100 font-bold'
          : 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20';
      case 'amber':
        return isSelected
          ? 'bg-amber-500/25 text-amber-900 dark:text-amber-100 font-bold'
          : 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20';
      case 'rose':
        return isSelected
          ? 'bg-rose-500/25 text-rose-900 dark:text-rose-100 font-bold'
          : 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20';
      case 'cyan':
        return isSelected
          ? 'bg-cyan-500/25 text-cyan-900 dark:text-cyan-100 font-bold'
          : 'bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20';
      default:
        return isSelected
          ? 'bg-neutral-200 dark:bg-white/15 text-neutral-900 dark:text-white font-bold'
          : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/[0.08]';
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/60 dark:border-white/[0.06] bg-white dark:bg-[#1e1e1e] shadow-2xs overflow-hidden my-4 space-y-0">
      {/* Visualizer Top Bar */}
      <div className="p-3.5 sm:p-4 bg-neutral-50/60 dark:bg-white/[0.02] border-b border-neutral-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                IPv4 Packet Header Matrix
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">
                20 Bytes (160 Bits)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              RFC 791 Standard • 32-bit word alignment per row
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-neutral-200/60 dark:bg-white/[0.06] text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-[#282828] text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            32-Bit Grid
          </button>
          <button
            onClick={() => setViewMode('ascii')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              viewMode === 'ascii'
                ? 'bg-white dark:bg-[#282828] text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Raw RFC Text
          </button>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Scrollable Bit Matrix Container */}
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[620px] space-y-2">
              {/* 32-Bit Ruler Header */}
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 dark:text-neutral-500 px-1 border-b border-neutral-200/60 dark:border-neutral-800 pb-1">
                <span className="w-12 text-left">Bit 0</span>
                <span className="w-12 text-center">Bit 4</span>
                <span className="w-12 text-center">Bit 8</span>
                <span className="w-12 text-center">Bit 16</span>
                <span className="w-12 text-right">Bit 31</span>
              </div>

              {/* Matrix Rows (using proportional 32-bit flex widths) */}
              <div className="space-y-1.5 font-mono text-xs">
                {/* Word 0 (Bits 0–31) */}
                <div className="flex gap-1.5">
                  {IPV4_FIELDS.slice(0, 4).map((f) => {
                    const isSelected = selectedField.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedField(f)}
                        style={{ flex: f.bits }}
                        className={`p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-0.5 min-w-0 ${getAccentStyles(
                          f.accent,
                          isSelected
                        )}`}
                      >
                        <span className="font-bold text-[11px] truncate w-full">{f.shortName}</span>
                        <span className="text-[9px] opacity-80 font-mono">{f.bits} bits</span>
                      </button>
                    );
                  })}
                </div>

                {/* Word 1 (Bits 32–63) */}
                <div className="flex gap-1.5">
                  {IPV4_FIELDS.slice(4, 7).map((f) => {
                    const isSelected = selectedField.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedField(f)}
                        style={{ flex: f.bits }}
                        className={`p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-0.5 min-w-0 ${getAccentStyles(
                          f.accent,
                          isSelected
                        )}`}
                      >
                        <span className="font-bold text-[11px] truncate w-full">{f.shortName}</span>
                        <span className="text-[9px] opacity-80 font-mono">{f.bits} bits</span>
                      </button>
                    );
                  })}
                </div>

                {/* Word 2 (Bits 64–95) */}
                <div className="flex gap-1.5">
                  {IPV4_FIELDS.slice(7, 10).map((f) => {
                    const isSelected = selectedField.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedField(f)}
                        style={{ flex: f.bits }}
                        className={`p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-0.5 min-w-0 ${getAccentStyles(
                          f.accent,
                          isSelected
                        )}`}
                      >
                        <span className="font-bold text-[11px] truncate w-full">{f.shortName}</span>
                        <span className="text-[9px] opacity-80 font-mono">{f.bits} bits</span>
                      </button>
                    );
                  })}
                </div>

                {/* Word 3: Source IP Address (32 bits) */}
                <div className="flex gap-1.5">
                  {(() => {
                    const f = IPV4_FIELDS[10];
                    const isSelected = selectedField.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedField(f)}
                        style={{ flex: 32 }}
                        className={`w-full p-2.5 rounded-xl text-center transition-all cursor-pointer flex items-center justify-between px-3 ${getAccentStyles(
                          f.accent,
                          isSelected
                        )}`}
                      >
                        <span className="font-bold text-[11px]">{f.name}</span>
                        <span className="text-[10px] font-mono opacity-80">32 bits (4 Bytes)</span>
                      </button>
                    );
                  })()}
                </div>

                {/* Word 4: Destination IP Address (32 bits) */}
                <div className="flex gap-1.5">
                  {(() => {
                    const f = IPV4_FIELDS[11];
                    const isSelected = selectedField.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedField(f)}
                        style={{ flex: 32 }}
                        className={`w-full p-2.5 rounded-xl text-center transition-all cursor-pointer flex items-center justify-between px-3 ${getAccentStyles(
                          f.accent,
                          isSelected
                        )}`}
                      >
                        <span className="font-bold text-[11px]">{f.name}</span>
                        <span className="text-[10px] font-mono opacity-80">32 bits (4 Bytes)</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Field Deep Inspector Box */}
          <div className="p-4 rounded-2xl bg-neutral-100/60 dark:bg-white/[0.03] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200/50 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                  {selectedField.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-neutral-200/60 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                  {selectedField.bits} bits ({selectedField.offset})
                </span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                Example: <code className="text-blue-600 dark:text-blue-400 font-bold">{selectedField.example}</code>
              </span>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {selectedField.description}
            </p>

            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
              <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold">Security Context:</strong> {selectedField.securityNote}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Raw Monospaced ASCII Spec View */
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-white/[0.06]">
            <span className="text-xs font-mono text-neutral-500">Standard RFC Monospace Representation</span>
            <button
              onClick={handleCopyAscii}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Diagram'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-950 dark:bg-black text-neutral-100 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-neutral-800 select-all">
            {rawAsciiSpec}
          </pre>
        </div>
      )}
    </div>
  );
};
