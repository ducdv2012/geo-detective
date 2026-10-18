import { useEffect, useRef, useState } from "react";
import type { Locale } from "../types";

const content = {
  vi: [
    {
      kicker: "BƯỚC 01 · NHẬN NHIỆM VỤ",
      title: "CHỌN HỒ SƠ",
      body: "Mỗi hồ sơ là một cuộc truy bắt xuyên quốc gia. Bạn có tối đa ba ngày để tìm đúng nơi nghi phạm đang ẩn náu.",
    },
    {
      kicker: "BƯỚC 02 · PHÂN TÍCH",
      title: "ĐỌC MANH MỐI",
      body: "Đối chiếu khu vực, ngôn ngữ, tiền tệ và địa lý. Ba manh mối đầu luôn miễn phí; dữ liệu bổ sung có thể được giải mã bằng điểm điều tra.",
    },
    {
      kicker: "BƯỚC 03 · HÀNH ĐỘNG",
      title: "KHOANH VÙNG MỤC TIÊU",
      body: "Chọn một quốc gia trong danh sách rồi tiến hành bắt giữ. Đoán sai khiến mục tiêu đổi quốc gia và bạn mất một ngày.",
    },
    {
      kicker: "BƯỚC 04 · XÂY DỰNG SỰ NGHIỆP",
      title: "NHẬN THƯỞNG",
      body: "Phá án sớm để nhận nhiều điểm hơn. Danh tiếng mở cấp bậc, còn những chiến công đặc biệt sẽ trao huy hiệu vĩnh viễn.",
    },
  ],
  en: [
    {
      kicker: "STEP 01 · TAKE THE ASSIGNMENT",
      title: "CHOOSE A DOSSIER",
      body: "Every dossier begins a transnational pursuit. You have at most three days to locate the fugitive.",
    },
    {
      kicker: "STEP 02 · ANALYZE",
      title: "READ THE CLUES",
      body: "Compare region, language, currency, and geography. The first three clues are free; extra intelligence can be decrypted with intel points.",
    },
    {
      kicker: "STEP 03 · ACT",
      title: "NARROW THE TARGET",
      body: "Choose a country from the shortlist and authorize the arrest. A wrong guess costs one day and sends the target elsewhere.",
    },
    {
      kicker: "STEP 04 · BUILD YOUR CAREER",
      title: "EARN REWARDS",
      body: "Close cases early for a higher score. Reputation unlocks ranks, while exceptional work earns permanent badges.",
    },
  ],
} as const;

interface Props {
  locale: Locale;
  onToggleLocale: () => void;
  onClose: () => void;
}

export function Onboarding({ locale, onToggleLocale, onClose }: Props) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = content[locale][step];
  const labels =
    locale === "vi"
      ? {
          guide: "HƯỚNG DẪN ĐIỀU TRA",
          skip: "BỎ QUA",
          back: "QUAY LẠI",
          next: "TIẾP TỤC",
          start: "BẮT ĐẦU ĐIỀU TRA",
        }
      : {
          guide: "INVESTIGATION BRIEFING",
          skip: "SKIP",
          back: "BACK",
          next: "CONTINUE",
          start: "START INVESTIGATING",
        };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>("button");
    first?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>("button:not(:disabled)"),
      ];
      if (!focusable.length) return;
      const firstItem = focusable[0];
      const lastItem = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="onboarding-overlay">
      <div
        className="onboarding-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <header>
          <span>◢ {labels.guide}</span>
          <div>
            <button onClick={onToggleLocale}>
              {locale === "vi" ? "EN" : "VI"}
            </button>
            <button onClick={onClose}>{labels.skip} ×</button>
          </div>
        </header>
        <div className="onboarding-content" key={`${locale}-${step}`}>
          <div
            className={`tutorial-visual tutorial-step-${step}`}
            aria-hidden="true"
          >
            {step === 0 && (
              <>
                <div className="tutorial-folder">
                  <i />
                  <b>
                    CASE
                    <br />
                    042
                  </b>
                </div>
                <div className="tutorial-clock">72H</div>
              </>
            )}
            {step === 1 && (
              <div className="tutorial-clues">
                <i />
                <i />
                <i />
                <span>+?</span>
              </div>
            )}
            {step === 2 && (
              <>
                <div className="tutorial-radar">
                  <i />
                  <b>⌖</b>
                </div>
                <div className="tutorial-options">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="tutorial-rank">
                  ↟<b>+20 REP</b>
                </div>
                <div className="tutorial-badges">
                  <i>◉</i>
                  <i>◇</i>
                  <i>✦</i>
                </div>
              </>
            )}
          </div>
          <div className="tutorial-copy">
            <small>{item.kicker}</small>
            <h2 id="onboarding-title">{item.title}</h2>
            <p>{item.body}</p>
            <div className="tutorial-dots" aria-label={`${step + 1} / 4`}>
              {content.vi.map((_, index) => (
                <i key={index} className={index === step ? "active" : ""} />
              ))}
            </div>
          </div>
        </div>
        <footer>
          <button
            className="secondary-button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            {labels.back}
          </button>
          {step < 3 ? (
            <button
              className="primary-button"
              onClick={() => setStep((value) => value + 1)}
            >
              <span>{labels.next}</span>
              <b>→</b>
            </button>
          ) : (
            <button className="primary-button" onClick={onClose}>
              <span>{labels.start}</span>
              <b>⌖</b>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
