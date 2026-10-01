import React from 'react';

export function BackgroundDecoration() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base subtle radial warmth / pale blue glow */}
      <div
        className="absolute -top-[12%] -left-[10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(145, 169, 201, 0.16) 0%, rgba(237, 244, 252, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* 2. Soft center-right architectural orb */}
      <div
        className="absolute top-[35%] -right-[12%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full blur-3xl opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(145, 169, 201, 0.14) 0%, rgba(250, 249, 245, 0) 70%)',
        }}
      />

      {/* 3. Lower left ambient glow */}
      <div
        className="absolute -bottom-[10%] left-[15%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-3xl opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(82, 119, 168, 0.10) 0%, transparent 65%)',
        }}
      />

      {/* 4. Extremely faint architectural grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #041128 1px, transparent 1px),
            linear-gradient(to bottom, #041128 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* 5. Minimal architectural accent lines */}
      <div className="absolute top-[18%] left-[8%] w-[1px] h-[140px] bg-gradient-to-b from-transparent via-[#91A9C9]/25 to-transparent hidden md:block" />
      <div className="absolute top-[65%] right-[10%] w-[1px] h-[160px] bg-gradient-to-b from-transparent via-[#91A9C9]/25 to-transparent hidden md:block" />
      <div className="absolute top-[48%] left-[4%] w-[120px] h-[1px] bg-gradient-to-r from-transparent via-[#91A9C9]/20 to-transparent hidden lg:block" />
    </div>
  );
}
