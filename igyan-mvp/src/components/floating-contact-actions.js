import { Mail } from "lucide-react";

const EMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=igyan.ai.team@gmail.com";

function WhatsAppIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.15 1.6 5.95L0 24l6.27-1.64a11.95 11.95 0 0 0 5.77 1.47h.01C18.64 23.83 24 18.47 24 11.88c0-3.19-1.24-6.18-3.48-8.4ZM12.05 21.8a9.87 9.87 0 0 1-5.04-1.38l-.36-.21-3.72.97 1-3.63-.23-.37a9.86 9.86 0 0 1-1.52-5.23c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.43 9.88-9.88 9.88Zm5.41-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-1.77-.88-2.94-1.57-4.11-3.56-.31-.53.31-.49.88-1.63.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function FloatingContactActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a href={EMAIL_COMPOSE_URL} target="_blank" rel="noopener noreferrer" aria-label="Email IGYAN AI" className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl transition hover:-translate-y-1 hover:text-[#064bb2]">
        <Mail className="h-6 w-6" strokeWidth={2} />
      </a>
      <a href="https://wa.me/917004201514" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#1ebe5d]">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
