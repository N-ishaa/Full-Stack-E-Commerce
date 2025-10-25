import React, { useContext, useEffect, useState } from 'react'
import SummaryApi from '../common'
import Context from '../context'
import displayINRCurrency from '../helpers/displayCurrency'
import { MdDelete } from "react-icons/md";

const Cart = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [isPaying, setIsPaying] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showPinPopup, setShowPinPopup] = useState(false)
    const [pin, setPin] = useState("")
    const [pinError, setPinError] = useState("")

    const context = useContext(Context)
    const loadingCart = new Array(4).fill(null)

    const fetchData = async () => {
        const response = await fetch(SummaryApi.addToCartProductView.url, {
            method: SummaryApi.addToCartProductView.method,
            credentials: 'include',
            headers: { "content-type": 'application/json' },
        })
        const responseData = await response.json()
        if (responseData.success) setData(responseData.data)
    }

    useEffect(() => {
        setLoading(true)
        fetchData()
        setLoading(false)
    }, [])

    const increaseQty = async (id, qty) => {
        const response = await fetch(SummaryApi.updateCartProduct.url, {
            method: SummaryApi.updateCartProduct.method,
            credentials: 'include',
            headers: { "content-type": 'application/json' },
            body: JSON.stringify({ _id: id, quantity: qty + 1 })
        })
        const responseData = await response.json()
        if (responseData.success) fetchData()
    }

    const decraseQty = async (id, qty) => {
        if (qty >= 2) {
            const response = await fetch(SummaryApi.updateCartProduct.url, {
                method: SummaryApi.updateCartProduct.method,
                credentials: 'include',
                headers: { "content-type": 'application/json' },
                body: JSON.stringify({ _id: id, quantity: qty - 1 })
            })
            const responseData = await response.json()
            if (responseData.success) fetchData()
        }
    }

    const deleteCartProduct = async (id) => {
        const response = await fetch(SummaryApi.deleteCartProduct.url, {
            method: SummaryApi.deleteCartProduct.method,
            credentials: 'include',
            headers: { "content-type": 'application/json' },
            body: JSON.stringify({ _id: id })
        })
        const responseData = await response.json()
        if (responseData.success) {
            fetchData()
            context.fetchUserAddToCart()
        }
    }

    const totalQty = data.reduce((prev, curr) => prev + curr.quantity, 0)
    const totalPrice = data.reduce((prev, curr) => prev + (curr.quantity * curr?.productId?.sellingPrice), 0)

    // Open PIN popup for payment
    const handlePayment = (amount) => {
        if (amount <= 0) return alert("Your cart is empty!");
        setPin("")       // Clear PIN for new attempt
        setPinError("")  // Clear previous error
        setShowPinPopup(true)
    }

    // Confirm payment
    const confirmPayment = () => {
        if (pin.length !== 6) {
            setPinError("Please enter a valid 6-digit PIN")
            return
        }

        setPinError("")
        setShowPinPopup(false)
        setIsPaying(true)

        setTimeout(() => {
            setIsPaying(false)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }, 2000)
    }

    return (
        <div className='container mx-auto relative'>
            <div className='text-center text-lg my-3'>
                {data.length === 0 && !loading && <p className='bg-white py-5'>No Data</p>}
            </div>

            <div className='flex flex-col lg:flex-row gap-10 lg:justify-between p-4'>
                {/* Cart Products */}
                <div className='w-full max-w-3xl'>
                    {loading ? loadingCart.map((_, index) => (
                        <div key={index} className='w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded' />
                    )) : data.map(product => (
                        <div key={product._id} className='w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]'>
                            <div className='w-32 h-32 bg-slate-200'>
                                <img src={product?.productId?.productImage[0]} className='w-full h-full object-scale-down mix-blend-multiply' />
                            </div>
                            <div className='px-4 py-2 relative'>
                                <div className='absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer'
                                    onClick={() => deleteCartProduct(product?._id)}>
                                    <MdDelete />
                                </div>
                                <h2 className='text-lg lg:text-xl text-ellipsis line-clamp-1'>{product?.productId?.productName}</h2>
                                <p className='capitalize text-slate-500'>{product?.productId.category}</p>
                                <div className='flex items-center justify-between'>
                                    <p className='text-red-600 font-medium text-lg'>{displayINRCurrency(product?.productId?.sellingPrice)}</p>
                                    <p className='text-slate-600 font-semibold text-lg'>{displayINRCurrency(product?.productId?.sellingPrice * product?.quantity)}</p>
                                </div>
                                <div className='flex items-center gap-3 mt-1'>
                                    <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded'
                                        onClick={() => decraseQty(product?._id, product?.quantity)}>-</button>
                                    <span>{product?.quantity}</span>
                                    <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded'
                                        onClick={() => increaseQty(product?._id, product?.quantity)}>+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className='mt-5 lg:mt-0 w-full max-w-sm'>
                    {loading ? <div className='h-36 bg-slate-200 border border-slate-300 animate-pulse' /> :
                        <div className='h-36 bg-white'>
                            <h2 className='text-white bg-red-600 px-4 py-1'>Summary</h2>
                            <div className='flex items-center justify-between px-4 gap-2 font-medium text-lg text-slate-600'>
                                <p>Quantity</p><p>{totalQty}</p>
                            </div>
                            <div className='flex items-center justify-between px-4 gap-2 font-medium text-lg text-slate-600'>
                                <p>Total Price</p><p>{displayINRCurrency(totalPrice)}</p>
                            </div>
                            <button
                                onClick={() => handlePayment(totalPrice)}
                                className='bg-blue-600 p-2 text-white w-full mt-2 rounded hover:bg-blue-700 disabled:opacity-60'
                                disabled={isPaying}
                            >
                                {isPaying ? 'Processing...' : `Pay ₹${totalPrice}`}
                            </button>
                        </div>
                    }
                </div>
            </div>

            {/* PIN Entry Popup */}
            {showPinPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center animate-fade-in-up w-80">
                        <h2 className="text-xl font-semibold mb-2">Enter Payment PIN</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Please enter your 6-digit PIN to confirm payment
                        </p>

                        <input
                            type="password"
                            value={pin}
                            maxLength="6"
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                            className={`border ${pinError ? "border-red-500 ring-2 ring-red-300" : "border-gray-300"} rounded-lg w-full text-center p-2 tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            placeholder="••••••"
                        />

                        {/* Error message */}
                        {pinError && (
                            <p className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-md py-1 animate-fade-in">
                                {pinError}
                            </p>
                        )}

                        <button
                            onClick={confirmPayment}
                            className="bg-blue-600 text-white w-full mt-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Confirm Payment
                        </button>
                        <button
                            onClick={() => setShowPinPopup(false)}
                            className="text-sm text-gray-500 mt-2 underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Payment success popup */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center animate-fade-in-up">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold">Payment Successful</h2>
                        <p className="text-gray-600 mt-1">
                            Expected Delivery:{" "}
                            <span className="font-semibold text-green-600">
                                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
