import Shop from '../models/Shop.js'

// Create Shop
export const createShop = async (req, res) => {
  try {
    const { shopName, category, slug, phone, whatsapp, instagram, address, timing, offer, googleMapsUrl } = req.body

    const existingShop = await Shop.findOne({ slug })
    if (existingShop) {
      return res.status(400).json({ message: 'Slug already taken — try another URL' })
    }

    const shop = await Shop.create({
      owner: req.ownerId,
      shopName,
      category,
      slug,
      phone,
      whatsapp,
      instagram,
      address,
      timing,
      offer,
      googleMapsUrl
    })

    res.status(201).json({ message: 'Shop created!', shop })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get My Shop
export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.ownerId })
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }
    res.json(shop)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Shop
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { owner: req.ownerId },
      { ...req.body },
      { new: true }
    )
    res.json({ message: 'Shop updated!', shop })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, price, image } = req.body
    const shop = await Shop.findOne({ owner: req.ownerId })
    shop.products.push({ name, price, image })
    await shop.save()
    res.json({ message: 'Product added!', shop })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.ownerId })
    shop.products = shop.products.filter(
      (p) => p._id.toString() !== req.params.productId
    )
    await shop.save()
    res.json({ message: 'Product deleted!', shop })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Shop by Slug (customer page)
export const getShopBySlug = async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug })
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }
    res.json(shop)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}