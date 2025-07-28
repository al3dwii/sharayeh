// src/components/PresentationForm.tsx
import React from "react";
import Loading from "@/components/global/loadingsm";

interface Template {
  id: string;
  name: string;
  preview: string;
  category: string;
}

interface PresentationFormProps {
  topicValue: string;
  documentFile: File | null;
  selectedTemplate: Template | null;
  isSubmitting: boolean;
  isLoading: boolean;
  handleTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onOpenTemplateModal: () => void;          // ✅ only this one now
}

const PresentationForm: React.FC<PresentationFormProps> = ({
  topicValue,
  documentFile,
  selectedTemplate,
  isSubmitting,
  isLoading,
  handleTopicChange,
  handleFileChange,
  handleSubmit,
  onOpenTemplateModal,                      // ✅ destructure the new prop
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isSubmitting || isLoading} className="w-full">
        {/* --- file upload --- */}
        <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
          <div className="flex justify-center p-2 m-auto">
            <div className="mb-4 flex-1 lg:ml-2">
              <input
                type="file"
                name="document"
                id="document"
                accept=".docx"
                onChange={handleFileChange}
                disabled={topicValue !== ""}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>

        {/* --- choose template button --- */}
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={onOpenTemplateModal}     // ✅ use the callback
            className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            {selectedTemplate
              ? `تم اختيار القالب: ${selectedTemplate.name}`
              : "اختر القالب"}
          </button>
        </div>

        {/* --- submit button --- */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? <Loading /> : "إرسال"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default PresentationForm;


// // src/components/PresentationForm.tsx

// import React from 'react';
// import Loading from '@/components/global/loadingsm'

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   category: string;
// }

// interface PresentationFormProps {
//   topicValue: string;
//   documentFile: File | null;
//   selectedTemplate: Template | null;
//   isSubmitting: boolean;
//   isLoading: boolean;
//   handleTopicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
//   setIsTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // Updated prop name
//   onOpenTemplateModal: () => void;   // ⬅️ replaces setIsTemplateModalOpen

// }

// const PresentationForm: React.FC<PresentationFormProps> = ({
//   topicValue,
//   documentFile,
//   selectedTemplate,
//   isSubmitting,
//   isLoading,
//   handleTopicChange,
//   handleFileChange,
//   handleSubmit,
//   setIsTemplateModalOpen // Destructure the updated prop
// }) => {

//   return (
//     <form onSubmit={handleSubmit}>
//       <fieldset disabled={isSubmitting || isLoading} className="w-full">
//         <div className="flex m-auto w-5/6 flex-col lg:flex-row justify-between">
      
//           {/* <div className="flex justify-center px-4 text-xl py-2"> أو </div> */}
//           <div className="flex justify-center p-2 m-auto">

//           <div className="mb-4 flex-1 lg:ml-2">
//             <input
//               type="file"
//               name="document"
//               id="document"
//               accept=".docx"
//               onChange={handleFileChange}
//               disabled={topicValue !== ''}
//               className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           </div>
//         </div>

//         <div className="mb-4 flex justify-center">
//           <button
//             type="button"
//             onClick={() => setIsTemplateModalOpen(true)}
//             className="md:w-1/4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
//           >
//             {selectedTemplate ? `تم اختيار القالب: ${selectedTemplate.name}` : 'اختر القالب'}
//           </button>
//         </div>

//         <div className="flex justify-center">
//           <button
//             type="submit"
//             className="md:w-1/4 center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
//             disabled={isSubmitting || isLoading}
//           >
//             {isSubmitting ? 
            
//             <Loading></Loading>

//             // 'جاري الإرسال...'
            
//             : 'إرسال'}
//           </button>
//         </div>
//       </fieldset>
//     </form>
//   );
// };

// export default PresentationForm;
