type AnimatedOrbProps = {
  size?: number;
};

export function AnimatedOrb({ size = 48 }: AnimatedOrbProps) {
  return (
    <>
      <style>{`
        @keyframes orb-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .cherish-orb-spin {
          animation: orb-spin 5s linear infinite;
        }
        .cherish-orb-gradient {
          background: conic-gradient(
            from 0deg,
            #ffbcbc,
            #d8b4fe,
            #bae6fd,
            #fde68a,
            #ffbcbc
          );
        }
      `}</style>
      <div
        className="cherish-orb-spin cherish-orb-gradient shrink-0 rounded-full"
        style={{ width: size, height: size }}
        aria-hidden
      />
    </>
  );
}
