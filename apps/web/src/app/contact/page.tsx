import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${site.name} for Rakhi delivery support and order help.`,
};

export default function ContactPage() {
  return <ContactForm />;
}
