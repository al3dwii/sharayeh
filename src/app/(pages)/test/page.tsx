'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from 'axios';

// Modal component for selecting templates
const TemplateModal = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Fetch templates when the modal is opened
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/api/templates'); // Replace with your backend endpoint
          setTemplates(response.data);
        } catch (error) {
          console.error('Error fetching templates:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-3/4 max-w-4xl">
        <h2 className="text-lg font-bold mb-4">Select a Template</h2>
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border p-2 rounded cursor-pointer hover:shadow-lg"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
              >
                <img src={template.preview} alt={template.name} className="mb-2 rounded" />
                <p className="text-sm font-semibold text-center">{template.name}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CardsSection = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    file: null,
  });

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100 && !hasAnimated) {
        setHasAnimated(true);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasAnimated]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    const data = new FormData();
    data.append('topic', formData.topic);
    data.append('templateId', selectedTemplate.id); // Include the selected template ID
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Data sent successfully!');
    } catch (error) {
      console.error('Error sending data:', error);
      alert('Failed to send data.');
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <motion.div
        initial={{ opacity: 100, y: 50 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Submit a Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="topic"
                >
                  Topic for the Presentation
                </label>
                <input
                  type="text"
                  name="topic"
                  id="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Enter the topic"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
                >
                  {selectedTemplate ? `Template Selected: ${selectedTemplate.name}` : 'Choose Template'}
                </button>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="file"
                >
                  Upload a File (optional)
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Template selection modal */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(template) => setSelectedTemplate(template)}
      />
    </div>
  );
};

export default CardsSection;



// 'use client';

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import axios from 'axios';

// // Modal component for selecting templates
// const TemplateModal = ({ isOpen, onClose, onSelect }) => {
//   const templates = [
//     {
//       id: '1wOqnldp5jO-L4yc-LKcMvyGBfqXG3A3rQdudham-OiA',
//       name: 'Customer Segments',
//       preview: 'https://drive.google.com/uc?export=view&id=1wOqnldp5jO-L4yc-LKcMvyGBfqXG3A3rQdudham-OiA',
//     },
//     {
//       id: '1HPgTZtm3yF4tYf32zuAYDk8pFzSi4H2aJvBSo0LtI2Y',
//       name: 'Commercial Project Plan',
//       preview: 'https://drive.google.com/uc?export=view&id=1HPgTZtm3yF4tYf32zuAYDk8pFzSi4H2aJvBSo0LtI2Y',
//     },
//     // Add more templates here with correct preview URLs
//   ];

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-4 w-3/4 max-w-4xl">
//         <h2 className="text-lg font-bold mb-4">Select a Template</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {templates.map((template) => (
//             <div
//               key={template.id}
//               className="border p-2 rounded cursor-pointer hover:shadow-lg"
//               onClick={() => {
//                 onSelect(template);
//                 onClose();
//               }}
//             >
//               <img src={template.preview} alt={template.name} className="mb-2 rounded" />
//               <p className="text-sm font-semibold text-center">{template.name}</p>
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// const CardsSection = () => {
//   const [hasAnimated, setHasAnimated] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [formData, setFormData] = useState({
//     topic: '',
//     file: null,
//   });

//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY > 100 && !hasAnimated) {
//         setHasAnimated(true);
//       }
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [hasAnimated]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedTemplate) {
//       alert('Please select a template');
//       return;
//     }

//     const data = new FormData();
//     data.append('topic', formData.topic);
//     data.append('templateId', selectedTemplate.id); // Include the selected template ID
//     if (formData.file) {
//       data.append('file', formData.file);
//     }

//     try {
//       await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Data sent successfully!');
//     } catch (error) {
//       console.error('Error sending data:', error);
//       alert('Failed to send data.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-16 px-4">
//       <motion.div
//         initial={{ opacity: 100, y: 50 }}
//         animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Submit a Topic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="topic"
//                 >
//                   Topic for the Presentation
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   value={formData.topic}
//                   onChange={handleChange}
//                   placeholder="Enter the topic"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>

//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="file"
//                 >
//                   Upload a File (optional)
//                 </label>
//                 <input
//                   type="file"
//                   name="file"
//                   id="file"
//                   onChange={handleChange}
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>

//               <div className="mb-4">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
//                 >
//                   {selectedTemplate ? `Template Selected: ${selectedTemplate.name}` : 'Choose Template'}
//                 </button>
//               </div>

//               <div className="flex items-center justify-between">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Template selection modal */}
//       <TemplateModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelect={(template) => setSelectedTemplate(template)}
//       />
//     </div>
//   );
// };

// export default CardsSection;


// 'use client'

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import axios from 'axios';

// // Modal component for selecting templates
// const TemplateModal = ({ isOpen, onClose, onSelect }) => {
//   const templates = [
//     { id: '1wOqnldp5jO-L4yc-LKcMvyGBfqXG3A3rQdudham-OiA', name: 'Customer Segments', preview: '/path/to/image1.jpg' },
//     { id: '1HPgTZtm3yF4tYf32zuAYDk8pFzSi4H2aJvBSo0LtI2Y', name: 'Commercial Project Plan', preview: '/path/to/image2.jpg' },
//     // Add more templates here
//   ];

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg p-4 w-3/4 max-w-4xl">
//         <h2 className="text-lg font-bold mb-4">Select a Template</h2>
//         <div className="grid grid-cols-4 gap-4">
//           {templates.map((template) => (
//             <div
//               key={template.id}
//               className="border p-2 rounded cursor-pointer hover:shadow-lg"
//               onClick={() => {
//                 onSelect(template.id);
//                 onClose();
//               }}
//             >
//               <img src={template.preview} alt={template.name} className="mb-2 rounded" />
//               <p className="text-sm font-semibold text-center">{template.name}</p>
//             </div>
//           ))}
//         </div>
//         <button onClick={onClose} className="mt-4 text-blue-500">
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// const CardsSection = () => {
//   const [hasAnimated, setHasAnimated] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedTemplateId, setSelectedTemplateId] = useState('');
//   const [formData, setFormData] = useState({
//     topic: '',
//     file: null,
//   });

//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY > 100 && !hasAnimated) {
//         setHasAnimated(true);
//       }
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [hasAnimated]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedTemplateId) {
//       alert('Please select a template');
//       return;
//     }

//     const data = new FormData();
//     data.append('topic', formData.topic);
//     data.append('templateId', selectedTemplateId); // Include the selected template ID
//     if (formData.file) {
//       data.append('file', formData.file);
//     }

//     try {
//       await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Data sent successfully!');
//     } catch (error) {
//       console.error('Error sending data:', error);
//       alert('Failed to send data.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-16 px-4">
//       <motion.div
//         initial={{ opacity: 100, y: 50 }}
//         animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Submit a Topic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="topic"
//                 >
//                   Topic for the Presentation
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   value={formData.topic}
//                   onChange={handleChange}
//                   placeholder="Enter the topic"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="mb-4">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(true)}
//                   className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
//                 >
//                   {selectedTemplateId ? `Template Selected: ${selectedTemplateId}` : 'Choose Template'}
//                 </button>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Template selection modal */}
//       <TemplateModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelect={(templateId) => setSelectedTemplateId(templateId)}
//       />
//     </div>
//   );
// };

// export default CardsSection;


// 'use client'

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import axios from 'axios';

// const CardsSection = () => {
//   const [hasAnimated, setHasAnimated] = useState(false);

//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY > 100 && !hasAnimated) {
//         setHasAnimated(true);
//       }
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [hasAnimated]);

//   const [formData, setFormData] = useState({
//     topic: '',
//     templateId: '', // Add template ID to the state
//     file: null, 
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     data.append('topic', formData.topic);
//     data.append('templateId', formData.templateId); // Include template ID
//     if (formData.file) {
//       data.append('file', formData.file);
//     }

//     try {
//       await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Data sent successfully!');
//     } catch (error) {
//       console.error('Error sending data:', error);
//       alert('Failed to send data.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-16 px-4">
//       <motion.div
//         initial={{ opacity: 100, y: 50 }}
//         animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Submit a Topic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="topic"
//                 >
//                   Topic for the Presentation
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   value={formData.topic}
//                   onChange={handleChange}
//                   placeholder="Enter the topic"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="templateId"
//                 >
//                   Template ID
//                 </label>
//                 <input
//                   type="text"
//                   name="templateId"
//                   id="templateId"
//                   value={formData.templateId}
//                   onChange={handleChange}
//                   placeholder="Enter the template ID"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="mb-6">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="file"
//                 >
//                   Upload a File (Optional)
//                 </label>
//                 <input
//                   type="file"
//                   name="file"
//                   id="file"
//                   onChange={handleChange}
//                   className="w-full text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// export default CardsSection;

// 'use client'

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import axios from 'axios';

// const CardsSection = () => {
//   const [hasAnimated, setHasAnimated] = useState(false);

//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY > 100 && !hasAnimated) {
//         setHasAnimated(true);
//       }
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [hasAnimated]);

//   const [formData, setFormData] = useState({
//     topic: '',
//     file: null, // Include file in the state
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     data.append('topic', formData.topic);
//     if (formData.file) {
//       data.append('file', formData.file);
//     }

//     try {
//       await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Data sent successfully!');
//     } catch (error) {
//       console.error('Error sending data:', error);
//       alert('Failed to send data.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-16 px-4">
//       <motion.div
//         initial={{ opacity: 100, y: 50 }}
//         animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Submit a Topic</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="topic"
//                 >
//                   Topic for the Presentation
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   id="topic"
//                   value={formData.topic}
//                   onChange={handleChange}
//                   placeholder="Enter the topic"
//                   required
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="mb-6">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="file"
//                 >
//                   Upload a File (Optional)
//                 </label>
//                 <input
//                   type="file"
//                   name="file"
//                   id="file"
//                   onChange={handleChange}
//                   className="w-full text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// export default CardsSection;


// 'use client'

// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// import axios from 'axios';



// const cardData = [
//   {
//     title: "مولد شعارات بالذكاء الاصطناعي",
//     description: "مولد الشعارات بالذكاء الاصطناعي لدينا هو أداة متطورة مصممة بعناية...",
//     buttonText: "ولد شعارك الآن",
//     badge: "جديد",
//     icon: "/path-to-your-icon/gulfpicasso.png",
//   },
//   {
//     title: "مولد منشورات تواصل اجتماعي",
//     description: "انشر كالمحترفين على وسائل التواصل الاجتماعي...",
//     buttonText: "ولد منشورك الآن",
//     icon: "/path-to-your-icon/social-post.png",
//   },
//   {
//     title: "مولد صور شخصية",
//     description: "قم بتحويل نفسك إلى شخصيات متنوعة باستخدام تقنيات الذكاء الاصطناعي...",
//     buttonText: "أنشئ صورتك الآن",
//     icon: "/path-to-your-icon/avatar.png",
//   },
//   {
//     title: "مولد صور بالذكاء الاصطناعي",
//     description: "هل أنت بحاجة إلى خلفية أو شعار لتصميمك؟...",
//     buttonText: "أنشئ صورتك الآن",
//     icon: "/path-to-your-icon/ai-photo.png",
//   },
// ];

// const CardsSection = () => {
//   const [hasAnimated, setHasAnimated] = useState(false);

//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY > 100 && !hasAnimated) {
//         setHasAnimated(true);
//       }
//     };

//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [hasAnimated]);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     file: null,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const data = new FormData();
//     data.append('name', formData.name);
//     data.append('email', formData.email);
//     if (formData.file) {
//       data.append('file', formData.file);
//     }

//     try {
//       await axios.post('https://hook.eu2.make.com/qrtqbz6n3r74w3bg8enbnck7lci2w96o', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Data sent successfully!');
//     } catch (error) {
//       console.error('Error sending data:', error);
//       alert('Failed to send data.');
//     }
//   };

//   return (
//     <div className="container mx-auto py-16 px-4">
//       {/* <div className="h-[800px]">
//       <h2 className="text-center text-2xl font-bold text-black mb-8">
//         ماذا يقدم بيكاسو الخليجي؟
//       </h2>
        
//       </div> */}
     

//       <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         name="name"
//         value={formData.name}
//         onChange={handleChange}
//         placeholder="Name"
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         value={formData.email}
//         onChange={handleChange}
//         placeholder="Email"
//         required
//       />
//       <input
//         type="file"
//         name="file"
//         onChange={handleChange}
//       />
//       <button type="submit">Submit</button>
//     </form>

//     </div>
//   );
// };

// export default CardsSection;



// <h2 className="text-center text-2xl font-bold text-white mb-8">
// ماذا يقدم بيكاسو الخليجي؟
// </h2>
// <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
// {cardData.map((card, index) => (
//   <motion.div
//   key={index}
//   initial={{ opacity: 0, y: 100 }}
//   whileInView={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.5, delay: index * 0.2 }}
//   viewport={{ once: true }}
// >
//   {/* <motion.div
//     key={index}
//     initial={{ opacity: 0, y: 100 }}
//     animate={{ opacity: hasAnimated ? 0 : 1, y: hasAnimated ? 0 : 50 }}
//     transition={{ duration: 0.5, delay: index * 0.2 }}
//   > */}
//     <Card className="bg-[#1a1b2b] border border-gray-700 text-white rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-transform">
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           <img src={card.icon} alt={card.title} className="w-12 h-12" />
//           {card.badge && (
//             <span className="text-sm bg-red-500 text-black px-2 py-1 rounded-lg">
//               {card.badge}
//             </span>
//           )}
//         </div>
//         <CardTitle className="mt-4 text-lg font-semibold">
//           {card.title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="text-sm text-gray-300 mt-2">
//         {card.description}
//       </CardContent>
//       <CardFooter className="mt-4">
//         <button className="bg-purple-600 text-black py-2 px-4 rounded-lg w-full hover:bg-purple-700">
//           {card.buttonText}
//         </button>
//       </CardFooter>
//     </Card>
//   </motion.div>
// ))}
// </div>