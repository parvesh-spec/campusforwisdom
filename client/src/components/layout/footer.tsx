import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              CampusForWisdom
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Empowering the next generation with AI skills. Learn, create, and innovate with cutting-edge artificial intelligence technologies.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/courses">
                  <a className="hover:text-white transition-colors">AI Software Development</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="hover:text-white transition-colors">AI Video Creation</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="hover:text-white transition-colors">AI Presentation Design</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="hover:text-white transition-colors">Machine Learning Basics</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/contact">
                  <a className="hover:text-white transition-colors">Contact Us</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Live Chat</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Community</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 CampusForWisdom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
