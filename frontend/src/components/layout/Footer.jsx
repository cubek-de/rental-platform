import { Link } from "react-router-dom";
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiCreditCard,
  HiShieldCheck,
} from "react-icons/hi";
import { BsFacebook, BsInstagram, BsTwitter, BsPaypal } from "react-icons/bs";
import { SiVisa, SiMastercard, SiKlarna } from "react-icons/si";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-500 text-white">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left Section - Logo and Address */}
            <div className="space-y-6">
              {/* Logo */}
              <div>
                <Link to="/" className="inline-block">
                  <img
                    src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=100,f=auto,dpr=1,fit=contain/f1737462329590x960045882346967900/Logo_FAIRmietung-Haltern_wei%E2%94%9C%C6%92.png"
                    alt="FAIRmietung Logo"
                    className="h-20 w-auto"
                  />
                </Link>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <HiLocationMarker className="w-5 h-5 text-primary-200 mt-1 flex-shrink-0" />
                  <div className="text-sm leading-relaxed">
                    <div className="font-semibold text-white mb-1">
                      FAIRmietung Haltern am See GmbH
                    </div>
                    <div className="text-primary-100">An der Ziegelei 2</div>
                    <div className="text-primary-100">45721 Haltern am See</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <HiPhone className="w-5 h-5 text-primary-200" />
                  <a
                    href="tel:+492364500890"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    +49 2364 - 500 89 49
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <HiMail className="w-5 h-5 text-primary-200" />
                  <a
                    href="mailto:info@fairmietung.de"
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    info@fairmietung.de
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Folgen Sie uns</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary-400 hover:bg-white hover:text-primary-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <BsFacebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary-400 hover:bg-white hover:text-primary-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <BsInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary-400 hover:bg-white hover:text-primary-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <BsTwitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Center Section - Payment Methods */}
            <div className="text-center space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-6 text-lg">
                  Sichere Zahlungsmethoden
                </h4>

                {/* Payment Icons Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  {/* PayPal */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group">
                    <BsPaypal className="w-8 h-8 text-white mx-auto group-hover:scale-110 transition-transform" />
                    <div className="text-xs text-primary-100 mt-2">PayPal</div>
                  </div>

                  {/* Klarna */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group">
                    <SiKlarna className="w-8 h-8 text-white mx-auto group-hover:scale-110 transition-transform" />
                    <div className="text-xs text-primary-100 mt-2">Klarna</div>
                  </div>

                  {/* Visa */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group">
                    <SiVisa className="w-8 h-8 text-white mx-auto group-hover:scale-110 transition-transform" />
                    <div className="text-xs text-primary-100 mt-2">Visa</div>
                  </div>

                  {/* Mastercard */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group">
                    <SiMastercard className="w-8 h-8 text-white mx-auto group-hover:scale-110 transition-transform" />
                    <div className="text-xs text-primary-100 mt-2">
                      Mastercard
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <HiShieldCheck className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-primary-100">
                    SSL-verschlüsselt
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Information Links */}
            <div className="space-y-6">
              <h4 className="font-semibold text-white text-lg">
                Informationen
              </h4>

              <div className="space-y-3">
                <Link
                  to="/terms"
                  className="block text-primary-100 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transform transition-transform"
                >
                  Allgemeine Geschäftsbedingungen
                </Link>
                <Link
                  to="/payment-terms"
                  className="block text-primary-100 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transform transition-transform"
                >
                  Zahlungs- und Mietbedingungen
                </Link>
                <Link
                  to="/holiday-protection"
                  className="block text-primary-100 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transform transition-transform"
                >
                  Urlaubsschutzpaket
                </Link>
                <Link
                  to="/impressum"
                  className="block text-primary-100 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transform transition-transform"
                >
                  Impressum
                </Link>
                <Link
                  to="/privacy"
                  className="block text-primary-100 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 transform transition-transform"
                >
                  Datenschutzerklärung
                </Link>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <h5 className="font-semibold text-white mb-3">Newsletter</h5>
                <p className="text-xs text-primary-100 mb-3">
                  Erhalten Sie exklusive Angebote und Updates
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Ihre E-Mail"
                    className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded-l-lg text-white placeholder-primary-200 focus:outline-none focus:border-white"
                  />
                  <button className="px-4 py-2 bg-white text-primary-500 rounded-r-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-400/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-primary-100">
              © {currentYear} FAIRmietung Haltern am See GmbH. Alle Rechte
              vorbehalten.
            </div>
            <div className="flex items-center space-x-4 text-xs text-primary-200">
              <span>Made with ❤️ in Deutschland</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
