from pathlib import Path


PRINTING = Path('src/pages/PrintingProducts.jsx')
text = PRINTING.read_text(encoding='utf-8')

old_cart_block = """      const cartItemsStructured = selectedProduct.id === 'cart_checkout' && cart
        ? cart.map((item, idx) => ({
            id: `item-${idx}`,
            name: item.name,
            selectedColor: item.selectedColor || '',
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
if text.count(old_cart_block) != 1:
    raise SystemExit(f'old cart block expected once, found {text.count(old_cart_block)}')
text = text.replace(old_cart_block, '', 1)

old_name_block = """      let calculatedProductName = selectedProduct.name;
      if (selectedProduct.id === 'cart_checkout' && cart && cart.length > 0) {
        calculatedProductName = cart.map(item => `${item.name}${item.selectedColor ? ` [${item.selectedColor}]` : ''} (×${item.quantity})`).join(' + ');
      }

      const rpcCartItems = selectedProduct.id === 'cart_checkout'
"""
if text.count(old_name_block) != 2:
    raise SystemExit(f'calculatedProductName block expected twice before cleanup, found {text.count(old_name_block)}')
text = text.replace(old_name_block, "      const rpcCartItems = selectedProduct.id === 'cart_checkout'\n", 1)

text = text.replace(
    "    setSubmittingOrder(true);\n    try {\n      // Upload design images to storage\n      const uploadedUrls = [];",
    "    const uploadedUrls = [];\n    setSubmittingOrder(true);\n    try {\n      // Upload design images to storage",
    1,
)

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
if text.count(old_catch) != 1:
    raise SystemExit(f'catch block expected once, found {text.count(old_catch)}')
text = text.replace(old_catch, new_catch, 1)

PRINTING.write_text(text, encoding='utf-8')
print('PrintingProducts duplicate cleanup applied.')
