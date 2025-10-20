import React, { useEffect, useState } from 'react';

interface Offer {
  offer_id: number;
  offer_name: string;
  offer_percentage: number;
  offer_description: string;
}

interface OffersSelectProps {
  onApply: (offer: Offer) => void;
  appliedOfferId?: number;
}

const OffersSelect: React.FC<OffersSelectProps> = ({ onApply, appliedOfferId }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9012/v1/offers/', { method: 'GET' });
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
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Apply Offer</h3>
      {loading ? (
        <div className="text-gray-500">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-gray-500">No offers available.</div>
      ) : (
        <div className="space-y-2">
          {offers.map((offer) => (
            <div key={offer.offer_id} className={`p-3 rounded border ${appliedOfferId === offer.offer_id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-pink-700">{offer.offer_name}</div>
                  <div className="text-xs text-gray-500">{offer.offer_description}</div>
                  <div className="text-pink-600 font-bold">{offer.offer_percentage}% OFF</div>
                </div>
                <button
                  className={`ml-4 px-4 py-1 rounded text-sm font-medium ${appliedOfferId === offer.offer_id ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                  disabled={appliedOfferId === offer.offer_id}
                  onClick={() => onApply(offer)}
                >
                  {appliedOfferId === offer.offer_id ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersSelect;
