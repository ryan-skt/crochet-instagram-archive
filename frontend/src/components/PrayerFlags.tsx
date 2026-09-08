export default function PrayerFlags() {
  const flags = [
    { bgColor: 'bg-[#1a2b4c]', textColor: 'text-white', tibetan: 'ཨོཾ', english: 'OM', fill: 'fill-white' },
    { bgColor: 'bg-white', textColor: 'text-[#1a2b4c]', tibetan: 'མ', english: 'MA', fill: 'fill-[#1a2b4c]' },
    { bgColor: 'bg-[#b91e23]', textColor: 'text-white', tibetan: 'ཎི', english: 'NI', fill: 'fill-white' },
    { bgColor: 'bg-[#1b5e3a]', textColor: 'text-white', tibetan: 'པདྨེ', english: 'PADME', fill: 'fill-white' },
    { bgColor: 'bg-[#f4a11d]', textColor: 'text-[#1a2b4c]', tibetan: 'ཧཱུྃ', english: 'HUM', fill: 'fill-[#1a2b4c]' },
  ];

  // Repeat sequence twice to span across the container
  const displayFlags = [...flags, ...flags];

  return (
    <div className="absolute top-0 left-0 right-0 h-40 flex justify-center z-0 overflow-hidden pointer-events-none">
      
      {/* The hanging string */}
      <svg className="absolute top-0 left-0 w-full h-32" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M 0,0 Q 50,30 100,0" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      </svg>
      
      {/* The flags container */}
      <div className="relative w-full max-w-5xl mx-auto flex justify-around px-4 pt-[2px]">
        {displayFlags.map((flag, i) => {
          const normalizedPos = Math.abs((i / (displayFlags.length - 1)) * 2 - 1);
          const dip = (1 - normalizedPos * normalizedPos) * 12; // Dip calculation
          
          return (
            <div 
              key={i} 
              className={`w-12 sm:w-16 h-16 sm:h-24 ${flag.bgColor} border-[2px] sm:border-[3px] border-[#d4af37] ${flag.textColor} shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between py-1 sm:py-2 relative transform origin-top`}
              style={{
                marginTop: `${dip}px`,
                animation: `windBlow ${2.5 + Math.random() * 1.5}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random()}s`,
              }}
            >
              {/* Top Hem attachment */}
              <div className="absolute -top-[3px] left-0 right-0 h-[3px] bg-[#b38e24]"></div>
              
              {/* Tibetan Character */}
              <div className="text-xl sm:text-3xl font-serif mt-1">
                {flag.tibetan}
              </div>
              
              {/* English Transliteration */}
              <div className="text-[7px] sm:text-[9px] font-bold tracking-widest uppercase mb-1">
                {flag.english}
              </div>
              
              {/* Decorative Lotus Base */}
              <div className="w-8 sm:w-10 flex justify-center mb-0.5">
                <svg viewBox="0 0 100 30" className={`w-full h-auto opacity-90 ${flag.fill}`}>
                  <path d="M 10 15 Q 25 5 50 25 Q 75 5 90 15 Q 85 25 50 30 Q 15 25 10 15 Z" />
                  <path d="M 0 10 Q 15 0 30 15 Q 15 20 0 10 Z" />
                  <path d="M 100 10 Q 85 0 70 15 Q 85 20 100 10 Z" />
                  <circle cx="50" cy="15" r="4" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes windBlow {
          0% { transform: rotateX(5deg) rotateZ(-2deg) skewX(0deg); }
          50% { transform: rotateX(30deg) rotateZ(3deg) skewX(-5deg); }
          100% { transform: rotateX(45deg) rotateZ(-1deg) skewX(8deg); }
        }
      `}</style>
    </div>
  );
}
