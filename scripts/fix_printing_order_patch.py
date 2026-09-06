from pathlib import Path


PRINTING = Path('src/pages/PrintingProducts.jsx')
text = PRINTING.read_text(encoding='utf-8')

old_cart_block = """      const cartItemsStructured = selectedProduct.id === 'cart_checkout' && cart
        ? cart.map((item, idx) => ({
            id: `item-${idx}`,
            name: item.name,
            selectedColor: selectedColor || '',
            quantity: item.quantity,
            price: item.price,
            image: item.image || ''
          }))
        : [{
            id: 'item-single',
            name: selectedProduct.name,
            selectedColor: selectedColor || '',
            quantity: quantity,
            price: Number(selectedProduct.price) || 0,
            image: ''
          }];

"""
if text.count(old_cart_block) != 0:
    text = text.replace(old_cart_block, '', 1)

old_old_name_block = """      let calculatedProductName = selectedProduct.name;
      if (selectedProduct.id === 'cart_checkout' && cart && cart.length > 0) {
        calculatedProductName = cart.map(item => `${item.name}${item.selectedColor ? ` [${item.selectedColor}]` : ''} (×${item.quantity})`).join(' + ');
      }

      const cartItemsStructured = selectedProduct.id === 'cart_checkout' && cart
"""
if text.count(old_old_name_block) != 0:
    text = text.replace(old_old_name_block, '', 1)

# Keep exactly one authoritative calculatedProductName block before rpcCartItems.
authoritative_prefix = "      let calculatedProductName = selectedProduct.name;\n      if (selectedProduct.id === 'cart_checkout' && cart && cart.length > 0) {"
if text.count(authoritative_prefix) != 1:
    raise SystemExit(f'calculatedProductName block expected once after cleanup, found {text.count(authoritative_prefix)}')

old_upload_setup = "    setSubmittingOrder(true);\n    try {\n      // Upload design images to storage\n      const uploadedUrls = [];"
new_upload_setup = "    const uploadedUrls = [];\n    setSubmittingOrder(true);\n    try {\n      // Upload design images to storage"
if old_upload_setup in text:
    text = text.replace(old_upload_setup, new_upload_setup, 1)

old_catch = """    } catch (err) {
      alert('حدث خطأ أثناء تقديم الطلب: ' + err.message);
    } finally {
"""
new_catch = """    } catch (err) {
      if (uploadedUrls.length > 0) {
        await Promise.allSettled(
          uploadedUrls.map(path => deleteFile('graduation-orders', path))
        );
      }
      alert('حدث خطأ أثناء تقديم الطلب: ' + err.message);
    } finally {
"""
if old_catch in text:
    text = text.replace(old_catch, new_catch, 1)

PRINTING.write_text(text, encoding='utf-8')
print('PrintingProducts cleanup complete.')
