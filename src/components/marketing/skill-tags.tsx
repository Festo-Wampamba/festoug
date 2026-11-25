interface SkillGroup {
  label: string;
  skills: string[];
}

export function SkillTags({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="skill-groups">
      {groups.map((group, i) => (
        <div
          key={group.label}
          className="skill-group min-w-0 rounded-xl border border-border p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <h3 className="mb-4 flex items-start gap-3 text-base font-semibold leading-snug text-foreground">
            <span aria-hidden="true" className="mt-0.5 font-mono text-xs font-normal text-primary">0{i + 1}</span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{group.label}</span>
          </h3>
          <ul className="skill-grid">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className={`skill-cell ${skill.length > 12 ? "skill-cell-wide" : ""} flex min-w-0 items-center rounded-lg bg-secondary px-3 py-2.5 text-sm leading-normal text-secondary-foreground`}
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
