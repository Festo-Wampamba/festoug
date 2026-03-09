interface TimelineItemProps {
  institution: string;
  period: string;
  program?: string;
  role?: string;
  description: string;
}

export function TimelineItem({ institution, period, program, role, description }: TimelineItemProps) {
  return (
    <li className="relative m-[0_0_20px_20px]">
      <div className="absolute top-[5px] left-[calc(-20px-24px-13.5px)] w-[12px] h-[12px] bg-orange-yellow-crayola rounded-full z-10 shadow-[0_0_0_4px_theme(colors.jet)]" />
      
      <h4 className="text-white-2 text-[15px] font-medium capitalize mb-[7px]">
        {program || role}
      </h4>
      <h5 className="text-white-2 text-[15px] font-medium capitalize mb-[7px]">
        {institution}
      </h5>
      <span className="text-orange-yellow-crayola text-[15px] font-light block mb-[10px]">
        {period}
      </span>
      <ul className="text-light-gray text-[15px] font-light leading-[1.6]">
        {description.split('\n').map((desc, index) => {
          const trimmed = desc.trim();
          if (!trimmed) return null;
          return <li key={index} className="mb-2 list-disc ml-4">{trimmed}</li>;
        })}
      </ul>
    </li>
  );
}
