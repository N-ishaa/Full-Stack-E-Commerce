import React, { useContext, useEffect, useState } from "react";
import SummaryApi from "../common";
import Context from "../context";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";

const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur"];

const Cart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI states
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // payment/spinner
  const [isPaying, setIsPaying] = useState(false);

  // payment method + pin
  const [paymentMethod, setPaymentMethod] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // address
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    house: "",
    city: "",
    pincode: "",
  });
  const [addressError, setAddressError] = useState("");

  // card details (masked in UI, stored unmasked for validation)
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [cardError, setCardError] = useState("");

  const context = useContext(Context);
  const loadingCart = new Array(4).fill(null);

  // Fetch cart data
  const fetchData = async () => {
    try {
      const response = await fetch(SummaryApi.addToCartProductView.url, {
        method: SummaryApi.addToCartProductView.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
      });
      const responseData = await response.json();
      if (responseData.success) setData(responseData.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cart ops
  const increaseQty = async (id, qty) => {
    const response = await fetch(SummaryApi.updateCartProduct.url, {
      method: SummaryApi.updateCartProduct.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ _id: id, quantity: qty + 1 }),
    });
    const responseData = await response.json();
    if (responseData.success) fetchData();
  };

  const decraseQty = async (id, qty) => {
    if (qty >= 2) {
      const response = await fetch(SummaryApi.updateCartProduct.url, {
        method: SummaryApi.updateCartProduct.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ _id: id, quantity: qty - 1 }),
      });
      const responseData = await response.json();
      if (responseData.success) fetchData();
    }
  };

  const deleteCartProduct = async (id) => {
    const response = await fetch(SummaryApi.deleteCartProduct.url, {
      method: SummaryApi.deleteCartProduct.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    const responseData = await response.json();
    if (responseData.success) {
      fetchData();
      if (context && typeof context.fetchUserAddToCart === "function") context.fetchUserAddToCart();
    }
  };

  const totalQty = data.reduce((prev, curr) => prev + curr.quantity, 0);
  const totalPrice = data.reduce((prev, curr) => prev + curr.quantity * curr?.productId?.sellingPrice, 0);

  // Payment flow handlers
  const handlePaymentOptions = () => {
    if (totalPrice <= 0) return alert("Your cart is empty!");
    setShowPaymentOptions(true);
  };

  const handleCOD = () => {
    setPaymentMethod("cod");
    setShowPaymentOptions(false);
    setShowAddressPopup(true);
  };

  const handleOnlinePayment = () => {
    setPaymentMethod("online");
    setShowPaymentOptions(false);
    setShowAddressPopup(true);
  };

  // Address validation & confirm
  const validateAddress = () => {
    const { name, phone, house, city, pincode } = address;
    if (!name || !phone || !house || !city || !pincode) {
      setAddressError("Please fill all address fields");
      return false;
    }
    if (!/^\d{10}$/.test(String(phone))) {
      setAddressError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!/^\d{6}$/.test(String(pincode))) {
      setAddressError("Please enter a valid 6-digit PIN code");
      return false;
    }
    setAddressError("");
    return true;
  };

  const confirmAddress = () => {
    if (!validateAddress()) return;
    setShowAddressPopup(false);
    // For online payment -> open card popup
    if (paymentMethod === "online") {
      setShowCardPopup(true);
      setCard({ number: "", expiry: "", cvv: "" });
      setCardError("");
    } else {
      // COD: immediate confirm (no spinner)
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // CARD formatting helpers
  const formatCardNumberForDisplay = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };
  const setCardNumber = (input) => {
    const digits = input.replace(/\D/g, "").slice(0, 16);
    setCard((c) => ({ ...c, number: digits }));
  };

  const formatExpiryInput = (value) => {
    // strip non-digits then format MM/YY
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2);
  };
  const setExpiry = (input) => {
    setCard((c) => ({ ...c, expiry: formatExpiryInput(input) }));
  };

  // Card validation (unmasked)
  const validateCard = () => {
    const number = card.number.replace(/\s/g, "");
    const expiry = card.expiry;
    const cvv = card.cvv;

    if (!number || !expiry || !cvv) {
      setCardError("Please fill all card fields");
      return false;
    }
    if (!/^\d{16}$/.test(number)) {
      setCardError("Card number must be 16 digits");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setCardError("Expiry must be MM/YY");
      return false;
    }
    // basic expiry validity: month 01-12
    const [mm] = expiry.split("/");
    if (!(Number(mm) >= 1 && Number(mm) <= 12)) {
      setCardError("Expiry month must be between 01 and 12");
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setCardError("CVV must be 3 digits");
      return false;
    }
    setCardError("");
    return true;
  };

  // Confirm card details -> open PIN popup
  const confirmCardPayment = () => {
    if (!validateCard()) return;
    setShowCardPopup(false);
    setPin("");
    setPinError("");
    setShowPinPopup(true);
  };

  // Confirm PIN -> process payment with spinner (only for online)
  const confirmPayment = () => {
    if (pin.length !== 6) {
      setPinError("Please enter a valid 6-digit PIN");
      return;
    }
    setPinError("");
    setShowPinPopup(false);

    // Show processing spinner for online payment
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  // Generate fake order id
  const generateOrderId = () => "ORD" + Math.floor(Math.random() * 1000000);

  return (
    <div className="container mx-auto relative">
      <div className="text-center text-lg my-3">
        {data.length === 0 && !loading && <p className="bg-white py-5">No Data</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:justify-between p-4">
        {/* Cart Products */}
        <div className="w-full max-w-3xl">
          {loading
            ? loadingCart.map((_, idx) => (
                <div key={idx} className="w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded" />
              ))
            : data.map((product) => (
                <div key={product._id} className="w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]">
                  <div className="w-32 h-32 bg-slate-200">
                    <img
                      src={product?.productId?.productImage[0]}
                      alt={product?.productId?.productName || "Product Image"}
                      className="w-full h-full object-scale-down mix-blend-multiply"
                    />
                  </div>

                  <div className="px-4 py-2 relative">
                    <div
                      className="absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer"
                      onClick={() => deleteCartProduct(product?._id)}
                    >
                      <MdDelete />
                    </div>

                    <h2 className="text-lg lg:text-xl text-ellipsis line-clamp-1">{product?.productId?.productName}</h2>
                    <p className="capitalize text-slate-500">{product?.productId.category}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-red-600 font-medium text-lg">{displayINRCurrency(product?.productId?.sellingPrice)}</p>
                      <p className="text-slate-600 font-semibold text-lg">{displayINRCurrency(product?.productId?.sellingPrice * product?.quantity)}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <button className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded" onClick={() => decraseQty(product?._id, product?.quantity)}>-</button>
                      <span>{product?.quantity}</span>
                      <button className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded" onClick={() => increaseQty(product?._id, product?.quantity)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Summary */}
        <div className="mt-5 lg:mt-0 w-full max-w-sm">
          {loading ? (
            <div className="h-36 bg-slate-200 border border-slate-300 animate-pulse" />
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h2 className="text-white bg-red-600 px-4 py-1 rounded-t-lg">Summary</h2>

              <div className="flex items-center justify-between px-2 gap-2 font-medium text-lg text-slate-600 mt-2">
                <p>Quantity</p>
                <p>{totalQty}</p>
              </div>

              <div className="flex items-center justify-between px-2 gap-2 font-medium text-lg text-slate-600">
                <p>Total Price</p>
                <p>{displayINRCurrency(totalPrice)}</p>
              </div>

              <button onClick={handlePaymentOptions} className="bg-blue-600 p-2 text-white w-full mt-3 rounded hover:bg-blue-700 disabled:opacity-60">
                Pay ₹{totalPrice}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Options */}
      {showPaymentOptions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-80 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-3">Choose Payment Method</h2>

            <div className="space-y-3">
              <button onClick={handleCOD} disabled={totalPrice > 5000} className={`w-full py-2 rounded-lg font-medium text-white ${totalPrice > 5000 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>Cash on Delivery</button>

              <button onClick={handleOnlinePayment} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Pay Online</button>
            </div>

            {totalPrice > 5000 && <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 rounded-md p-2">Your order is more than ₹5000, so Cash on Delivery is not available. Please pay online.</p>}

            <button onClick={() => setShowPaymentOptions(false)} className="text-sm text-gray-500 mt-3 underline">Cancel</button>
          </div>
        </div>
      )}

      {/* Address Popup */}
      {showAddressPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-80 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-3">Enter Delivery Address</h2>

            <div className="space-y-2 text-left">
              <input type="text" placeholder="Full Name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="flex">
                <span className="bg-gray-200 px-2 flex items-center rounded-l-lg">+91</span>
                <input type="number" placeholder="Mobile Number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="border border-gray-300 rounded-r-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <input type="text" placeholder="House / Building No." value={address.house} onChange={(e) => setAddress({ ...address, house: e.target.value })} className="border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500" />

              <select value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select City</option>
                {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>

              <input type="number" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {addressError && <p className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-md py-1">{addressError}</p>}

            <button onClick={confirmAddress} className="bg-blue-600 text-white w-full mt-4 py-2 rounded-lg hover:bg-blue-700 transition-all">Confirm Address</button>
            <button onClick={() => setShowAddressPopup(false)} className="text-sm text-gray-500 mt-2 underline">Cancel</button>
          </div>
        </div>
      )}

      {/* Card Popup (formatted card number & expiry) */}
      {showCardPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-80 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-3">Enter Card Details</h2>

            <input
              type="text"
              placeholder="Card Number (XXXX XXXX XXXX XXXX)"
              value={formatCardNumberForDisplay(card.number)}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={19}
              className="border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                className="border border-gray-300 rounded-lg w-1/2 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="CVV"
                value={card.cvv}
                onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                maxLength={3}
                className="border border-gray-300 rounded-lg w-1/2 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {cardError && <p className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-md py-1">{cardError}</p>}

            <button onClick={confirmCardPayment} className="bg-blue-600 text-white w-full mt-4 py-2 rounded-lg hover:bg-blue-700 transition-all">Continue</button>
            <button onClick={() => setShowCardPopup(false)} className="text-sm text-gray-500 mt-2 underline">Cancel</button>
          </div>
        </div>
      )}

      {/* PIN Popup (then processing spinner) */}
      {showPinPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-80 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-2">Enter Payment PIN</h2>
            <p className="text-gray-600 text-sm mb-4">Please enter your 6-digit PIN to confirm payment</p>

            <input
              type="password"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className={`border ${pinError ? "border-red-500 ring-2 ring-red-300" : "border-gray-300"} rounded-lg w-full text-center p-2 tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="••••••"
            />

            {pinError && <p className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-md py-1">{pinError}</p>}

            <button onClick={confirmPayment} className="bg-blue-600 text-white w-full mt-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
              {isPaying ? "Processing Payment..." : `Pay ₹${totalPrice}`}
            </button>
            <button onClick={() => setShowPinPopup(false)} className="text-sm text-gray-500 mt-2 underline">Cancel</button>
          </div>
        </div>
      )}

      {/* Processing spinner overlay (online only) */}
      {isPaying && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
            <p className="mt-2 text-white font-semibold">Processing Payment...</p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center animate-fade-in-up w-96">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold mb-2">{paymentMethod === "cod" ? "Order Confirmed (Cash on Delivery)" : "Payment Successful"}</h2>

            <p className="text-gray-600 mt-1 font-medium">Order ID: {generateOrderId()}</p>

            <div className="text-left mt-2">
              <h3 className="font-semibold">Products:</h3>
              <ul className="list-disc list-inside">
                {data.map((p) => (
                  <li key={p._id}>
                    {p.productId.productName} x {p.quantity} ({displayINRCurrency(p.productId.sellingPrice * p.quantity)})
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-gray-700 mt-2 font-semibold">Total: {displayINRCurrency(totalPrice)} {paymentMethod === "online" && "(Prepaid)"}</p>

            <p className="text-gray-700 mt-1">Expected Delivery: <span className="font-semibold text-green-600">{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
