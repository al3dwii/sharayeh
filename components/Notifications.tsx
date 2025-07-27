// src/components/Notifications.tsx

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface NotificationsProps {
  status: string;
}

const Notifications: React.FC<NotificationsProps> = ({ status }) => {
  useEffect(() => {
    if (!status) return;

    console.log('🔔 Notifications component handling status:', status);

    const displaySuccessToast = () => {
      toast.success(
        <div className="flex text-xl justify-between items-center">
          <span>تم الإرسال بنجاح!</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-green-800 hover:text-green-900"
          >
            X
          </button>
        </div>,
        {
          position: 'top-center',
          duration: 10000,
          style: {
            backgroundColor: '#D4EDDA', // Success green background
            color: '#155724', // Success text color
            border: '1px solid #C3E6CB', // Success border color
          },
          icon: <FiCheckCircle color="#155724" size={28} />,
        }
      );
      console.log('✅ Success toast displayed.');

      // Toast after 25 seconds: File is being prepared
      const prepareToastId = setTimeout(() => {
        toast.info(
          <div className="flex text-xl justify-between items-center">
            <span>يتم تجهيز الملف...</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-blue-800 hover:text-blue-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 10000,
            style: {
              backgroundColor: '#D1ECF1', // Info blue background
              color: '#0C5460', // Info text color
              border: '1px solid #BEE5EB', // Info border color
            },
            icon: <FiInfo color="#0C5460" size={28} />,
          }
        );
        console.log('ℹ️ File is being prepared toast displayed.');
      }, 25000); // 25 seconds

      // Toast after 45 seconds: File is being finalized
      const finalizeToastId = setTimeout(() => {
        toast.info(
          <div className="flex text-xl justify-between items-center">
            <span>يتم إنهاء الملف...</span>
            <button
              onClick={() => toast.dismiss()}
              className="ml-4 text-blue-800 hover:text-blue-900"
            >
              X
            </button>
          </div>,
          {
            position: 'top-center',
            duration: 10000,
            style: {
              backgroundColor: '#D1ECF1', // Info blue background
              color: '#0C5460', // Info text color
              border: '1px solid #BEE5EB', // Info border color
            },
            icon: <FiInfo color="#0C5460" size={28} />,
          }
        );
        console.log('ℹ️ File is being finalized toast displayed.');
      }, 45000); // 45 seconds

      // Cleanup function to clear timeouts if the component unmounts or status changes
      return () => {
        clearTimeout(prepareToastId);
        clearTimeout(finalizeToastId);
      };
    };


    const displayErrorToast = (
      message: string,
      textSize: string = 'text-base',
      duration: number | null = null
    ) => {
      toast.error(
        <div className="flex justify-between items-center">
          <span className={textSize}>{message}</span> {/* Dynamic text size */}
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-red-800 hover:text-red-900"
          >
            X
          </button>
        </div>,
        {
          position: 'top-center',
          // duration: duration, // Dynamic duration
          style: {
            backgroundColor: '#F8D7DA', // Error red background
            color: '#721C24', // Error text color
            border: '1px solid #F5C6CB', // Error border color
          },
          icon: <FiAlertCircle color="#721C24" size={28} />,
        }
      );
      console.log('❌ Error toast displayed.');
    };

    const displayInfiniteErrorToast = (message: string) => {
      displayErrorToast(message, 'text-l'); // Infinite duration with increased text size
    };




    // const displayErrorToast = (message: string) => {
    //   toast.error(
    //     <div className="flex justify-between items-center">
    //       <span>{message}</span>
    //       <button
    //         onClick={() => toast.dismiss()}
    //         className="ml-4 text-red-800 hover:text-red-900"
    //       >
    //         X
    //       </button>
    //     </div>,
    //     {
    //       position: 'top-center',
    //       duration: 20000,
    //       style: {
    //         backgroundColor: '#F8D7DA', // Error red background
    //         color: '#721C24', // Error text color
    //         border: '1px solid #F5C6CB', // Error border color
    //       },
    //       icon: <FiAlertCircle color="#721C24" size={28} />,
    //     }
    //   );
    //   console.log('❌ Error toast displayed.');
    // };

    const displayWarningToast = (message: string) => {
      toast.warning(
        <div className="flex justify-between items-center">
          <span>{message}</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-yellow-800 hover:text-yellow-900"
          >
            X
          </button>
        </div>,
        {
          position: 'top-center',
          duration: 20000,
          style: {
            backgroundColor: '#FFF3CD', // Warning yellow background
            color: '#856404', // Warning text color
            border: '1px solid #FFEEBA', // Warning border color
          },
          icon: <FiInfo color="#856404" size={28} />,
        }
      );
      console.log('⚠️ Warning toast displayed.');
    };

    const displayUpgradeRequiredToast = () => {
      toast.info(
        <div className="flex justify-between items-center">
          <span>هذه الميزة متاحة للباقة المميزة فقط. يرجى شراء الباقة للاستفادة منها.</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-blue-800 hover:text-blue-900"
          >
            X
          </button>
        </div>,
        {
          position: 'top-center',
          duration: 15000,
          style: {
            backgroundColor: '#D1ECF1', // Info blue background
            color: '#0C5460', // Info text color
            border: '1px solid #BEE5EB', // Info border color
          },
          icon: <FiInfo color="#0C5460" size={28} />,
        }
      );
      console.log('ℹ️ Upgrade required toast displayed.');
    };

    const displayDefaultErrorToast = () => {
      toast.error(
        <div className="flex justify-between items-center">
          <span>حدث خطأ غير معروف.</span>
          <button
            onClick={() => toast.dismiss()}
            className="ml-4 text-red-800 hover:text-red-900"
          >
            X
          </button>
        </div>,
        {
          position: 'top-center',
          duration: 30000,
          style: {
            backgroundColor: '#F8D7DA', // Error red background
            color: '#721C24', // Error text color
            border: '1px solid #F5C6CB', // Error border color
          },
          icon: <FiAlertCircle color="#721C24" size={28} />,
        }
      );
      console.log('❌ Default unexpected error toast displayed.');
    };

    switch (status) {
      case 'success':
        displaySuccessToast();
        break;

      case 'error':
        displayErrorToast('حدث خطأ أثناء الإرسال.');
        break;

      case 'empty':
        displayWarningToast('الرجاء إدخال الموضوع أو اختيار ملف.');
        break;

      case 'templateRequired':
        displayWarningToast('يرجى اختيار قالب قبل الإرسال.');
        break;

      case 'network-error':
        displayErrorToast('حدث خطأ في الشبكة. يرجى التحقق من اتصالك.');
        break;

      case 'server-error':
        displayErrorToast('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.');
        break;

      case 'client-error':
        displayErrorToast('فشل الإرسال بسبب إدخال غير صالح.');
        break;

      case 'unauthorized':
        displayErrorToast('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.');
        break;

        case 'timeout-error':
        displayInfiniteErrorToast('لم يتم تجهيز الملف في الوقت المحدد. يرجى المحاولة مرة أخرى.');
        break;

      // case 'timeout-error':
      //   displayErrorToast('لم يتم تجهيز الملف في الوقت المحدد. يرجى المحاولة مرة أخرى.');
      //   break;

      case 'topic-too-long':
        displayWarningToast('الموضوع طويل جدًا. يرجى تحديده بـ 50 حرف.');
        break;

      case 'file-too-large':
        displayWarningToast('الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.');
        break;

      case 'invalid-file-type':
        displayWarningToast('نوع الملف غير صالح. يرجى تحميل ملف .docx.');
        break;

      case 'insufficient-credits':
        displayErrorToast('رصيدك غير كافٍ. يرجى ترقية خطتك.');
        break;

      case 'upgrade-required':
        displayUpgradeRequiredToast();
        break;

      default:
        displayDefaultErrorToast();
        break;
    }
  }, [status]);

  return null; // This component doesn't render anything
};

export default Notifications;

// // src/components/Notifications.tsx

// import React, { useEffect } from 'react';
// import { toast } from 'sonner';
// import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

// interface NotificationsProps {
//   status: string;
// }

// const Notifications: React.FC<NotificationsProps> = ({ status }) => {
//   useEffect(() => {
//     if (!status) return;

//     console.log('🔔 Notifications component handling status:', status);

//     const displaySuccessToast = () => {
//       toast.success(
//         <div className="flex text-xl justify-between items-center">
//           <span>تم الإرسال بنجاح!</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="mr-12 text-green-800 hover:text-green-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 10000,
//           style: {
//             backgroundColor: '#D4EDDA', // Success green background
//             color: '#155724', // Success text color
//             border: '1px solid #C3E6CB', // Success border color
//           },
//           icon: <FiCheckCircle color="#155724" size={24} />,
//         }
//       );
//       console.log('✅ Success toast displayed.');

//       // Toast after 30 seconds: File is being prepared
//       const prepareToastId = setTimeout(() => {
//         toast.info(
//           <div className="flex text-xl justify-between items-center">
//             <span>يتم تجهيز الملف...</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-12 text-blue-800 hover:text-blue-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 10000,
//             style: {
//               backgroundColor: '#D1ECF1', // Info blue background
//               color: '#0C5460', // Info text color
//               border: '1px solid #BEE5EB', // Info border color
//             },
//             icon: <FiInfo color="#0C5460" size={24} />,
//           }
//         );
//         console.log('ℹ️ File is being prepared toast displayed.');
//       }, 25000); 

//       // Toast after 60 seconds: File is being finalized
//       const finalizeToastId = setTimeout(() => {
//         toast.info(
//           <div className="flex text-xl justify-between items-center">
//             <span>يتم إنهاء الملف...</span>
//             <button
//               onClick={() => toast.dismiss()}
//               className="mr-12 text-blue-800 hover:text-blue-900"
//             >
//               X
//             </button>
//           </div>,
//           {
//             position: 'top-center',
//             duration: 10000,
//             style: {
//               backgroundColor: '#D1ECF1', // Info blue background
//               color: '#0C5460', // Info text color
//               border: '1px solid #BEE5EB', // Info border color
//             },
//             icon: <FiInfo color="#0C5460" size={24} />,
//           }
//         );
//         console.log('ℹ️ File is being finalized toast displayed.');
//       }, 45000); 

//       // Cleanup function to clear timeouts if the component unmounts or status changes
//       return () => {
//         clearTimeout(prepareToastId);
//         clearTimeout(finalizeToastId);
//       };
//     };

//     const displayErrorToast = (message: string) => {
//       toast.error(
//         <div className="flex justify-between items-center">
//           <span>{message}</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-red-800 hover:text-red-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 20000,
//           style: {
//             backgroundColor: '#F8D7DA', // Error red background
//             color: '#721C24', // Error text color
//             border: '1px solid #F5C6CB', // Error border color
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//       console.log('❌ Error toast displayed.');
//     };

//     const displayWarningToast = (message: string) => {
//       toast.warning(
//         <div className="flex justify-between items-center">
//           <span>{message}</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="mr-20 text-yellow-800 hover:text-yellow-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 20000,
//           style: {
//             backgroundColor: '#FFF3CD', // Warning yellow background
//             color: '#856404', // Warning text color
//             border: '1px solid #FFEEBA', // Warning border color
//           },
//           icon: <FiInfo color="#856404" size={24} />,
//         }
//       );
//       console.log('⚠️ Warning toast displayed.');
//     };

//     const displayDefaultErrorToast = () => {
//       toast.error(
//         <div className="flex justify-between items-center">
//           <span>حدث خطأ غير معروف.</span>
//           <button
//             onClick={() => toast.dismiss()}
//             className="ml-4 text-red-800 hover:text-red-900"
//           >
//             X
//           </button>
//         </div>,
//         {
//           position: 'top-center',
//           duration: 30000,
//           style: {
//             backgroundColor: '#F8D7DA', // Error red background
//             color: '#721C24', // Error text color
//             border: '1px solid #F5C6CB', // Error border color
//           },
//           icon: <FiAlertCircle color="#721C24" size={24} />,
//         }
//       );
//       console.log('❌ Default unexpected error toast displayed.');
//     };
    

//     switch (status) {
//       case 'success':
//         displaySuccessToast();
//         break;

//       case 'error':
//         displayErrorToast('حدث خطأ أثناء الإرسال.');
//         break;

//       case 'empty':
//         displayWarningToast('الرجاء إدخال الموضوع أو اختيار ملف.');
//         break;

//       case 'templateRequired':
//         displayWarningToast('يرجى اختيار قالب قبل الإرسال.');
//         break;

//       case 'network-error':
//         displayErrorToast('حدث خطأ في الشبكة. يرجى التحقق من اتصالك.');
//         break;

//       case 'server-error':
//         displayErrorToast('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.');
//         break;

//       case 'client-error':
//         displayErrorToast('فشل الإرسال بسبب إدخال غير صالح.');
//         break;

//       case 'unauthorized':
//         displayErrorToast('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.');
//         break;

//       case 'timeout-error':
//         displayErrorToast('لم يتم تجهيز الملف في الوقت المحدد. يرجى المحاولة مرة أخرى.');
//         break;

//       case 'topic-too-long':
//         displayWarningToast('الموضوع طويل جدًا. يرجى تحديده بـ 100 حرف.');
//         break;

//       case 'file-too-large':
//         displayWarningToast('الملف كبير جدًا. الحجم الأقصى هو 5 ميجابايت.');
//         break;

//       case 'invalid-file-type':
//         displayWarningToast('نوع الملف غير صالح. يرجى تحميل ملف .docx.');
//         break;

//       case 'insufficient-credits':
//         displayErrorToast('رصيدك غير كافٍ. يرجى ترقية خطتك.');
//         break;

//       default:
//         displayDefaultErrorToast();
//         break;
//     }
//   }, [status]);

//   return null; // This component doesn't render anything
// };

// export default Notifications;
