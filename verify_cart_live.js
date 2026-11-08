async function testLive() {
  const res = await fetch('https://web-ten-rose-7dhb6cma0k.vercel.app/?t=' + Date.now(), {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const html = await res.text();
  console.log('Has cartCheckoutSection:', html.includes('id="cartCheckoutSection"'));
  console.log('Has cart force sync:', html.includes('if (nameEl) nameEl.value = user.name || \'\';'));
}
testLive();
