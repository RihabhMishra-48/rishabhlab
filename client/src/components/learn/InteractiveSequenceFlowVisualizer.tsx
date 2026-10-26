import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Server,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

interface HandshakeStep {
  id: number;
  direction: 'client-to-server' | 'server-to-client';
  flags: string[];
  seq: number;
  ack: number | null;
  clientState: string;
  serverState: string;
  packetName: string;
  payloadSummary: string;
  kernelAction: string;
  securityInsight: string;
  color: 'blue' | 'purple' | 'emerald';
}

const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    id: 1,
    direction: 'client-to-server',
    flags: ['SYN'],
    seq: 100,
    ack: null,
    clientState: 'SYN_SENT',
    serverState: 'LISTEN',
    packetName: 'Step 1: Synchronize (SYN)',
    payloadSummary: 'Client generates random Initial Sequence Number (ISN_c = 100) and announces MSS (1460 bytes).',
    kernelAction: 'Server allocates Transmission Control Block (TCB) in half-open connection queue (SYN Backlog).',
    securityInsight: 'SYN Flood attacks spam millions of spoofed SYN packets to exhaust this kernel queue memory before ACK arrives.',
    color: 'blue'
  },
  {
    id: 2,
    direction: 'server-to-client',
    flags: ['SYN', 'ACK'],
    seq: 500,
    ack: 101,
    clientState: 'SYN_SENT',
    serverState: 'SYN_RCVD',
    packetName: 'Step 2: Sync-Acknowledgment (SYN-ACK)',
    payloadSummary: 'Server acknowledges Client sequence (Ack = 100 + 1 = 101) and presents its own random ISN (ISN_s = 500).',
    kernelAction: 'Client kernel verifies ACK matches ISN_c + 1. If valid, prepares final confirmation.',
    securityInsight: 'SYN Cookies prevent DoS by encoding state cryptographically in ISN_s instead of allocating server memory.',
    color: 'purple'
  },
  {
    id: 3,
    direction: 'client-to-server',
    flags: ['ACK'],
    seq: 101,
    ack: 501,
    clientState: 'ESTABLISHED',
    serverState: 'ESTABLISHED',
    packetName: 'Step 3: Acknowledgment (ACK)',
    payloadSummary: 'Client confirms Server sequence (Ack = 500 + 1 = 501). Handshake completes; data socket opens.',
    kernelAction: 'Server moves connection from SYN backlog to fully ESTABLISHED accept() queue. Full-duplex pipe ready.',
    securityInsight: 'Once ESTABLISHED, connection can safely transmit TLS Client Hello or HTTP requests.',
    color: 'emerald'
  }
];

export const InteractiveSequenceFlowVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 2600);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentStepData = HANDSHAKE_STEPS[activeStep - 1];

  const rawAsciiSequence = `Client (192.168.1.100)                     Server (142.250.190.46:443)
[State: CLOSED]                                [State: LISTEN]

    |                                               |
(1) | ---------- [SYN, Seq=100, MSS=1460] --------> | (Allocates TCB memory)
    |                                               | [State: SYN_RCVD]
[State: SYN_SENT]                                   |
    |                                               |
(2) | <------- [SYN-ACK, Seq=500, Ack=101] -------- |
    |                                               |
    |                                               |
(3) | ---------- [ACK, Seq=101, Ack=501] ---------> | (Moved to accept queue)
    |                                               |
[State: ESTABLISHED]                            [State: ESTABLISHED]
    ================== FULL DUPLEX STREAM ==================`;

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(rawAsciiSequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-card text-card-foreground border border-border shadow-2xs overflow-hidden my-5 space-y-0">
      {/* Top Bar */}
      <div className="p-3.5 sm:p-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-mono">
                TCP 3-Way Handshake Flow
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-brand-purple/10 text-brand-purple">
                Protocol Sequence
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Interactive packet transit & kernel socket state machine
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-secondary text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Visual Flow
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Raw Diagram
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Endpoint Blocks Header (Client vs Server) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {/* Client Node */}
            <div className="p-3.5 rounded-2xl bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      Client Host
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      192.168.1.100:54321
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-medium">Socket State</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    currentStepData.clientState === 'ESTABLISHED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {currentStepData.clientState}
                </span>
              </div>
            </div>

            {/* Server Node */}
            <div className="p-3.5 rounded-2xl bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-purple/15 text-brand-purple flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      Web Server
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      142.250.190.46:443
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-medium">Socket State</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    currentStepData.serverState === 'ESTABLISHED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : currentStepData.serverState === 'SYN_RCVD'
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                      : 'bg-neutral-200/80 dark:bg-white/10 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {currentStepData.serverState}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Flow Transit Canvas */}
          <div className="relative py-2 space-y-3">
            {/* Timeline Vertical Track Guides */}
            <div className="absolute inset-y-0 left-[25%] sm:left-[25%] w-px bg-border pointer-events-none" />
            <div className="absolute inset-y-0 right-[25%] sm:right-[25%] w-px bg-border pointer-events-none" />

            {/* Sequence Packets (3 Steps) */}
            {HANDSHAKE_STEPS.map((step) => {
              const isCurrent = activeStep === step.id;
              const isPast = activeStep > step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(step.id);
                  }}
                  className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-accent'
                      : 'bg-muted/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    {/* Step Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : isPast
                            ? 'bg-brand-emerald text-white'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {isPast ? <Check className="w-3 h-3" /> : step.id}
                      </span>
                    </div>

                    {/* Directional Connecting Arrow & Packet Header Pill */}
                    <div className="flex-1 flex items-center justify-center min-w-0">
                      {step.direction === 'client-to-server' ? (
                        <div className="w-full flex items-center gap-2 min-w-0">
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-blue/60 via-brand-blue to-brand-blue/60 rounded-full" />
                          <div
                            className={`px-3 py-1 rounded-xl text-center shrink-0 flex items-center gap-2 ${
                              isCurrent
                                ? 'bg-brand-blue/20 text-brand-blue font-bold'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            <span className="font-mono text-[11px] font-bold">
                              {step.flags.join('+')}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              Seq={step.seq} {step.ack ? `Ack=${step.ack}` : ''}
                            </span>
                          </div>
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-blue/60 via-brand-blue to-brand-blue/60 rounded-full" />
                          <ArrowRight className="w-4 h-4 text-brand-blue shrink-0" />
                        </div>
                      ) : (
                        <div className="w-full flex items-center gap-2 min-w-0">
                          <ArrowLeft className="w-4 h-4 text-brand-purple shrink-0" />
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-purple/60 via-brand-purple to-brand-purple/60 rounded-full" />
                          <div
                            className={`px-3 py-1 rounded-xl text-center shrink-0 flex items-center gap-2 ${
                              isCurrent
                                ? 'bg-brand-purple/20 text-brand-purple font-bold'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            <span className="font-mono text-[11px] font-bold">
                              {step.flags.join('+')}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              Seq={step.seq} Ack={step.ack}
                            </span>
                          </div>
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-purple/60 via-brand-purple to-brand-purple/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(num);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    activeStep === num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}
                >
                  Step {num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-accent text-secondary-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(1);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Deep Step Inspector Card */}
          <div className="p-4 rounded-2xl bg-muted/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground font-mono">
                  {currentStepData.packetName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-secondary text-secondary-foreground">
                  Flags: {currentStepData.flags.join(', ')}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Seq: <strong className="text-brand-blue">{currentStepData.seq}</strong>
                {currentStepData.ack !== null && (
                  <> • Ack: <strong className="text-brand-emerald">{currentStepData.ack}</strong></>
                )}
              </span>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              {currentStepData.payloadSummary}
            </p>

            {/* Kernel OS Action */}
            <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue text-[11px] flex items-start gap-2 leading-relaxed">
              <Cpu className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold">Kernel OS Behavior:</strong> {currentStepData.kernelAction}
              </span>
            </div>

            {/* Security Vulnerability Insight */}
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] flex items-start gap-2 leading-relaxed border border-neutral-200 dark:border-neutral-700">
              <Shield className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold">Security Analysis:</strong> {currentStepData.securityInsight}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Monospaced Raw Diagram View */
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-mono text-muted-foreground">Standard RFC Monospace Representation</span>
            <button
              onClick={handleCopyAscii}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-secondary text-secondary-foreground hover:bg-accent flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Diagram'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-950 dark:bg-black text-neutral-100 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-neutral-800 select-all">
            {rawAsciiSequence}
          </pre>
        </div>
      )}
    </div>
  );
};
