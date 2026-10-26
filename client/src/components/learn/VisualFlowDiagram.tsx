import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowDown,
  Layers,
  Cpu,
  Database,
  Shield,
  Activity,
  Zap,
  CheckCircle2,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';

export interface FlowNode {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  accent: 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'cyan';
  iconType?: 'cpu' | 'shield' | 'layers' | 'database' | 'zap' | 'activity';
  inputs?: string[];
  outputs?: string[];
  notes?: string;
}

export interface FlowConnector {
  from: string;
  to: string;
  label?: string;
}

interface VisualFlowDiagramProps {
  title: string;
  category?: string;
  description?: string;
  nodes: FlowNode[];
  connectors?: FlowConnector[];
}

export const VisualFlowDiagram: React.FC<VisualFlowDiagramProps> = ({
  title,
  category = 'Architecture Flow',
  description = 'Interactive execution pipeline showing state transitions and data contracts',
  nodes,
  connectors = []
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getIcon = (type?: FlowNode['iconType'], accent?: FlowNode['accent']) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'cpu':
        return <Cpu className={iconClass} />;
      case 'shield':
        return <Shield className={iconClass} />;
      case 'database':
        return <Database className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  const getAccentStyles = (accent: FlowNode['accent'], isSelected: boolean) => {
    switch (accent) {
      case 'blue':
        return isSelected
          ? 'bg-brand-blue/25 text-foreground font-bold'
          : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20';
      case 'purple':
        return isSelected
          ? 'bg-brand-purple/25 text-foreground font-bold'
          : 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20';
      case 'emerald':
        return isSelected
          ? 'bg-brand-emerald/25 text-foreground font-bold'
          : 'bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20';
      case 'orange':
        return isSelected
          ? 'bg-orange-500/25 text-foreground font-bold'
          : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20';
      case 'rose':
        return isSelected
          ? 'bg-rose-500/25 text-foreground font-bold'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20';
      case 'cyan':
        return isSelected
          ? 'bg-brand-cyan/25 text-foreground font-bold'
          : 'bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20';
      default:
        return isSelected
          ? 'bg-accent text-foreground font-bold'
          : 'bg-muted text-muted-foreground hover:bg-accent';
    }
  };

  return (
    <div className="rounded-2xl bg-card text-card-foreground border border-border shadow-2xs overflow-hidden my-5 space-y-0">
      {/* Header Bar */}
      <div className="p-3.5 sm:p-4 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-mono">
                {title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-brand-blue/10 text-brand-blue">
                {category}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
          {nodes.length} Connected Stages
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Connected Node Pipeline */}
        <div className="overflow-x-auto pb-1 max-w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 w-full">
            {nodes.map((node, i) => {
              const isSelected = selectedNode?.id === node.id;
              const connector = connectors.find((c) => c.from === node.id);

              return (
                <React.Fragment key={node.id}>
                  {/* Block Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col gap-1.5 flex-1 min-w-[130px] shrink-0 ${getAccentStyles(
                      node.accent,
                      isSelected
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold opacity-75">
                          {node.stepNumber}
                        </span>
                        {getIcon(node.iconType, node.accent)}
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-wider opacity-70">
                        Stage
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold block leading-snug truncate">
                        {node.title}
                      </span>
                      <span className="text-[10px] opacity-80 block truncate font-mono">
                        {node.subtitle}
                      </span>
                    </div>
                  </button>

                  {/* Connecting Arrow between Blocks */}
                  {i < nodes.length - 1 && (
                    <div className="flex sm:flex-col items-center justify-center shrink-0 px-1 py-0.5 text-muted-foreground">
                      <span className="hidden sm:inline">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <span className="sm:hidden">
                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                      </span>
                      {connector?.label && (
                        <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                          {connector.label}
                        </span>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Block Deep Inspector */}
        {selectedNode && (
          <div className="p-4 rounded-2xl bg-muted/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground font-mono">
                  Stage {selectedNode.stepNumber}: {selectedNode.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-secondary text-secondary-foreground">
                  {selectedNode.subtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed font-sans">
              {selectedNode.description}
            </p>

            {/* Inputs / Outputs Contract */}
            {(selectedNode.inputs || selectedNode.outputs) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {selectedNode.inputs && selectedNode.inputs.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted space-y-1">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground block">
                      Incoming Payload / Pre-requisites:
                    </span>
                    <ul className="text-[11px] text-foreground/80 space-y-0.5 font-mono">
                      {selectedNode.inputs.map((inp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-brand-blue shrink-0" />
                          <span>{inp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNode.outputs && selectedNode.outputs.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted space-y-1">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground block">
                      Emitted State / Next Hand-off:
                    </span>
                    <ul className="text-[11px] text-foreground/80 space-y-0.5 font-mono">
                      {selectedNode.outputs.map((out, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-brand-emerald shrink-0" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Execution / Security Notes */}
            {selectedNode.notes && (
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] flex items-start gap-2 leading-relaxed border border-neutral-200 dark:border-neutral-700">
                <Info className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold">Execution Note:</strong> {selectedNode.notes}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
