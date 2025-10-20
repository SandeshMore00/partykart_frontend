import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Star } from 'lucide-react';

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
      const response = await fetch('/api/user/information');
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
      
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Phone className="w-6 h-6 mr-2 text-pink-500" />
              Contact Information
            </h2>
            
            {contact ? (
              <div className="space-y-4">
                {/* Phone Numbers */}
                {contact['phone No.'] && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
                    <button
                      onClick={() => handlePhoneClick(contact['phone No.']!)}
                      className="block text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {contact['phone No.']}
                    </button>
                  </div>
                )}

                {/* Email */}
                {contact.email && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                    <button
                      onClick={() => handleEmailClick(contact.email!)}
                      className="block text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {contact.email}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">N/A</p>
            )}
          </div>

          {/* Visit Our Store */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-pink-500" />
              Visit Our Store
            </h2>
            
            {storeInfo ? (
              <div className="space-y-4">
                {/* Address */}
                {storeInfo.Address && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Address</h3>
                    <p className="text-gray-600 whitespace-pre-line">{storeInfo.Address}</p>
                  </div>
                )}

                {/* Store Phone */}
                {storeInfo['phone No'] && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
                    <button
                      onClick={() => handlePhoneClick(storeInfo['phone No']!)}
                      className="block text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {storeInfo['phone No']}
                    </button>
                  </div>
                )}

                {/* Store Email */}
                {storeInfo['email id'] && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                    <button
                      onClick={() => handleEmailClick(storeInfo['email id']!)}
                      className="block text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {storeInfo['email id']}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">N/A</p>
            )}
          </div>

          {/* About PartyKart */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-pink-500" />
              About PartyKart
            </h2>
            
            {aboutInfo?.data ? (
              <p className="text-gray-600 leading-relaxed">{aboutInfo.data}</p>
            ) : (
              <p className="text-gray-500">N/A</p>
            )}
          </div>
        </div>

        {/* Policies Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Policies</h2>
            
            {policiesInfo?.data ? (
              <div className="space-y-2">
                {/* Split the policies data by common separators and create links */}
                {policiesInfo.data.split(/(?:Terms of Service|Return & Exchange|Shipping Information|Bulk Order Discounts)/).filter(Boolean).map((policy, index) => (
                  <div key={index}>
                    <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">
                      {policy.trim()}
                    </a>
                  </div>
                ))}
                {/* Add the specific policy items */}
                <div className="space-y-2 mt-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Privacy Policy</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Terms of Service</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Return & Exchange</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Shipping Information</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Bulk Order Discounts</a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Privacy Policy</a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Terms of Service</a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Return & Exchange</a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Shipping Information</a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors block">Bulk Order Discounts</a>
              </div>
            )}
          </div>

          {/* Google Map Placeholder */}
          {/* <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Find Us</h2>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Google Maps integration coming soon</p>
            </div>
          </div> */}
          {/* Google Map Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Find Us</h2>
            <div className="rounded-lg overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!...your-location..."
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
