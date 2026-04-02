import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">お問い合わせ</h1>
        <p className="text-sm text-gray-600 mb-8">
          2営業日以内にご返信いたします（土日祝を除く）。
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
