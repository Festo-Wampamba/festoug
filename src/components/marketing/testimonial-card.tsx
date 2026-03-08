import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  avatar: string;
  testimonial: string;
}

export function TestimonialCard({ name, avatar, testimonial }: TestimonialCardProps) {
  return (
    <div className="min-w-full sm:min-w-[calc(50%-15px)] xl:min-w-[calc(50%-15px)] shrink-0 flex flex-col scroll-snap-align-center">
      <div className="relative bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)] p-5 pt-8 rounded-[14px] shadow-1 flex-1 flex flex-col justify-between mt-8">
        <figure className="absolute top-0 left-0 transform translate-x-[15px] -translate-y-[25px] bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)] rounded-[14px] shadow-1">
          <Image 
            src={avatar} 
            alt={name} 
            width={60} 
            height={60} 
            className="rounded-[14px] object-cover" 
          />
        </figure>
        
        <h4 className="text-white-2 text-base font-semibold capitalize mb-[7px] ml-[80px]">
          {name}
        </h4>
        
        <div className="text-light-gray text-sm font-light leading-relaxed flex-1 flex items-center mt-2">
          <p>{testimonial}</p>
        </div>
      </div>
    </div>
  );
}
