import { ISLAND_MAP } from '../../data/islandData';
import { navigate } from '../../router';
import { SKILL_REGISTRY } from './registry/skillRegistry';
import { SkillIcon } from './registry/SkillIcon';
import { DIFFICULTY_LABEL, type SkillDefinition } from './registry/types';
import { loadAttempts } from '../training/storage';

const island = ISLAND_MAP['procedural-skills'];

function SkillCard({ skill }: { skill: SkillDefinition }) {
  const available = skill.status === 'available';
  const attempts = available ? loadAttempts(skill.id) : [];
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white/85 shadow-glass backdrop-blur transition ${
        available ? 'border-blue-200 hover:-translate-y-1 hover:shadow-xl' : 'border-white/60 opacity-80'
      }`}
    >
      <div
        className={`relative flex h-28 items-center justify-center ${available ? 'text-white' : 'text-slate-400'}`}
        style={{
          background: available ? `linear-gradient(135deg, ${island.theme.primary}, #0ea5e9)` : 'linear-gradient(135deg, #e2e8f0, #f1f5f9)',
        }}
      >
        <SkillIcon name={skill.icon} className="h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute left-3 top-3 rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-bold tabular-nums">
          SKILL {String(skill.order).padStart(2, '0')}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            available ? 'bg-emerald-400 text-emerald-950' : 'bg-white/80 text-slate-500'
          }`}
        >
          {available ? '已開放' : '規劃中'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">{skill.title}</h3>
          <p className="text-[11px] font-medium text-slate-400">{skill.englishTitle}</p>
        </div>
        <p className="flex-1 text-[13px] leading-relaxed text-slate-600">{skill.summary}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">建議難度：{DIFFICULTY_LABEL[skill.difficulty]}</span>
          {skill.stationMinutes && <span className="rounded-full bg-blue-50 px-2 py-0.5 font-bold text-blue-700">考站 {skill.stationMinutes} 分鐘</span>}
          {attempts.length > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">已練習 {attempts.length} 次</span>}
        </div>
        {available ? (
          <button
            type="button"
            onClick={() => navigate(`/skill/${skill.id}`)}
            className="mt-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
            style={{ background: island.theme.primary }}
          >
            進入訓練 →
          </button>
        ) : (
          <p className="mt-1 rounded-xl border border-dashed border-slate-200 px-4 py-2.5 text-center text-xs font-medium text-slate-400">關卡規劃中，敬請期待</p>
        )}
      </div>
    </article>
  );
}

/** 技能訓練中心：技能操作島 → 八項技能 */
export function SkillCenterPage() {
  const skills = [...SKILL_REGISTRY].sort((a, b) => a.order - b.order);
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-100 via-slate-50 to-blue-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <nav className="flex items-center gap-2 py-3 text-sm">
          <button type="button" onClick={() => navigate('/')} className="rounded-full bg-white/80 px-3 py-1.5 font-bold text-slate-600 shadow-sm hover:bg-white">
            🏝️ 群島
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => navigate('/map/procedural-skills')}
            className="rounded-full bg-white/80 px-3 py-1.5 font-bold shadow-sm hover:bg-white"
            style={{ color: island.themeColor }}
          >
            {island.icon} 技能操作島
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">技能訓練中心</span>
        </nav>

        <header className="relative mt-2 overflow-hidden rounded-3xl p-6 text-white shadow-glass md:p-8" style={{ background: `linear-gradient(120deg, ${island.theme.primary}, #0f172a)` }}>
          <div className="absolute -right-6 -top-10 h-48 w-48 rounded-full bg-sky-400/20 blur-2xl" />
          <p className="text-[11px] font-bold tracking-[0.25em] text-sky-200">PROCEDURAL SKILLS CENTER</p>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">技能訓練中心</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100">
            {island.tagline}。選擇技能進入互動模擬診間，依自己的步調練習器材準備、無菌技術與操作流程。
          </p>
          <p className="mt-3 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-[11px] text-sky-100">
            本中心為教學互動原型，數位評量僅為模擬練習回饋，不等同現場 OSCE 實作成績。
          </p>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </section>
      </div>
    </div>
  );
}
