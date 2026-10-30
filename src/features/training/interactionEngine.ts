import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { NewEvent, TrainingEvent, TrainingModeConfig } from './types';

/**
 * InteractionEngine
 * 將「技能專屬的互動規則（domain reducer）」與「共用的事件紀錄、計時、暫停、結束」分開。
 * domain reducer 為純函式：(state, action) → { state, events }，方便測試與日後換技能。
 */
export interface DomainResult<S> {
  state: S;
  events?: NewEvent[];
}

export type DomainReducer<S, A> = (state: S, action: A) => DomainResult<S>;

export interface EngineState<S> {
  domain: S;
  events: TrainingEvent[];
  nextId: number;
  elapsed: number;
  paused: boolean;
  finished: null | 'finished' | 'timeout';
}

type EngineAction<S, A> =
  | { type: 'domain'; action: A }
  | { type: 'log'; event: NewEvent }
  | { type: 'tick'; dt: number; limit: number | null }
  | { type: 'pause'; paused: boolean }
  | { type: 'finish'; reason: 'finished' | 'timeout' }
  | { type: 'reset'; domain: S };

function appendEvents<S>(s: EngineState<S>, events: NewEvent[] | undefined): EngineState<S> {
  if (!events?.length) return s;
  let id = s.nextId;
  const stamped = events.map((e) => ({ ...e, id: id++, t: Math.round(s.elapsed) }));
  return { ...s, events: [...s.events, ...stamped], nextId: id };
}

export function useInteractionEngine<S, A>(reducer: DomainReducer<S, A>, createInitial: () => S, mode: TrainingModeConfig) {
  const engineReducer = useCallback(
    (s: EngineState<S>, a: EngineAction<S, A>): EngineState<S> => {
      switch (a.type) {
        case 'domain': {
          if (s.finished) return s;
          const r = reducer(s.domain, a.action);
          return appendEvents({ ...s, domain: r.state }, r.events);
        }
        case 'log':
          return appendEvents(s, [a.event]);
        case 'tick': {
          if (s.paused || s.finished) return s;
          const elapsed = s.elapsed + a.dt;
          if (a.limit !== null && elapsed >= a.limit) {
            return appendEvents({ ...s, elapsed: a.limit, finished: 'timeout' }, [
              { stepId: 'system', kind: 'system', code: 'timeout', message: '考站時間到，本次模擬結束。' },
            ]);
          }
          return { ...s, elapsed };
        }
        case 'pause':
          if (s.finished) return s;
          return appendEvents({ ...s, paused: a.paused }, a.paused ? [{ stepId: 'system', kind: 'system', code: 'pause', message: '暫停模擬' }] : []);
        case 'finish':
          return s.finished ? s : { ...s, finished: a.reason };
        case 'reset':
          return { domain: a.domain, events: [], nextId: 1, elapsed: 0, paused: false, finished: null };
      }
    },
    [reducer],
  );

  const [state, send] = useReducer(engineReducer, undefined, () => ({
    domain: createInitial(),
    events: [],
    nextId: 1,
    elapsed: 0,
    paused: false,
    finished: null,
  }));

  // 計時器
  const last = useRef(performance.now());
  useEffect(() => {
    last.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      send({ type: 'tick', dt: (now - last.current) / 1000, limit: mode.timeLimitSec });
      last.current = now;
    }, 250);
    return () => window.clearInterval(id);
  }, [mode.timeLimitSec]);

  const dispatch = useCallback((action: A) => send({ type: 'domain', action }), []);
  const log = useCallback((event: NewEvent) => send({ type: 'log', event }), []);
  const setPaused = useCallback((paused: boolean) => send({ type: 'pause', paused }), []);
  const finish = useCallback(() => send({ type: 'finish', reason: 'finished' }), []);
  const reset = useCallback(() => send({ type: 'reset', domain: createInitial() }), [createInitial]);

  return { state, dispatch, log, setPaused, finish, reset };
}
