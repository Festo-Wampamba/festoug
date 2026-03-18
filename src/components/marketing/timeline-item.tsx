interface TimelineItemProps {
  institution: string;
  period: string;
  program?: string;
  role?: string;
  description: string;
}

export function TimelineItem({ institution, period, program, role, description }: TimelineItemProps) {
  return (
    <li className="relative mb-5 ml-0 sm:ml-5">
      <div className="hidden sm:block absolute top-[5px] left-[calc(-20px-11px)] w-[12px] h-[12px] bg-orange-yellow-crayola rounded-full z-10 shadow-[0_0_0_4px_theme(colors.jet)]" />

      <h4 className="text-white-2 text-[13px] sm:text-[15px] font-medium capitalize mb-[5px] sm:mb-[7px]">
        {program || role}
      </h4>
      <h5 className="text-white-2 text-[12px] sm:text-[15px] font-medium capitalize mb-[5px] sm:mb-[7px]">
        {institution}
      </h5>
      <span className="text-orange-yellow-crayola text-[12px] sm:text-[15px] font-light block mb-[8px] sm:mb-[10px]">
        {period}
      </span>
      <div className="text-light-gray text-[13px] sm:text-[15px] font-light leading-[1.6] space-y-2">
        {description.split('\n').map((desc, index) => {
          const trimmed = desc.trim();
          if (!trimmed) return null;
          return <p key={index}>{trimmed}</p>;
        })}
      </div>
    </li>
  );
}
