import Image from "next/image";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <div className="bg-muted">
      <div className="container-dashboard  !py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-10 text-center">
          <Link href={`/about`} className="hover:underline">
            About Us
          </Link>
          <Link href={`/contact-us`} className="hover:underline">
            Contact Us
          </Link>
          <Link href={`/policies/privacy-policy`} className="hover:underline">
            Privacy Policy
          </Link>
          <Link href={`/policies/terms`} className="hover:underline">
            Terms of Service
          </Link>
        </div>

        <div className="border-t py-8 flex flex-col items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="relative size-8 object-contain">
              <Image src="/logo.svg" alt="Analyst Zero" className="object-contain" fill />
            </div>
            <span className="text-2xl font-semibold">Analyst Zero</span>
          </div>
          <span>© 2024 Analyst Zero. All rights reserved.</span>
          <a href="https://www.linkedin.com/company/supr-analyst/about/" target="_blank">
            <FaLinkedin className="size-6" />
          </a>
        </div>
      </div>
    </div>
  );
}
