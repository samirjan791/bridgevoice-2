import { RobotAvatar } from "./RobotAvatar";
export function Brand({ full = false }: { full?: boolean }) {
  if (full)
    return (
      <div className="full-brand">
        <RobotAvatar size={240} />
        <small className="robot-meta-label">Powered by Meta</small>
      </div>
    );
  return (
    <span className="v2-wordmark">
      <RobotAvatar size={28} />
      <span>
        Bridge<span>Voice</span>
        <small className="robot-meta-label">Powered by Meta</small>
      </span>
    </span>
  );
}
export function LivingBridge({ busy = false }: { busy?: boolean }) {
  return (
    <div
      className={"living-bridge " + (busy ? "busy" : "")}
      aria-label={
        busy
          ? "Connecting your words: processing"
          : "BridgeVoice connection symbol"
      }
    >
      <svg viewBox="0 0 200 55" fill="none" aria-hidden="true">
        <path
          className="bridge-track"
          d="M10 42C55 42 50 9 100 9s45 33 90 33"
        />
        <path
          className="bridge-pulse"
          d="M10 42C55 42 50 9 100 9s45 33 90 33"
        />
        <circle cx="10" cy="42" r="4" />
        <circle cx="190" cy="42" r="4" />
      </svg>
    </div>
  );
}
