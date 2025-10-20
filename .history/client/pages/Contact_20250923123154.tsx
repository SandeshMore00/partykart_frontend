import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Star } from 'lucide-react';
import config from '../config';


interface ContactInformation {
  email?: string;
  'phone No.'?: number;
  phone?: string | string[];
}

interface StoreInformation {
  Address?: string;
  'email id'?: string;
  'phone No'?: string;
}

interface AboutInformation {
  data?: string;
}

interface PoliciesInformation {
  data?: string;
}

interface ApiResponse {
  contact?: {
    information_description: ContactInformation;
  };
  visit_Our_Store?: {
    information_description: StoreInformation;
  };
  About_PartyKart?: {
    information_description: AboutInformation;
  };
  Policies?: {
    information_description: PoliciesInformation;
  };
}

export default function Contact() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      // const response = await fetch('http://localhost:9000/v1/user/information/');
      const response = await fetch(`${config./v1/user/information/');
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneClick = (phone: string | number) => {
    const phoneStr = phone.toString();
    // Check if device is mobile
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phoneStr}`;
    }
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  const contact = apiData?.contact?.information_description;
  const storeInfo = apiData?.visit_Our_Store?.information_description;
  const aboutInfo = apiData?.About_PartyKart?.information_description;
  const policiesInfo = apiData?.Policies?.information_description;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Us</h1>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Phone className="w-6 h-6 mr-2 text-pink-500" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Primary Phone</h3>
              <a href="tel:+918779319669" className="block text-blue-600 hover:text-blue-800 transition-colors">
                +91 8779319669
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Alternative Phone</h3>
              <a href="tel:+911234567890" className="block text-blue-600 hover:text-blue-800 transition-colors">
                +91 1234567890
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
              <a href="mailto:thepartykartservice@gmail.com" className="block text-blue-600 hover:text-blue-800 transition-colors">
                thepartykartservice@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-pink-500" />
            Visit Our Store
          </h2>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2">SHREE GANESHA ENTERPRISES</h3>
            <p className="text-gray-600 whitespace-pre-line">
              Shop no 01,Tilak road,kashyap hall,Opp. ramdas maruti mandir,near Annapurna,Old panvel,district-raigad,pin-410206,maharashtra,INDIA.
            </p>
            <div className="rounded-lg overflow-hidden h-64 mt-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.690915397131!2d73.10673197390224!3d18.98925298219753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e9f3d3acc655%3A0x5c1a172ba4771e04!2sBaking%20World!5e0!3m2!1sen!2sin!4v1757237930429!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
