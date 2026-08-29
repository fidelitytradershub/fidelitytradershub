const WHATSAPP_NUMBER = "2348035823744";
const WHATSAPP_MESSAGE =
  "Hello Fidelity Traders Hub, I need assistance with your platform.";

export default function WhatsAppSupport() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Fidelity Traders Hub on WhatsApp"
      className="group fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-[110] inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-[#25D366] px-3.5 py-3 font-black text-[#06140b] shadow-[0_14px_36px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:left-5 sm:px-4"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-6 w-6 shrink-0 fill-current"
      >
        <path d="M16.04 3A12.85 12.85 0 0 0 5 22.45L3.3 28.7l6.4-1.68A12.9 12.9 0 1 0 16.04 3Zm0 23.58c-2.02 0-3.98-.55-5.69-1.6l-.4-.24-3.8 1 1.02-3.7-.26-.42A10.6 10.6 0 1 1 16.04 26.58Zm5.83-7.94c-.32-.16-1.89-.93-2.18-1.04-.3-.11-.51-.16-.72.16-.21.32-.83 1.04-1.01 1.25-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59a9.64 9.64 0 0 1-1.78-2.21c-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.15 3.09 1.3 3.3.16.21 2.26 3.45 5.48 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.51-.08-.14-.3-.22-.62-.38Z" />
      </svg>

      <span className="hidden whitespace-nowrap text-sm sm:inline">
        WhatsApp Support
      </span>

      <span className="absolute bottom-full left-0 mb-2 hidden whitespace-nowrap rounded-lg bg-[var(--foreground)] px-3 py-2 text-xs font-bold text-[var(--surface)] shadow-lg group-hover:block group-focus-visible:block sm:hidden">
        Chat with support
      </span>
    </a>
  );
}
