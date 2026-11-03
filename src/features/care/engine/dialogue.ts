import type { Condition, DialogueNode, DialogueScenario, DialogueState, EmotionCue, Mood, ResponseOption } from '../types';

/**
 * 對話引擎（純函式，不含任何案例內容）
 * - 節點依 responseOptions.next 或 nextNodeConditions（旗標條件）決定分支
 * - 狀態可序列化，供示範、引導模式回溯（重新選擇）與報告重播使用
 */
export function matches(cond: Condition | undefined, flags: string[]) {
  if (!cond) return true;
  if (cond.all && !cond.all.every((f) => flags.includes(f))) return false;
  if (cond.any && !cond.any.some((f) => flags.includes(f))) return false;
  if (cond.none && cond.none.some((f) => flags.includes(f))) return false;
  return true;
}

export function startDialogue(sc: DialogueScenario): DialogueState {
  return { scenarioId: sc.id, nodeId: sc.startNode, flags: [], turns: [], ended: !!sc.nodes[sc.startNode]?.end };
}

export function currentNode(sc: DialogueScenario, st: DialogueState): DialogueNode {
  const n = sc.nodes[st.nodeId];
  if (!n) throw new Error(`找不到對話節點：${st.nodeId}`);
  return n;
}

/** 進入節點時病人實際說的話（依旗標可能有不同版本） */
export function nodeView(n: DialogueNode, flags: string[]): { message: string; mood: Mood; cues: EmotionCue[] } {
  const v = n.variants?.find((x) => matches(x.when, flags));
  return { message: v?.message ?? n.message, mood: v?.mood ?? n.mood, cues: v?.emotionCues ?? n.emotionCues };
}

export function nextNodeId(n: DialogueNode, opt: ResponseOption, flags: string[]): string {
  if (opt.next) return opt.next;
  const hit = n.nextNodeConditions.find((c) => matches(c.when, flags));
  if (!hit) throw new Error(`節點 ${n.dialogueId} 沒有符合的下一步`);
  return hit.to;
}

export function choose(sc: DialogueScenario, st: DialogueState, optionId: string, extra?: { atSec?: number; hintsUsed?: number; retried?: boolean }): DialogueState {
  if (st.ended) return st;
  const n = currentNode(sc, st);
  const opt = n.responseOptions.find((o) => o.id === optionId);
  if (!opt) throw new Error(`節點 ${n.dialogueId} 沒有選項 ${optionId}`);
  const flags = [...new Set([...st.flags, ...(opt.setFlags ?? [])])];
  const to = nextNodeId(n, opt, flags);
  const view = nodeView(n, st.flags);
  return {
    ...st,
    nodeId: to,
    flags,
    ended: !!sc.nodes[to]?.end,
    endReason: sc.nodes[to]?.end ? 'completed' : st.endReason,
    turns: [
      ...st.turns,
      {
        nodeId: n.dialogueId,
        stage: n.stage,
        patientLine: view.message,
        optionId: opt.id,
        text: opt.text,
        quality: opt.quality,
        skills: opt.skills,
        evidence: opt.evidence,
        reply: opt.reply,
        replyMood: opt.replyMood,
        safetyFlags: [...(opt.safetyFlags ?? [])],
        atSec: extra?.atSec ?? 0,
        hintsUsed: extra?.hintsUsed,
        retried: extra?.retried,
      },
    ],
  };
}

/** 引導模式「重新選擇」：回到最後一個回合之前的狀態 */
export function undoLast(sc: DialogueScenario, st: DialogueState): DialogueState {
  if (!st.turns.length) return st;
  let s = startDialogue(sc);
  for (const t of st.turns.slice(0, -1)) s = choose(sc, s, t.optionId, { atSec: t.atSec, hintsUsed: t.hintsUsed, retried: t.retried });
  return s;
}

export function endDialogue(st: DialogueState, reason: DialogueState['endReason']): DialogueState {
  return { ...st, ended: true, endReason: reason };
}

/** 資料檢查：所有分支都能走到結尾、所有 next 指向存在的節點（供測試與開發用） */
export function validateScenario(sc: DialogueScenario): string[] {
  const errs: string[] = [];
  for (const n of Object.values(sc.nodes)) {
    if (n.end) continue;
    if (!n.responseOptions.length) errs.push(`${n.dialogueId}：沒有選項`);
    for (const o of n.responseOptions) {
      if (o.next && !sc.nodes[o.next]) errs.push(`${n.dialogueId}/${o.id}：next ${o.next} 不存在`);
    }
    for (const c of n.nextNodeConditions) if (!sc.nodes[c.to]) errs.push(`${n.dialogueId}：條件目標 ${c.to} 不存在`);
    if (n.responseOptions.some((o) => !o.next) && !n.nextNodeConditions.some((c) => !c.when)) errs.push(`${n.dialogueId}：缺少預設的下一步`);
  }
  if (!sc.nodes[sc.startNode]) errs.push('startNode 不存在');
  return errs;
}

/** 比對兩句台詞是否重複（忽略括號動作描述與標點），用於避免逐字稿重複顯示 */
const norm = (s: string) => s.replace(/（[^）]*）/g, '').replace(/[「」『』…，。？！、\s.]/g, '');
export function repeats(prevReply: string | undefined, message: string) {
  if (!prevReply) return false;
  const a = norm(prevReply);
  const b = norm(message);
  return !!b && a.includes(b);
}
