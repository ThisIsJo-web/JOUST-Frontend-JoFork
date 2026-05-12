"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Match, Round, LeaderboardEntry } from "../types";
import MatchCard from "../../../../components/tournaments/bracket/MatchCard";
import { 
  ReactFlow, 
  Background, 
  Panel,
  Node as FlowNode,
  Edge,
  Handle,
  Position,
  NodeProps,
  EdgeTypes,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Layout Constants
const COLUMN_WIDTH = 360;
const BASE_MATCH_GAP = 150;
const HEADER_HEIGHT = 100;

// Custom Match Node Component
const MatchNode = ({ data }: NodeProps<FlowNode<{ 
    match: Match; 
    isAdmin: boolean; 
    updating: string | null; 
    leaderboard: LeaderboardEntry[]; 
    trackedUserId: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
}>>) => {
    return (
        <div className="relative group">
            {/* Input Handles (Incoming from previous round) */}
            <Handle 
                type="target" 
                position={Position.Left} 
                className="!opacity-0 !w-0 !h-0" 
            />
            
            <div onClick={(e) => {
                e.stopPropagation();
                data.onOpenScoring(data.match, { x: e.clientX, y: e.clientY });
            }}>
                <MatchCard 
                    match={data.match} 
                    onOpenScoring={() => {}}
                    isAdmin={data.isAdmin}
                    isUpdating={data.updating === data.match.id}
                    leaderboard={data.leaderboard}
                    trackedUserId={data.trackedUserId}
                />
            </div>

            {/* Output Handle (Outgoing to next round) */}
            <Handle 
                type="source" 
                position={Position.Right} 
                className="!opacity-0 !w-0 !h-0"
            />
        </div>
    );
};

// Custom Champion Node
const ChampionNode = ({ data }: NodeProps<FlowNode<{ label: string }>>) => (
    <div className="flex flex-col items-center">
        <Handle type="target" position={Position.Left} className="!opacity-0" />
        <div className="w-72 p-12 flex flex-col items-center justify-center gap-6 bg-white/5 border border-dashed border-white/10 rounded-sm">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{data.label}</span>
        </div>
    </div>
);

const HeaderNode = ({ data }: NodeProps<FlowNode<{ label: string; sublabel: string }>>) => (
    <div className="w-80 flex flex-col justify-center border-b border-white/5 bg-zinc-900/30 px-4 py-2 opacity-80">
        <span className="text-[11px] font-bold text-white tracking-widest uppercase">{data.label}</span>
        <span className="text-[9px] text-white/30 uppercase tracking-tighter">{data.sublabel}</span>
    </div>
);

const ChampionHeaderNode = ({ data }: NodeProps<FlowNode<{ label: string }>>) => (
    <div className="w-80 flex flex-col justify-center border-b border-primary/20 bg-primary/5 px-4 py-2">
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">{data.label}</span>
    </div>
);


interface EliminationLayoutProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
    addLog: (action: string, details?: string) => void;
}
 
function FlowControls({ trackedUserId, nodes }: { trackedUserId: string | null; nodes: FlowNode[] }) {
    const { setCenter, fitView } = useReactFlow();

    useEffect(() => {
        if (!trackedUserId) {
            fitView({ padding: 0.1, duration: 800 });
            return;
        }
        
        const targetNode = nodes.find(n => 
            (n.data as any)?.match?.player1?.userId === trackedUserId || 
            (n.data as any)?.match?.player2?.userId === trackedUserId
        );
        
        if (targetNode) {
            // Offset to roughly center the match card
            setCenter(targetNode.position.x + 160, targetNode.position.y + 60, { zoom: 1, duration: 800 });
        }
    }, [trackedUserId, nodes, setCenter, fitView]);

    return (
        <Panel position="bottom-center" className="flex gap-2 p-4 z-50 mb-8">
            <div className="bg-[#0a0a0a] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-sm p-1 flex items-center">
                <button onClick={() => fitView({ duration: 800 })} className="px-6 py-3 text-white/60 text-[10px] font-bold hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                    Reset View
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="px-6 py-3 text-white/60 text-[10px] font-bold hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                    Scroll Page ▼
                </button>
            </div>
        </Panel>
    );
}

function FlowLegend() {
    return (
        <Panel position="top-right" className="hidden md:block p-4 pointer-events-none z-50">
            <div className="flex flex-col gap-1 text-[10px] font-bold tracking-widest text-white/40 uppercase bg-black/80 p-4 border border-white/10 backdrop-blur-sm shadow-xl rounded-sm">
                <span><strong className="text-white">SCROLL</strong>: PAN CANVAS</span>
                <span><strong className="text-white">CTRL + SCROLL</strong>: ZOOM</span>
                <span><strong className="text-white">CLICK & DRAG</strong>: PAN CANVAS</span>
            </div>
        </Panel>
    );
}

export default function EliminationLayout({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: EliminationLayoutProps) {
    const [trackedUserId, setTrackedUserId] = useState<string | null>(null);

    const nodeTypes = useMemo(() => ({
        match: MatchNode,
        champion: ChampionNode,
        header: HeaderNode,
        championHeader: ChampionHeaderNode
    }), []);

    const winnersRounds = useMemo(() => tournament?.rounds?.filter((r: Round) => r.roundNumber < 100).sort((a: Round, b: Round) => a.roundNumber - b.roundNumber) || [], [tournament]);
    const losersRounds = useMemo(() => tournament?.rounds?.filter((r: Round) => r.roundNumber >= 100 && r.roundNumber < 200).sort((a: Round, b: Round) => a.roundNumber - b.roundNumber) || [], [tournament]);
    const grandFinals = useMemo(() => tournament?.rounds?.filter((r: Round) => r.roundNumber >= 200).sort((a: Round, b: Round) => a.roundNumber - b.roundNumber) || [], [tournament]);

    // Recursive Y positioning logic (shared with React Flow)
    const getMatchY = useCallback((roundIdx: number, matchIdx: number, offset: number = 0): number => {
        if (roundIdx === 0) return (matchIdx + 1) * BASE_MATCH_GAP + offset;
        const p1Y = getMatchY(roundIdx - 1, matchIdx * 2, offset);
        const p2Y = getMatchY(roundIdx - 1, matchIdx * 2 + 1, offset);
        return (p1Y + p2Y) / 2;
    }, []);

    const { nodes, edges } = useMemo(() => {
        const nodes: FlowNode[] = [];
        const edges: Edge[] = [];

        // 1. Winners Bracket
            winnersRounds.forEach((round: Round, rIdx: number) => {
                nodes.push({
                    id: `header-round-${round.roundNumber}`,
                    type: 'header',
                    position: { x: rIdx * COLUMN_WIDTH, y: 50 },
                    data: { label: `WINNERS ROUND ${round.roundNumber}`, sublabel: 'WINNERS BRACKET' },
                    draggable: false, selectable: false
                });

            round.matches.forEach((match: Match, mIdx: number) => {
                const y = getMatchY(rIdx, mIdx);
                nodes.push({
                    id: match.id,
                    type: 'match',
                    position: { x: rIdx * COLUMN_WIDTH, y: y },
                    data: { match, isAdmin, updating, leaderboard, trackedUserId, onOpenScoring },
                    draggable: false
                });

                if (match.nextMatchId) {
                    edges.push({
                        id: `edge-${match.id}-${match.nextMatchId}`,
                        source: match.id, target: match.nextMatchId,
                        type: 'step', style: { stroke: 'rgba(82, 185, 70, 0.2)', strokeWidth: 2 },
                        animated: match.status === 'ONGOING'
                    });
                }
            });
        });

        // 2. Losers Bracket (Rendered below Winners)
        const losersVerticalOffset = (winnersRounds[0]?.matches?.length || 4) * BASE_MATCH_GAP + 400;
            losersRounds.forEach((round: Round, rIdx: number) => {
                const losersRoundLabel = round.roundNumber >= 101 ? `LOSERS ROUND ${round.roundNumber - 100}` : `LOSERS ROUND ${rIdx + 1}`;
                nodes.push({
                    id: `header-round-${round.roundNumber}`,
                    type: 'header',
                    position: { x: rIdx * COLUMN_WIDTH, y: losersVerticalOffset - 100 },
                    data: { label: losersRoundLabel, sublabel: 'LOSERS BRACKET' },
                    draggable: false, selectable: false
                });

            round.matches.forEach((match: Match, mIdx: number) => {
                // For losers bracket, we might want a different Y calc or just the same with offset
                // But double elim losers bracket is complex. For now, simple grid-ish layout.
                const y = losersVerticalOffset + (mIdx * BASE_MATCH_GAP);
                nodes.push({
                    id: match.id,
                    type: 'match',
                    position: { x: rIdx * COLUMN_WIDTH, y: y },
                    data: { match, isAdmin, updating, leaderboard, trackedUserId, onOpenScoring },
                    draggable: false
                });

                if (match.nextMatchId) {
                    edges.push({
                        id: `edge-${match.id}-${match.nextMatchId}`,
                        source: match.id, target: match.nextMatchId,
                        type: 'step', style: { stroke: 'rgba(245, 158, 11, 0.2)', strokeWidth: 2 },
                        animated: match.status === 'ONGOING'
                    });
                }
            });
        });

        // 3. Grand Finals
        grandFinals.forEach((round: Round, rIdx: number) => {
            const gfX = (winnersRounds.length + rIdx) * COLUMN_WIDTH;
            const gfY = getMatchY(winnersRounds.length - 1, 0);

            nodes.push({
                id: `header-round-${round.roundNumber}`,
                type: 'header',
                position: { x: gfX, y: 50 },
                data: { label: 'GRAND FINALS', sublabel: 'CHAMPIONSHIP' },
                draggable: false, selectable: false
            });

            round.matches.forEach((match: Match, mIdx: number) => {
                nodes.push({
                    id: match.id,
                    type: 'match',
                    position: { x: gfX, y: gfY + (mIdx * 200) },
                    data: { match, isAdmin, updating, leaderboard, trackedUserId, onOpenScoring },
                    draggable: false
                });

                if (match.nextMatchId) {
                    edges.push({
                        id: `edge-${match.id}-${match.nextMatchId}`,
                        source: match.id, target: match.nextMatchId,
                        type: 'step', style: { stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 3 },
                        animated: match.status === 'ONGOING'
                    });
                }
            });
        });

        // 4. Champion Pedestal
        const allRounds = [...winnersRounds, ...grandFinals];
        if (allRounds.length > 0) {
            const lastRound = allRounds[allRounds.length - 1];
            const finalMatch = lastRound.matches[0];
            if (finalMatch) {
                const championX = allRounds.length * COLUMN_WIDTH;
                const championY = getMatchY(winnersRounds.length - 1, 0);

                nodes.push({
                    id: 'champion-header',
                    type: 'championHeader',
                    position: { x: championX, y: 50 },
                    data: { label: 'CHAMPION' },
                    draggable: false, selectable: false
                });

                nodes.push({
                    id: 'champion-pedestal',
                    type: 'champion',
                    position: { x: championX, y: championY },
                    data: { label: tournament?.winner?.username || 'The Ultimate Winner' },
                    draggable: false
                });

                edges.push({
                    id: `edge-final-champion`,
                    source: finalMatch.id,
                    target: 'champion-pedestal',
                    type: 'step',
                    style: { stroke: 'rgba(82, 185, 70, 0.5)', strokeWidth: 4, strokeDasharray: '5 5' }
                });
            }
        }

        return { nodes, edges };
    }, [winnersRounds, losersRounds, grandFinals, isAdmin, updating, leaderboard, trackedUserId, onOpenScoring, getMatchY, tournament?.winner]);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Toolbar Panel */}
            <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-white/10 shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#52b946]" />
                         <span className="text-[11px] font-bold text-white uppercase tracking-wider">Tournament Tree (React Flow Engine)</span>
                    </div>
                    <div className="relative">
                        <select 
                            value={trackedUserId || ""} 
                            onChange={(e) => setTrackedUserId(e.target.value || null)} 
                            className={`bg-white/5 border border-white/10 px-4 py-2 pr-8 text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all rounded-sm ${trackedUserId ? 'text-primary' : 'text-white/60 hover:border-primary hover:text-white'}`}
                        >
                            <option value="">{trackedUserId ? "Back to Neutral" : "Track Participant"}</option>
                            {leaderboard.map(u => (
                                <option key={u.userId} value={u.userId}>{u.username}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                    </div>
                </div>
            </div>

            {/* Bracket Canvas */}
            <div style={{ width: '100%', height: '80vh', minHeight: '800px' }}>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        connectionMode={ConnectionMode.Loose}
                        fitView
                        minZoom={0.2}
                        maxZoom={1.5}
                        colorMode="dark"
                        proOptions={{ hideAttribution: true }}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        nodesFocusable={false}
                        elementsSelectable={false}
                        zoomOnDoubleClick={false}
                        panOnScroll={true}
                    >
                        <Background color="#111" gap={20} />
                        <FlowControls trackedUserId={trackedUserId} nodes={nodes} />
                        <FlowLegend />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}
