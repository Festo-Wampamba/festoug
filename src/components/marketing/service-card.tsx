import Image from "next/image";

interface ServiceCardProps {
  title: string;
  icon: string;
  description: string;
}

export function ServiceCard({ title, icon, description }: ServiceCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-jet to-jet/0 p-5 rounded-[14px] shadow-2 z-10 flex flex-col justify-start">
      <div className="absolute inset-[1px] bg-gradient-to-br from-[hsla(240,1%,18%,0.25)] to-[hsla(240,2%,11%,0)] bg-eerie-black-1 rounded-[14px] -z-10" />
      
      <div className="mb-[10px] flex justify-center">
        <Image src={icon} alt={title} width={40} height={40} className="object-contain" />
      </div>
      
      <div className="text-center">
        <h4 className="text-white-2 text-base font-semibold capitalize mb-[7px]">
          {title}
        </h4>
        <p className="text-light-gray text-sm font-light leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
