import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import { QRCodeSVG } from 'qrcode.react'

export default function Dashboard() {
  const { owner, logout } = useAuth()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [message, setMessage] = useState('')

  const [shopForm, setShopForm] = useState({
    shopName: '', category: '', slug: '', phone: '',
    whatsapp: '', instagram: '', address: '',
    timing: '', offer: '', googleMapsUrl: ''
  })

  const [productForm, setProductForm] = useState({
    name: '', price: '', image: ''
  })

  useEffect(() => {
    fetchShop()
  }, [])

  const fetchShop = async () => {
    try {
      const res = await API.get('/shop/my')
      setShop(res.data)
      setShopForm(res.data)
    } catch {
      setShop(null)
    } finally {
      setLoading(false)
    }
  }

  const handleShopSubmit = async (e) => {
    e.preventDefault()
    try {
      if (shop) {
        await API.put('/shop/update', shopForm)
        setMessage('Shop updated!')
      } else {
        await API.post('/shop/create', shopForm)
        setMessage('Shop created!')
      }
      fetchShop()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error!')
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      await API.post('/shop/product/add', productForm)
      setProductForm({ name: '', price: '', image: '' })
      setMessage('Product added!')
      fetchShop()
    } catch {
      setMessage('Error adding product!')
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await API.delete(`/shop/product/${productId}`)
      setMessage('Product deleted!')
      fetchShop()
    } catch {
      setMessage('Error deleting product!')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ShopCard Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {owner?.name}</p>
        </div>
         <div className="flex gap-3 items-center">
          {shop && (
            
         <a href={`/shop/${shop.slug}`}
  target="_blank"
  className="text-sm bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium"
>
  View Shop Page
</a>
)}
{shop && (
<div className="flex flex-col items-center gap-1">
    <QRCodeSVG
      id="qr-code"
      value={`http://localhost:5173/shop/${shop.slug}`}
      size={80}
      className="border p-1 rounded-lg bg-white"
    />
    <p className="text-xs text-gray-400">QR Code</p>
    <button
      onClick={() => {
        const svg = document.getElementById('qr-code')
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        canvas.width = 300
        canvas.height = 300
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 300, 300)
          const a = document.createElement('a')
          a.download = `${shop.slug}-qr.png`
          a.href = canvas.toDataURL('image/png')
          a.click()
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      }}
      className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg cursor-pointer"
    >
      Download QR
    </button>
  </div>
          )}
          <button
            onClick={logout}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mx-6 mt-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
          {message}
          <button onClick={() => setMessage('')} className="ml-4 text-green-500">✕</button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['info', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              {tab === 'info' ? 'Shop Info' : 'Products'}
            </button>
          ))}
        </div>

        {/* Shop Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {shop ? 'Update Shop Info' : 'Create Your Shop'}
            </h2>
            <form onSubmit={handleShopSubmit} className="space-y-4">
              {[
                { name: 'shopName', label: 'Shop Name', placeholder: 'Sharma Kirana Store' },
                { name: 'category', label: 'Category', placeholder: 'Grocery / Kirana' },
                { name: 'slug', label: 'URL Slug', placeholder: 'sharma-kirana' },
                { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                { name: 'whatsapp', label: 'WhatsApp Number', placeholder: '919876543210' },
                { name: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                { name: 'address', label: 'Address', placeholder: '12, Shivam Society, Surat' },
                { name: 'timing', label: 'Timing', placeholder: 'Mon-Sat 8AM - 9PM' },
                { name: 'offer', label: 'Today\'s Offer', placeholder: '10% off on vegetables today!' },
                { name: 'googleMapsUrl', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={shopForm[field.name] || ''}
                    onChange={(e) => setShopForm({ ...shopForm, [e.target.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {shop ? 'Update Shop' : 'Create Shop'}
              </button>
            </form>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Add Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    placeholder="Basmati Rice 5kg"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="text"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    placeholder="₹320"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Your Products ({shop?.products?.length || 0})
              </h2>
              {shop?.products?.length === 0 ? (
                <p className="text-gray-400 text-sm">No products yet — add some!</p>
              ) : (
                <div className="space-y-3">
                  {shop?.products?.map((product) => (
                    <div
                      key={product._id}
                      className="flex justify-between items-center border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-green-600 font-semibold">{product.price}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-400 text-sm hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}