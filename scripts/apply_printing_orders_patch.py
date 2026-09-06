from pathlib import Path


PRINTING = Path('src/pages/PrintingProducts.jsx')
ADMIN = Path('src/pages/AdminPrintingOrders.jsx')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


text = PRINTING.read_text(encoding='utf-8')
text = replace_once(
    text,
    "import { supabase, uploadFile } from '../lib/supabase';",
    "import { supabase, uploadFile, deleteFile } from '../lib/supabase';",
    'PrintingProducts import',
)
text = replace_once(
    text,
    "import { getNextOrderNumber } from '../lib/orderUtils';\n",
    '',
    'PrintingProducts orderUtils import',
)

start_marker = "      const generatedOrderNum = getNextOrderNumber('ORD');"
end_marker = "      setOrderPlaced(true);\n    } catch (err) {"
start = text.index(start_marker)
end = text.index(end_marker, start) + len("      setOrderPlaced(true);")

new_block = """      const toNumericProductId = (id) => {\n        const numericId = Number(id);\n        return Number.isInteger(numericId) && numericId > 0 ? numericId : null;\n      };\n\n      const cartItemsStructured = selectedProduct.id === 'cart_checkout' && cart\n        ? cart.map((item, idx) => ({\n            id: item.id || `item-${idx}`,\n            product_id: toNumericProductId(item.id),\n            name: item.name,\n            selectedColor: item.selectedColor || '',\n            quantity: Math.max(1, Number(item.quantity) || 1),\n            price: Number(item.price) || 0,\n            image: item.image || ''\n          }))\n        : [];\n\n      if (selectedProduct.id === 'cart_checkout') {\n        const invalidCartItem = cartItemsStructured.find(item => !item.product_id);\n        if (invalidCartItem) {\n          throw new Error('أحد المنتجات الموجودة في السلة لم يعد متاحاً في قاعدة البيانات. أعد تحميل المنتجات وحاول مرة أخرى.');\n        }\n      }\n\n      const selectedProductId = selectedProduct.id === 'cart_checkout'\n        ? null\n        : toNumericProductId(selectedProduct.id);\n\n      if (selectedProduct.id !== 'cart_checkout' && !selectedProductId) {\n        throw new Error('هذا المنتج غير متاح للطلب حالياً. أعد تحميل الصفحة وحاول مرة أخرى.');\n      }\n\n      let calculatedProductName = selectedProduct.name;\n      if (selectedProduct.id === 'cart_checkout' && cart && cart.length > 0) {\n        calculatedProductName = cart.map(item => `${item.name}${item.selectedColor ? ` [${item.selectedColor}]` : ''} (×${item.quantity})`).join(' + ');\n      }\n\n      const rpcCartItems = selectedProduct.id === 'cart_checkout'\n        ? cartItemsStructured\n        : [];\n\n      const { data: rpcData, error: rpcError } = await supabase.rpc('create_public_printing_order', {\n        p_order_data: {\n          product_id: selectedProductId,\n          product_name: calculatedProductName,\n          customer_name: customerName.trim(),\n          phone: phone.trim(),\n          notes: finalNotes,\n          image_urls: uploadedUrls,\n          cart_items: rpcCartItems,\n          quantity: selectedProduct.id === 'cart_checkout' ? totalCartCount : quantity,\n          selected_color: selectedColor || (selectedProduct.id === 'cart_checkout' ? 'سلة متعددة' : ''),\n          delivery_selected: deliverySelected,\n          delivery_address: deliverySelected ? deliveryAddress.trim() : '',\n          payment_method: paymentMethod\n        }\n      });\n\n      if (rpcError) throw rpcError;\n\n      const orderResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;\n      if (!orderResult?.order_number) {\n        throw new Error('تم قبول الطلب بدون إرجاع رقم الأوردر. تواصل مع الاستوديو قبل إعادة المحاولة.');\n      }\n\n      const finalPrice = Number(orderResult.total_amount ?? 0);\n\n      const invoiceData = {\n        invoiceNo: orderResult.order_number,\n        date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),\n        customerName: customerName.trim(),\n        phone: phone.trim(),\n        deliverySelected,\n        deliveryAddress: deliveryAddress.trim(),\n        paymentMethod,\n        paymentStatus: paymentMethod === 'cliq' ? '📱 تم الدفع عبر CliQ' : '💵 الدفع نقداً عند الاستلام',\n        cardMasked: '',\n        items: selectedProduct.id === 'cart_checkout' ? [...cart] : [{\n          cartItemId: selectedProduct.id,\n          name: selectedProduct.name,\n          selectedColor: selectedColor,\n          quantity: quantity,\n          price: Number(selectedProduct.price) || 0\n        }],\n        totalPrice: finalPrice,\n        uploadedImagesCount: uploadedUrls.length,\n        notes: notes.trim()\n      };\n\n      setPlacedInvoiceData(invoiceData);\n      if (selectedProduct.id === 'cart_checkout') clearCart();\n      setOrderPlaced(true);"""

text = text[:start] + new_block + text[end:]
PRINTING.write_text(text, encoding='utf-8')

text = ADMIN.read_text(encoding='utf-8')
text = replace_once(
    text,
    "import { supabase, createSignedUrl } from '../lib/supabase';",
    "import { supabase, createSignedUrl, deleteFile } from '../lib/supabase';",
    'AdminPrintingOrders import',
)

start = text.index("  useEffect(() => {\n    const fetchOrders = async () => {")
end = text.index("  const total           = orders.length;", start)

new_admin = """  useEffect(() => {\n    const fetchOrders = async () => {\n      setLoading(true);\n      try {\n        const { data, error } = await supabase\n          .from('printing_orders')\n          .select('*')\n          .order('created_at', { ascending: false });\n\n        if (error) throw error;\n        setOrders(Array.isArray(data) ? data : []);\n      } catch (err) {\n        console.error('Failed to load printing orders:', err);\n        setOrders([]);\n        alert(`تعذر تحميل طلبات الطباعة من قاعدة البيانات: ${err.message}`);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    fetchOrders();\n  }, []);\n\n  const handleUpdateStatus = async (id, newStatus) => {\n    const { error } = await supabase\n      .from('printing_orders')\n      .update({ status: newStatus })\n      .eq('id', id);\n\n    if (error) {\n      console.error('Failed to update printing order status:', error);\n      alert(`تعذر تحديث حالة الطلب: ${error.message}`);\n      return;\n    }\n\n    setOrders(prevOrders => prevOrders.map(order => (\n      order.id === id ? { ...order, status: newStatus } : order\n    )));\n  };\n\n  const handleUpdateItemStatus = async (orderId, itemId, newSubStatus) => {\n    const order = orders.find(ord => ord.id === orderId);\n    if (!order) return;\n\n    const existingStatuses = order.item_statuses && typeof order.item_statuses === 'object'\n      ? order.item_statuses\n      : {};\n    const updatedItemStatuses = {\n      ...existingStatuses,\n      [itemId]: newSubStatus\n    };\n\n    const items = getStructuredOrderItems({ ...order, item_statuses: updatedItemStatuses });\n    const allReady = items.length > 0 && items.every(item => updatedItemStatuses[item.id] === 'ready');\n    const anyInProgress = items.some(item => updatedItemStatuses[item.id] === 'in_progress' || updatedItemStatuses[item.id] === 'ready');\n\n    let overallStatus = order.status;\n    if (allReady && order.status !== 'completed') {\n      overallStatus = 'ready';\n    } else if (anyInProgress && order.status === 'pending') {\n      overallStatus = 'approved';\n    }\n\n    const { error } = await supabase\n      .from('printing_orders')\n      .update({ item_statuses: updatedItemStatuses, status: overallStatus })\n      .eq('id', orderId);\n\n    if (error) {\n      console.error('Failed to update printing order item status:', error);\n      alert(`تعذر تحديث حالة المنتج: ${error.message}`);\n      return;\n    }\n\n    setOrders(prevOrders => prevOrders.map(currentOrder => (\n      currentOrder.id === orderId\n        ? { ...currentOrder, item_statuses: updatedItemStatuses, status: overallStatus }\n        : currentOrder\n    )));\n  };\n\n  const parseStoragePaths = (value) => {\n    if (Array.isArray(value)) return value.filter(Boolean);\n    if (typeof value === 'string') {\n      try {\n        const parsed = JSON.parse(value);\n        return Array.isArray(parsed) ? parsed.filter(Boolean) : (value ? [value] : []);\n      } catch {\n        return value ? [value] : [];\n      }\n    }\n    return [];\n  };\n\n  const handleDeleteOrder = async (id) => {\n    if (!window.confirm('هل أنت محدد ترغب بحذف هذا الأوردر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {\n      return;\n    }\n\n    const order = orders.find(currentOrder => currentOrder.id === id);\n    if (!order) return;\n\n    const imagePaths = parseStoragePaths(order.image_urls);\n    const { error } = await supabase\n      .from('printing_orders')\n      .delete()\n      .eq('id', id);\n\n    if (error) {\n      console.error('Failed to delete printing order:', error);\n      alert(`تعذر حذف الطلب: ${error.message}`);\n      return;\n    }\n\n    setOrders(prevOrders => prevOrders.filter(currentOrder => currentOrder.id !== id));\n\n    const cleanupResults = await Promise.allSettled(\n      imagePaths.map(path => deleteFile('graduation-orders', path))\n    );\n    const failedCleanup = cleanupResults.filter(result => result.status === 'rejected');\n    if (failedCleanup.length > 0) {\n      console.warn(`Deleted order ${id}, but ${failedCleanup.length} storage file(s) could not be cleaned up.`);\n    }\n  };\n\n"""

text = text[:start] + new_admin + text[end:]
ADMIN.write_text(text, encoding='utf-8')

print('Printing order flow patch applied successfully.')
