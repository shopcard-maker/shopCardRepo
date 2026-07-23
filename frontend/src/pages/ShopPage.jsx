import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import API from '../utils/api'

export default function ShopPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cart, setCart] = useState({}) // { productId: quantity }
  const [requireDelivery, setRequireDelivery] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')

  useEffect(() => {
    const fetchShopAndTrack = async () => {
      try {
        // Record visit in background
        await API.post(`/shop/${slug}/visit`)
      } catch (err) {
        console.error('Error logging visit:', err)
      }

      try {
        // Fetch shop details
        const res = await API.get(`/shop/${slug}`)
        setShop(res.data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchShopAndTrack()
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

  const updateQuantity = (productId, amount) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + amount)
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQty }
    })
  }

  const getCartDetails = () => {
    let totalAmount = 0
    let itemsCount = 0
    let hasCalculatedTotal = false
    const itemsList = []
    
    Object.keys(cart).forEach(id => {
      const product = shop.products.find(p => p._id === id)
      if (product) {
        const qty = cart[id]
        itemsCount += qty
        
        // Parse numerical price (ignoring symbols like ₹, Rs)
        const cleanPriceStr = product.price ? product.price.replace(/[^\d.]/g, '') : ''
        const priceNum = parseFloat(cleanPriceStr)
        
        if (!isNaN(priceNum)) {
          totalAmount += priceNum * qty
          hasCalculatedTotal = true
        }
        
        itemsList.push({
          name: product.name,
          qty,
          price: product.price || 'Price on request'
        })
      }
    })
    
    return { totalAmount, itemsCount, itemsList, hasCalculatedTotal }
  }

  const { totalAmount, itemsCount, itemsList, hasCalculatedTotal } = getCartDetails()

  const handleWhatsAppOrder = () => {
    if (itemsCount === 0) return
    
    let messageText = `*New Order from ShopCard!* 🛍️\n`
    messageText += `--------------------------\n`
    messageText += `*Shop:* ${shop.shopName}\n\n`
    
    messageText += `*Items Ordered:*\n`
    itemsList.forEach((item, index) => {
      messageText += `${index + 1}. *${item.name}* x ${item.qty} (${item.price})\n`
    })
    messageText += `\n`
    
    if (hasCalculatedTotal) {
      messageText += `*Estimated Total:* ₹${totalAmount}\n`
    } else {
      messageText += `*Total:* Price on request\n`
    }
    messageText += `--------------------------\n`
    
    if (requireDelivery) {
      messageText += `*Delivery Option:* Home Delivery 🚚\n`
      messageText += `*Address:* ${deliveryAddress || 'Not provided'}\n`
    } else {
      messageText += `*Delivery Option:* Self-Pickup 🏃‍♂️\n`
    }
    
    const whatsappUrl = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(messageText)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Marquee Weekly Counter Banner */}
      {shop.weeklyVisits >= 10 && (
        <div className="bg-amber-500 text-white overflow-hidden py-2 text-xs font-semibold select-none flex shadow-sm">
          <div className="animate-marquee whitespace-nowrap flex gap-12">
            <span>🔥 Hot Store! Trusted by {shop.weeklyVisits}+ customers this week! Scan QR to order.</span>
            <span>⚡ Fast ordering directly to shop owner's WhatsApp!</span>
            <span>🔥 Hot Store! Trusted by {shop.weeklyVisits}+ customers this week! Scan QR to order.</span>
            <span>⚡ Fast ordering directly to shop owner's WhatsApp!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-emerald-500 px-6 pt-10 pb-8 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 text-emerald-600 font-bold text-2xl shadow-sm border border-emerald-400">
          {shop.shopName?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{shop.shopName}</h1>
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full mt-2 inline-block font-semibold">
          {shop.category}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">

        {/* Contact & Payment Buttons */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact & Payments</p>
          <div className="grid grid-cols-2 gap-3">
            {shop.whatsapp && (
              <a href={`https://wa.me/${shop.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-green-50 text-green-700 rounded-xl py-3 text-sm font-semibold hover:bg-green-100 transition border border-green-100 shadow-xs"
              >
                <span className="text-xl">💬</span>
                WhatsApp
              </a>
            )}
            {shop.phone && (
              <a href={`tel:${shop.phone}`}
                className="flex flex-col items-center gap-1 bg-blue-50 text-blue-700 rounded-xl py-3 text-sm font-semibold hover:bg-blue-100 transition border border-blue-100 shadow-xs"
              >
                <span className="text-xl">📞</span>
                Call Now
              </a>
            )}
            {shop.instagram && (
              <a href={shop.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-pink-50 text-pink-700 rounded-xl py-3 text-sm font-semibold hover:bg-pink-100 transition border border-pink-100 shadow-xs"
              >
                <span className="text-xl">📸</span>
                Instagram
              </a>
            )}
            {shop.googleMapsUrl && (
              <a href={shop.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 bg-amber-50 text-amber-700 rounded-xl py-3 text-sm font-semibold hover:bg-amber-100 transition border border-amber-100 shadow-xs"
              >
                <span className="text-xl">📍</span>
                Direction
              </a>
            )}
            {shop.upiId && (
              <a href={`upi://pay?pa=${shop.upiId}&pn=${encodeURIComponent(shop.shopName)}&cu=INR`}
                className="flex flex-col items-center gap-1 bg-violet-50 text-violet-700 rounded-xl py-3 text-sm font-semibold hover:bg-violet-100 transition border border-violet-100 shadow-xs col-span-2 mt-1"
              >
                <span className="text-xl">💳</span>
                Pay Online (GPay/PhonePe)
              </a>
            )}
          </div>
        </div>

        {/* Offer */}
        {shop.offer && (
          <div className="bg-amber-50 rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-amber-100 animate-pulse">
            <span className="text-2xl">🏷️</span>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Today's Offer</p>
              <p className="text-sm font-medium text-amber-800">{shop.offer}</p>
            </div>
          </div>
        )}

        {/* Products Section */}
        {shop.products?.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Products Catalog</p>
            <h2 className="text-lg font-bold text-gray-800 mb-0.5">All Products</h2>
            <p className="text-xs text-gray-400 mb-4 font-medium">Please select the products which you want to buy</p>
            
            <div className="grid grid-cols-2 gap-3">
              {shop.products.map((product) => {
                const qty = cart[product._id] || 0
                return (
                  <div
                    key={product._id}
                    className={`bg-gray-50 rounded-xl p-3 border transition flex flex-col justify-between ${
                      qty > 0 ? 'border-emerald-500 bg-emerald-50/10 shadow-xs' : 'border-gray-100'
                    }`}
                  >
                    <div>
                      <div className="bg-emerald-50/40 rounded-lg h-24 flex items-center justify-center mb-2 overflow-hidden border border-gray-100">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🛍️</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-xs text-emerald-600 font-bold mb-2">
                        {product.price ? product.price : 'Price on request'}
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-1 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-2xs">
                      {qty === 0 ? (
                        <button
                          onClick={() => updateQuantity(product._id, 1)}
                          className="w-full py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50/40 transition cursor-pointer"
                        >
                          + Add
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => updateQuantity(product._id, -1)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-800">{qty}</span>
                          <button
                            onClick={() => updateQuantity(product._id, 1)}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50/40 transition cursor-pointer"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <span className="text-3xl">🛒</span>
            <p className="text-sm text-gray-400 mt-2">No products added in the catalog yet.</p>
          </div>
        )}

        {/* Delivery Toggle & Address input */}
        {shop.products?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">Delivery Details</p>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireDelivery}
                onChange={(e) => setRequireDelivery(e.target.checked)}
                className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-400 focus:outline-none accent-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800">Home Delivery Required?</span>
                <p className="text-xs text-gray-400 mt-0.5">Check this if you want items delivered to your doorstep.</p>
              </div>
            </label>
            
            {requireDelivery && (
              <div className="mt-2 transition-all">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Enter Delivery Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat/House No, Building, Street, Area landmark, Pincode"
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Timing & Address Info */}
        {(shop.timing || shop.address) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Shop Details</p>
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

      {/* Sticky Bottom Checkout Bar */}
      {itemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-50 flex items-center justify-between max-w-md mx-auto rounded-t-2xl">
          <div>
            <p className="text-xs text-gray-400 font-semibold">{itemsCount} item{itemsCount > 1 ? 's' : ''} selected</p>
            <h4 className="text-lg font-bold text-gray-800">
              {hasCalculatedTotal ? `₹${totalAmount}` : 'Price on Request'}
            </h4>
          </div>
          <button
            onClick={handleWhatsAppOrder}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>💬</span>
            Buy Now
          </button>
        </div>
      )}
    </div>
  )
}