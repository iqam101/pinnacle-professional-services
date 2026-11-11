export const BRAND = {
  legalName: "Pinnacle Professional Services Private Limited",
  shortName: "Pinnacle Professional Services",
  tagline: "Your business. Our priority.",
  subTagline: "Everything You Need to Start Right",
  phoneDisplay: "077 302 8033",
  phoneInternational: "+94 77 302 8033",
  phoneHref: "tel:+94773028033",
  whatsappDigits: "94773028033",
  whatsappDisplay: "+94 77 302 8033",
  whatsappHref:
    "https://wa.me/94773028033?text=Hello%20Pinnacle%20Professional%20Services%2C%20I%20would%20like%20to%20inquire%20about%20your%20services.",
  email: "pinnacleprofessionalservices.lk@gmail.com",
  emailHref: "mailto:pinnacleprofessionalservices.lk@gmail.com",
  address: "No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo, Sri Lanka",
  shortAddress: "No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo",
  facebookUrl:
    "https://www.facebook.com/people/Pinnacle-Professional-Services-Private-Limited/61595233707440/",
  hours: "Monday to Friday: 8:30 AM to 5:30 PM | Saturday: 9:00 AM to 1:30 PM",
  colors: {
    crimson: "#A41C21",
    crimsonDark: "#821318",
    gold: "#D79A27",
    goldDark: "#B57B15",
    ink: "#181B20",
    ivory: "#FAF8F5",
  },
} as const;

export const COMPANY_REGISTRATION_PACKAGE = {
  price: "Rs. 32,000",
  badge: "All-Inclusive Incorporation Package",
  title: "Private Limited Company Registration in Sri Lanka",
  subtitle:
    "Everything handled from name approval to statutory registers, seal, and tax startup advice under one transparent fee.",
  features: [
    "Company name Approval",
    "Articles of Association",
    "Form 1, Form 12, Form 19",
    "Certified Form 1",
    "Register BO 01 & BO 5",
    "Bank account opening resolutions",
    "Director Seal",
    "Company Incorporation Advice",
    "Accountancy and Taxation Advice",
  ],
} as const;

/**
 * Ensures no em dashes or HTML em-dash entities appear in dynamic CMS strings.
 */
export function sanitizeNoEmDash(input: string): string {
  if (!input) return "";
  return input
    .replace(/&mdash;/gi, ", ")
    .replace(/\s*\u2014\s*/g, ", ")
    .replace(/\u2014/g, ", ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} min read`;
}
