import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, default: '' },
  image: { type: String, default: '' }
})

const shopSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  shopName: { type: String, required: true },
  category: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  instagram: { type: String, default: '' },
  address: { type: String, default: '' },
  timing: { type: String, default: '' },
  isOpen: { type: Boolean, default: true },
  offer: { type: String, default: '' },
  products: [productSchema],
  googleMapsUrl: { type: String, default: '' },
  upiId: { type: String, default: '' },
  visits: { type: [Date], default: [] }
}, { timestamps: true })

export default mongoose.model('Shop', shopSchema)