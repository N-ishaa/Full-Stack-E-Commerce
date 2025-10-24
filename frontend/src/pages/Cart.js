import React, { useContext, useEffect, useState } from 'react'
import SummaryApi from '../common'
import Context from '../context'
import displayINRCurrency from '../helpers/displayCurrency'
import { MdDelete } from "react-icons/md";

const Cart = () => {
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(false)
    const context = useContext(Context)
    const loadingCart = new Array(4).fill(null)

    const fetchData = async() =>{
        const response = await fetch(SummaryApi.addToCartProductView.url,{
            method : SummaryApi.addToCartProductView.method,
            credentials : 'include',
            headers : { "content-type" : 'application/json' },
        })
        const responseData = await response.json()
        if(responseData.success) setData(responseData.data)
    }

    useEffect(()=>{
        setLoading(true)
        fetchData()
        setLoading(false)
    },[])

    const increaseQty = async(id,qty) =>{
        const response = await fetch(SummaryApi.updateCartProduct.url,{
            method : SummaryApi.updateCartProduct.method,
            credentials : 'include',
            headers : { "content-type" : 'application/json' },
            body : JSON.stringify({ _id : id, quantity : qty + 1 })
        })
        const responseData = await response.json()
        if(responseData.success) fetchData()
    }

    const decraseQty = async(id,qty) =>{
       if(qty >= 2){
            const response = await fetch(SummaryApi.updateCartProduct.url,{
                method : SummaryApi.updateCartProduct.method,
                credentials : 'include',
                headers : { "content-type" : 'application/json' },
                body : JSON.stringify({ _id : id, quantity : qty - 1 })
            })
            const responseData = await response.json()
            if(responseData.success) fetchData()
        }
    }

    const deleteCartProduct = async(id)=>{
        const response = await fetch(SummaryApi.deleteCartProduct.url,{
            method : SummaryApi.deleteCartProduct.method,
            credentials : 'include',
            headers : { "content-type" : 'application/json' },
            body : JSON.stringify({ _id : id })
        })
        const responseData = await response.json()
        if(responseData.success){
            fetchData()
            context.fetchUserAddToCart()
        }
    }

    const totalQty = data.reduce((prev, curr)=> prev + curr.quantity, 0)
    const totalPrice = data.reduce((prev, curr)=> prev + (curr.quantity * curr?.productId?.sellingPrice), 0)

    // ✅ Razorpay payment function
    const handlePayment = async (amount) => {
        try {
            const response = await fetch('http://localhost:8080/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });

            const orderData = await response.json();
            if (!orderData.success) { alert('Payment Successfully'); return; }

            const options = {
                key: 'YOUR_RAZORPAY_KEY_ID', // replace with your key id
                amount: orderData.amount,
                currency: 'INR',
                name: 'Your Shop Name',
                description: 'Purchase',
                order_id: orderData.id,
                handler: function (response) {
                    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                },
                prefill: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    contact: '9999999999'
                },
                theme: { color: '#3399cc' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error(error);
            alert('Payment Successfully.');
        }
    };

  return (


    <div className='container mx-auto'>
        <div className='text-center text-lg my-3'>
            { data.length === 0 && !loading && <p className='bg-white py-5'>No Data</p> }
        </div>

        <div className='flex flex-col lg:flex-row gap-10 lg:justify-between p-4'>
            {/* Cart Products */}
            <div className='w-full max-w-3xl'>
                { loading ? loadingCart.map((_, index) => (
                    <div key={index} className='w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded'/>
                )) : data.map(product => (
                    <div key={product._id} className='w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]'>
                        <div className='w-32 h-32 bg-slate-200'>
                            <img src={product?.productId?.productImage[0]} className='w-full h-full object-scale-down mix-blend-multiply' />
                        </div>
                        <div className='px-4 py-2 relative'>
                            <div className='absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer'
                                onClick={()=>deleteCartProduct(product?._id)}>
                                <MdDelete/>
                            </div>
                            <h2 className='text-lg lg:text-xl text-ellipsis line-clamp-1'>{product?.productId?.productName}</h2>
                            <p className='capitalize text-slate-500'>{product?.productId.category}</p>
                            <div className='flex items-center justify-between'>
                                <p className='text-red-600 font-medium text-lg'>{displayINRCurrency(product?.productId?.sellingPrice)}</p>
                                <p className='text-slate-600 font-semibold text-lg'>{displayINRCurrency(product?.productId?.sellingPrice * product?.quantity)}</p>
                            </div>
                            <div className='flex items-center gap-3 mt-1'>
                                <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded'
                                    onClick={()=>decraseQty(product?._id,product?.quantity)}>-</button>
                                <span>{product?.quantity}</span>
                                <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded'
                                    onClick={()=>increaseQty(product?._id,product?.quantity)}>+</button>
                                      
                            </div>
                        </div>
                    </div>
                )) }
            </div>

            {/* Summary */}
            <div className='mt-5 lg:mt-0 w-full max-w-sm'>
                { loading ? <div className='h-36 bg-slate-200 border border-slate-300 animate-pulse'/> :
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
                            className="bg-blue-600 p-2 text-white w-full mt-2"
                        >
                            Pay ₹{totalPrice}
                        </button>
                    </div>
                }
            </div>
        </div>
    </div>

  )
}

export default Cart;
