import React, { useState, useMemo } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Loading from '@/components/global/loading';
import useSWR from 'swr';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('business');

  const categories = [
    { value: 'business', label: 'أعمال' },
    { value: 'children', label: 'أطفال' },
    { value: 'education', label: 'تعليم' },
    { value: 'collection', label: 'متنوع' }
  ];

  const { data, error, isValidating } = useSWR(isOpen ? '/api/templates' : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  const templates: Template[] = data?.templates || [];

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.category === selectedCategory),
    [templates, selectedCategory]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
    >
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[600px] mx-4 my-8 overflow-auto">
        <h2 id="template-modal-title" className="text-lg font-bold mb-4 text-center">
          اختر قالبًا
        </h2>

        {/* Tabs for categories */}
        <div className="flex justify-center mb-4">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedCategory(value)}
              className={`mx-2 px-4 py-2 rounded ${
                selectedCategory === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
              aria-pressed={selectedCategory === value}
            >
              {label}
            </button>
          ))}
          <div >
           <button
          onClick={onClose}
          className="mr-8 w-full bg-black text-white p-2 rounded hover:bg-gray-600"

          aria-label="Close modal"
        >
          إغلاق
        </button>
        </div>
        </div>

        {isValidating ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <p>جاري تحميل القوالب...</p>
            <Loading />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">حدث خطأ أثناء تحميل القوالب.</p>
        ) : (
          <>
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="relative bg-white rounded-lg hover:border-2 border border-transparent hover:border-blue-500 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => {
                      onSelect(template);
                      onClose();
                    }}
                    role="button"
                    aria-label={`Select template ${template.name}`}
                  >
                    <div className="w-full h-40 relative">
                      <Image
                        src={template.preview}
                        alt={template.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.src = '/logo.png'; // Replace with your fallback image
                        }}
                        placeholder="blur"
                        blurDataURL="/logo.png"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-semibold text-center">{template.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">لا توجد قوالب متاحة في هذه الفئة.</p>
            )}
          </>
        )}

       
      </div>
    </div>
  );
};

export default TemplateModal;


// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import Image from 'next/image';
// import Loading from '@/components/global/loading';

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// interface TemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelect: (template: Template) => void;
// }

// const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('business');

//   const categories = [
//     { value: 'business', label: 'أعمال' },
//     { value: 'children', label: 'أطفال' },
//     { value: 'education', label: 'تعليم' },
//     { value: 'collection', label: 'متنوع' }

//   ];

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('/api/templates');
//         console.log('Templates response:', response.data);
//         setTemplates(response.data.templates || []);
//       } catch (error) {
//         console.error('Error fetching templates:', error);
//         setTemplates([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchTemplates();
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }

//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   const filteredTemplates = useMemo(
//     () => templates.filter((template) => template.category === selectedCategory),
//     [templates, selectedCategory]
//   );

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="template-modal-title"
//     >
//       <div
//         className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[600px] mx-4 my-8 overflow-auto"
//       >
//         <h2 id="template-modal-title" className="text-lg font-bold mb-4 text-center">
//           اختر قالبًا
//         </h2>

//         {/* Tabs for categories */}
//         <div className="flex justify-center mb-4">
//           {categories.map(({ value, label }) => (
//             <button
//               key={value}
//               onClick={() => setSelectedCategory(value)}
//               className={`mx-2 px-4 py-2 rounded ${
//                 selectedCategory === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
//               }`}
//               aria-pressed={selectedCategory === value}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center p-8 gap-4">
//             <p>جاري تحميل القوالب...</p>
//             <Loading />
//           </div>
//         ) : (
//           <>
//             {filteredTemplates.length > 0 ? (
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {filteredTemplates.map((template) => (
//                   <div
//                     key={template.id}
//                     className="relative bg-white rounded-lg hover:border-2 border border-transparent hover:border-blue-500 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                     onClick={() => {
//                       onSelect(template);
//                       onClose();
//                     }}
//                     role="button"
//                     aria-label={`Select template ${template.name}`}
//                   >
//                     <div className="w-full h-40 relative">
//                       <Image
//                         src={template.preview}
//                         alt={template.name}
//                         fill
//                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                         style={{ objectFit: 'contain' }}
//                         onError={(e) => {
//                           e.currentTarget.src = '/logo.png'; // Replace with your fallback image
//                         }}
//                         placeholder="blur" 
//                         blurDataURL="/logo.png" 
//                       />
//                     </div>
//                     <div className="p-2">
//                       <p className="text-sm font-semibold text-center">{template.name}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-center text-gray-500">لا توجد قوالب متاحة في هذه الفئة.</p>
//             )}
//           </>
//         )}

//         <button
//           onClick={onClose}
//           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//           aria-label="Close modal"
//         >
//           إغلاق
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateModal;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Loading from '@/components/global/loading';

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string; // Ensure each template has a 'category' property
// }

// interface TemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelect: (template: Template) => void;
// }

// const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('business');

//   // Define the categories with labels for display
//   const categories = [
//     { value: 'business', label: 'أعمال' },
//     { value: 'children', label: 'أطفال' },
//     { value: 'education', label: 'تعليم' },
//   ];

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('/api/templates');
//         console.log('Templates response:', response.data);
//         setTemplates(response.data.templates || []);
//       } catch (error) {
//         console.error('Error fetching templates:', error);
//         setTemplates([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchTemplates();
//       // Prevent background scrolling
//       document.body.style.overflow = 'hidden';
//     } else {
//       // Re-enable background scrolling
//       document.body.style.overflow = '';
//     }

//     // Cleanup when the component is unmounted
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   // Filter templates based on the selected category
//   const filteredTemplates = templates.filter(
//     (template) => template.category === selectedCategory
//   );

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
//     >
//       <div
//         className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[600px] mx-4 my-8 overflow-auto"
//       >
//         <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

//         {/* Tabs for categories */}
//         <div className="flex justify-center mb-4">
//           {categories.map(({ value, label }) => (
//             <button
//               key={value}
//               onClick={() => setSelectedCategory(value)}
//               className={`mx-2 px-4 py-2 rounded ${
//                 selectedCategory === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center p-8 gap-4">
//             <p>جاري تحميل القوالب...</p>
//             <Loading />
//           </div>
//         ) : (
//           <>
//             {filteredTemplates.length > 0 ? (
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {filteredTemplates.map((template) => (
//                   <div
//                     key={template.id}
//                     className="relative bg-white rounded-lg hover:border-2 border border-transparent hover:border-blue-500 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                     onClick={() => {
//                       onSelect(template);
//                       onClose();
//                     }}
//                   >
//                     <img
//                       src={template.preview}
//                       alt={template.name}
//                       className="w-full h-40 object-cover"
//                     />
//                     <div className="p-2">
//                       <p className="text-sm font-semibold text-center">{template.name}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-center text-gray-500">لا توجد قوالب متاحة في هذه الفئة.</p>
//             )}
//           </>
//         )}

//         <button
//           onClick={onClose}
//           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//         >
//           إغلاق
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateModal;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Loading from '@/components/global/loading';

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
// }

// interface TemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelect: (template: Template) => void;
// }

// const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('/api/templates');
//         console.log('Templates response:', response.data); 
//         setTemplates(response.data.templates || []);
//       } catch (error) {
//         console.error('Error fetching templates:', error);
//         setTemplates([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchTemplates();
//       // Prevent background scrolling
//       document.body.style.overflow = 'hidden';
//     } else {
//       // Re-enable background scrolling
//       document.body.style.overflow = '';
//     }

//     // Cleanup when the component is unmounted
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex  items-center justify-center z-50 overflow-auto"
//     >
//       <div
//         className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[600px] mx-4 my-8 overflow-auto"
//       >
//         <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center p-8 gap-4">
//             <p>جاري تحميل القوالب...</p>
//             <Loading />
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {templates.map((template) => (
//               <div
//                 key={template.id}
//                 className="relative bg-white rounded-lg hover:border-2 border border-transparent hover:border-blue-500 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                 onClick={() => {
//                   onSelect(template);
//                   onClose();
//                 }}
//               >
//                 <img
//                   src={template.preview}
//                   alt={template.name}
//                   className="w-full h-40 object-cover"
//                 />
//                 <div className="p-2">
//                   <p className="text-sm font-semibold text-center">{template.name}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <button
//           onClick={onClose}
//           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//         >
//           إغلاق
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateModal;


// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios';
// import Loading from '@/components/global/loading';

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
// }

// interface TemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSelect: (template: Template) => void;
// }

// const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen) {
//       const fetchTemplates = async () => {
//         setLoading(true);
//         try {
//           const response = await axios.get('/api/templates');
//           console.log('Templates response:', response.data); 
//           setTemplates(response.data.templates || []);
//         } catch (error) {
//           console.error('Error fetching templates:', error);
//           setTemplates([]);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchTemplates();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
//         <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

//         {loading ? (
//             <div className="flex flex-col items-center justify-center p-8 gap-4">
//             <p>جاري تحميل القوالب...</p>
//             <Loading />
//           </div>
          
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {templates.map((template) => (
//               <div
//                 key={template.id}
//                 className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
//                 onClick={() => {
//                   onSelect(template);
//                   onClose();
//                 }}
//               >
//                 <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
//                 <div className="p-2">
//                   <p className="text-sm font-semibold text-center">{template.name}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <button
//           onClick={onClose}
//           className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//         >
//           إغلاق
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateModal