import React, { useEffect, useState } from 'react';

interface Offer {
  offer_id: number;
  offer_name: string;
  offer_percentage: number;
  offer_description: string;
}

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/offers', { method: 'GET' });
      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && result.data) {
          setOffers(result.data);
        }
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700">Offers</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-center text-gray-500">No offers available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.offer_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-pink-700 mb-2">{offer.offer_name}</h2>
              <div className="text-pink-600 font-bold mb-2">{offer.offer_percentage}% OFF</div>
              <div className="text-gray-700 mb-2">{offer.offer_description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
