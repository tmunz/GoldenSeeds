import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Graph } from '../graph/Graph';
import { animationService, DEFAULT_ANIMATION_SECONDS } from './AnimationService';
import { animationKey, animationValue, applyNumberAnimations, NumberAnimationFrame, NumberAnimationTarget, startupAnimationTarget } from './GraphAnimation';

export interface GraphAnimationControls {
  frames: readonly NumberAnimationFrame[];
  play: (input: NumberAnimationTarget, seconds: number) => void;
  stop: (nodeId: string, portId?: string) => void;
}
export const GraphAnimationContext = createContext<GraphAnimationControls | undefined>(undefined);
const EMPTY_GRAPH: Graph = { nodes: [], edges: [] };

interface Playback extends NumberAnimationFrame { graph: Graph }

export function useGraphAnimation(graph: Graph | undefined) {
  const [playback, setPlayback] = useState<Record<string, Playback>>({});
  const currentGraph = useRef(graph);
  currentGraph.current = graph;
  const cancellations = useRef(new Map<string, () => void>());
  const started = useRef(false);

  const stop = useCallback((nodeId: string, portId?: string) => {
    const key = animationKey(nodeId, portId);
    cancellations.current.get(key)?.();
    cancellations.current.delete(key);
    setPlayback((frames) => {
      if (!(key in frames)) { return frames; }
      const next = { ...frames };
      delete next[key];
      return next;
    });
  }, []);

  const play = useCallback((input: NumberAnimationTarget, seconds: number) => {
    const base = currentGraph.current;
    if (!base || !Number.isFinite(input.target) || !Number.isFinite(seconds) || seconds <= 0) { return; }
    stop(input.nodeId, input.portId);
    const key = animationKey(input.nodeId, input.portId);
    const cancel = animationService.animateNumber(input.target, seconds, (raw) => {
      if (currentGraph.current !== base) { return; }
      const value = animationValue(input, raw);
      setPlayback((frames) => ({ ...frames, [key]: { input, value, graph: base } }));
    }, () => stop(input.nodeId, input.portId));
    cancellations.current.set(key, cancel);
  }, [stop]);

  // Any edit, undo, config switch, or unmount ends playback rather than saving an intermediate value.
  useEffect(() => {
    const active = cancellations.current;
    setPlayback({});
    return () => {
      active.forEach((cancel) => cancel());
      active.clear();
    };
  }, [graph]);

  useEffect(() => {
    if (!graph || graph.nodes.length <= 1 || started.current) { return; }
    // Deferral makes setup/cleanup safe under React StrictMode's extra effect cycle.
    const timeout = setTimeout(() => {
      if (started.current) { return; }
      started.current = true;
      const input = startupAnimationTarget(graph);
      if (input) { play(input, DEFAULT_ANIMATION_SECONDS); }
    }, 0);
    return () => clearTimeout(timeout);
  }, [graph, play]);

  const frames = useMemo(() => Object.values(playback).filter((frame) => frame.graph === graph), [playback, graph]);
  const animatedGraph = useMemo(() => applyNumberAnimations(graph ?? EMPTY_GRAPH, frames), [graph, frames]);
  return useMemo(() => ({ frames, play, stop, graph: animatedGraph }), [frames, play, stop, animatedGraph]);
}
