import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface BlogCardProps {
  title: string;
  category: string;
  date: string;
  image: string;
  description: string;
  link: string;
  isFeatured?: boolean;
}

export function BlogCard({ title, category, date, image, description, link, isFeatured }: BlogCardProps) {
  return (
    <li className="group">
      <Link href={link} className="block h-full">
        <div className="relative bg-gradient-to-br from-jet to-jet/0 p-0 rounded-[14px] shadow-2 z-10 h-full flex flex-col overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_0_1px_rgba(56,189,248,0.3)]">
          <div className="absolute inset-[1px] bg-eerie-black-1 rounded-[14px] -z-10" />

          <figure className="relative w-full aspect-video rounded-t-[14px] overflow-hidden bg-bg-gradient-onyx">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {isFeatured && (
              <div className="absolute top-4 right-4 bg-orange-yellow-crayola/90 backdrop-blur-sm shadow-1 text-smoky-black text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20">
                <Star className="w-3.5 h-3.5 fill-smoky-black" />
                Featured
              </div>
            )}
          </figure>

          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-[10px] text-light-gray-70 text-[13px] font-light mb-[10px]">
              <p>{category}</p>
              <span className="w-1 h-1 bg-light-gray-70 rounded-full" />
              <time dateTime={date}>{date}</time>
            </div>

            <h3 className="text-white-2 text-[18px] font-semibold leading-tight mb-[10px] group-hover:text-orange-yellow-crayola transition-colors">
              {title}
            </h3>
            
            <p className="text-light-gray text-[15px] font-light leading-[1.6]">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
