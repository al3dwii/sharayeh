
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Loading from '@/components/global/loading';

interface Template {
  id: string;
  name: string;
  preview: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/api/templates');
          console.log('Templates response:', response.data); 
          setTemplates(response.data.templates || []);
        } catch (error) {
          console.error('Error fetching templates:', error);
          setTemplates([]);
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
      <div className="bg-white rounded-lg p-8 sm:p-6 sm:w-3/4 w-full max-w-6xl">
        <h2 className="text-lg font-bold mb-4 text-center">اختر قالبًا</h2>

        {loading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
            <p>جاري تحميل القوالب...</p>
            <Loading />
          </div>
          
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative bg-white rounded-lg hover:border-[2px] border border-transparent hover:border-blue-500 hover:border-[4px] overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
              >
                <img src={template.preview} alt={template.name} className="w-full h-40 object-cover" />
                <div className="p-2">
                  <p className="text-sm font-semibold text-center">{template.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default TemplateModal