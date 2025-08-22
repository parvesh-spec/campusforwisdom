import { Link } from "wouter";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col items-start">
              <Link href="/" className="mb-6">
                <img 
                  src="https://image.coinkundli.com/campusforwisdomwhitelogo.png" 
                  alt="Campus for Wisdom" 
                  className="h-18 w-auto cursor-pointer hover:opacity-80 transition-opacity object-contain"
                />
              </Link>
              <p className="text-gray-300 mb-4 max-w-md">
                Empowering the next generation with AI skills. Learn, create, and innovate with cutting-edge artificial intelligence technologies.
              </p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61579634634709" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/campus_for_wishdom/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.youtube.com/@CampusforWishdom" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/courses">
                  <span className="hover:text-white transition-colors cursor-pointer">Courses</span>
                </Link>
              </li>
              <li>
                <Link href="/live-sessions">
                  <span className="hover:text-white transition-colors cursor-pointer">Live Sessions</span>
                </Link>
              </li>
              <li>
                <Link href="/ai-experts">
                  <span className="hover:text-white transition-colors cursor-pointer">1:1 Consultation</span>
                </Link>
              </li>
              <li>
                <Link href="/ebooks">
                  <span className="hover:text-white transition-colors cursor-pointer">Ebooks</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors cursor-pointer">Contact Us</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors cursor-pointer">About</span>
                </Link>
              </li>
              <li>
                <Link href="/become-instructor">
                  <span className="hover:text-white transition-colors cursor-pointer">Become an Instructor</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/legal/privacy-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-service">
                  <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">Cookie Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/refund-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Campus for Wisdom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
