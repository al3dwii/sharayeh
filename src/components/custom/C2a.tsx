'use client'
import Image from 'next/image'
import React, { ChangeEvent, FormEvent, useState } from 'react';
import C2aContent from "./C2aContent";
// import HamburgerMenu  from './Humberger'


const C2a = () => {

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    message: ''
  });

  const handleInputChange = (e:ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
    setShowModal(false);
  };

  return (
    <>

    <div className={` shadow-lg  justify-center  main-content ${showModal ? 'blur-background' : ''}`}>

    <div className="border  border-gray-300 shadow-m bg-blue-200 rounded-xl ">
      <div className="container max-w-screen-lg mx-auto px-4 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full sm:w-5/6 lg:w-2/3 xl:w-1/2">
            <div className="card bg-[url('/images/landingpage/shape/line-bg.svg')] bg-no-repeat bg-center py-5">
              <div className="text-center">
                
                <C2aContent />

              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6 mb-4">
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-10 lg:px-12 text-lg  rounded-md shadow">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
          </div>
            {showModal && (
              <div className=" modal-overlay fixed w-full h-full top-0 left-0 flex items-center justify-center">
              <div className="modal-content relative lg:max-w-[500px] w-4/5  bg-white p-8 rounded-lg shadow-lg">
                     <button 
                     onClick={() => setShowModal(false)} 
                     className="close-modal-btn absolute top-0 right-0 m-3">
                        X
                     </button>
                   
                <h2 className="text-2xl font-semibold mb-4 text-center">Start your trial</h2>
                <p className="text-gray-600 text-center mb-6">Try all our AI tools, without limits.</p>

                <div className="flex items-center justify-center mb-6">
                  <button className="bg-black text-white py-3 px-5 rounded-lg flex items-center justify-center">
                    <Image 
                    src="/gpay-icon.png" 
                    alt="G Pay" className="mr-2" 
                    width="20"
                    height="20"
                    
                    /> Pay with G Pay
                  </button>
                </div>
        
                <p className="text-center mb-6">or pay with card</p>
        
                <form className="flex flex-col">
                  <input type="text" name="name" placeholder="Full name" className="input-field mb-4" />
                  <input type="text" name="cardnumber" placeholder="Card number" className="input-field mb-4" />
                  <div className="flex mb-6 -mx-2">
                    <input type="text" name="expiry" placeholder="MM/YY" className="input-field mx-2 flex-1" />
                    <input type="text" name="cvc" placeholder="CVV" className="max-w-[60px] input-field mx-2 flex-1" />
                  </div>
                  <button type="submit" className="button bg-blue-700 text-white py-3 rounded-lg w-full">
                    Start your trial
                  </button>
                </form>
                
                <p className="secure-payment text-gray-700 text-sm mt-6 text-center">
                  Secure payment. This transaction will appear on your bank statement as vecticon.co.
                 
                </p>
              </div>
            </div>
        
             )}
</>
  );
};

export default C2a;

