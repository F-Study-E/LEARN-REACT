import { useEffect, useLayoutEffect, useRef, useState } from "react";

function burnCpu(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    Math.sqrt(Math.random() * 1000);
  }
}

function LayoutEffectTooltip({ slowRender }: { slowRender: boolean }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  if (slowRender) {
    burnCpu(35);
  }

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // paint 전에 좌표 계산을 끝내서 깜빡임 방지
    setCoords({
      top: buttonRect.top - tooltipRect.height - 8,
      left: buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2,
    });
  }, [open]);

  return (
    <section style={{ marginBottom: 20 }}>
      <h4>1) useLayoutEffect</h4>
      <button ref={buttonRef} onClick={() => setOpen((prev) => !prev)}>
        Tooltip 토글
      </button>
      {open && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            background: "#111",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          useLayoutEffect로 위치 보정
        </div>
      )}
    </section>
  );
}

function EffectTooltip({ slowRender }: { slowRender: boolean }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  if (slowRender) {
    burnCpu(35);
  }

  useEffect(() => {
    if (!open || !buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // paint 이후 보정이라 깜빡임 생길 수 있음
    setCoords({
      top: buttonRect.top - tooltipRect.height - 8,
      left: buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2,
    });
  }, [open]);

  return (
    <section>
      <h4>2) useEffect</h4>
      <button ref={buttonRef} onClick={() => setOpen((prev) => !prev)}>
        Tooltip 토글
      </button>
      {open && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            background: "#1f3b73",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          useEffect로 위치 보정
        </div>
      )}
    </section>
  );
}

export default function Example1() {
  const [slowRender, setSlowRender] = useState(true);

  return (
    <div>
      <h4>Example1 - useLayoutEffect vs useEffect</h4>
      <span>DOM 반영 직후, paint 전에 레이아웃을 보정할 때 사용</span>
      <p>아래 Example1 안에서 두 훅을 직접 비교할 수 있습니다.</p>
      <label style={{ display: "block", marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={slowRender}
          onChange={(e) => setSlowRender(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        렌더링 지연 시뮬레이션 ON/OFF
      </label>
      <LayoutEffectTooltip slowRender={slowRender} />
      <EffectTooltip slowRender={slowRender} />
    </div>
  );
}
