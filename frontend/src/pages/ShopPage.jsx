import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import API from '../utils/api'

export default function ShopPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await API.get(`/shop/${slug}`)
        setShop(res.data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchShop()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Shop not found!</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-emerald-500 px-6 pt-10 pb-8 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-emerald-600 font-bold text-2xl">
          {shop.shopName?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{shop.shopName}</h1>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full mt-2 inline-block">
          {shop.category}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">

        {/* Contact Buttons */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            {shop.whatsapp && (
              
              <a  href={`https://wa.me/${shop.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-green-50 text-green-700 rounded-xl py-3 text-sm font-semibold"
              >
                <span className="text-xl">💬</span>
                WhatsApp
              </a>
            )}
            {shop.phone && (
              
             <a   href={`tel:${shop.phone}`}
                className="flex flex-col items-center gap-1 bg-blue-50 text-blue-700 rounded-xl py-3 text-sm font-semibold"
              >
                <span className="text-xl">📞</span>
                Call Now
              </a>
            )}
            {shop.instagram && (
            <a  
                href={shop.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-pink-50 text-pink-700 rounded-xl py-3 text-sm font-semibold"
              >
                <span className="text-xl">📸</span>
                Instagram
              </a>
            )}
            {shop.googleMapsUrl && (
              
             <a   href={shop.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-amber-50 text-amber-700 rounded-xl py-3 text-sm font-semibold"
              >
                <span className="text-xl">📍</span>
                Direction
              </a>
            )}
          </div>
        </div>

        {/* Offer */}
        {shop.offer && (
          <div className="bg-amber-50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-2xl">🏷️</span>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Today's Offer</p>
              <p className="text-sm font-medium text-amber-800">{shop.offer}</p>
            </div>
          </div>
        )}

        {/* Products */}
        {shop.products?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Products</p>
            <div className="grid grid-cols-2 gap-3">
              {shop.products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <div className="bg-emerald-50 rounded-lg h-16 flex items-center justify-center text-2xl mb-2">
                    🛍️
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm text-emerald-600 font-bold">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timing */}
        {(shop.timing || shop.address) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Info</p>
            {shop.timing && (
              <div className="flex items-center gap-2 mb-2">
                <span>🕐</span>
                <p className="text-sm text-gray-700">{shop.timing}</p>
              </div>
            )}
            {shop.address && (
              <div className="flex items-start gap-2">
                <span>📍</span>
                <p className="text-sm text-gray-700">{shop.address}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}