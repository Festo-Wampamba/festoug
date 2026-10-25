interface SkillGroup {
  label: string;
  skills: string[];
}

export function SkillTags({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="flex flex-col gap-7">
      {groups.map((group, i) => (
        <div
          key={group.label}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <h4 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {group.label}
          </h4>
          <ul className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 font-mono text-sm leading-none text-secondary-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
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
