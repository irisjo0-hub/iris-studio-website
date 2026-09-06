from pathlib import Path

path = Path('src/pages/PrintingProducts.jsx')
text = path.read_text(encoding='utf-8')

stray = """        ? cart.map((item, idx) => ({
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
if text.count(stray) != 1:
    raise SystemExit(f'expected 1 stray cart fragment, found {text.count(stray)}')
text = text.replace(stray, '', 1)

# Remove the now-unused legacy invoice-summary variable/assignments.
text = text.replace("      let itemsSummary = '';\n\n", '', 1)
text = text.replace("        itemsSummary = cart.map((item, i) => `${i + 1}️⃣ *${item.name}* (عدد ${item.quantity}) ${item.selectedColor ? `- اللون: ${item.selectedColor}` : ''} - (السعر: ${item.price * item.quantity} JOD)`).join('\\n');\n", '', 1)
text = text.replace("        itemsSummary = `1️⃣ *${selectedProduct.name}* (عدد ${quantity}) ${selectedColor ? `- اللون: ${selectedColor}` : ''} - (السعر: ${(Number(selectedProduct.price) || 0) * quantity} JOD)`;\n", '', 1)

path.write_text(text, encoding='utf-8')
print('PrintingProducts source cleanup complete.')
