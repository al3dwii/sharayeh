// components/ProModal.tsx

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import  Button from '@/components/ui/Button2';
import { Zap } from 'lucide-react';
import { useProModal } from '@/hooks/useProModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProModal: React.FC = () => {
  const isOpen = useProModal((state) => state.isOpen);
  const onClose = useProModal((state) => state.onClose);
  const [loading, setLoading] = useState(false);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.get('pricing');
      window.location.href = response.data.url; // Redirect to Stripe
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
            <div className="flex items-center gap-x-2 font-bold text-xl">
              الاشتراك في احد الباقات التالية
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} onClick={onSubscribe} className="w-full">
            اشترك
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;


// // components/ProModal.tsx

// 'use client';

// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Zap } from 'lucide-react';
// import { useProModal } from '@/hooks/use-pro-modal';
// import { toast } from 'react-hot-toast';
// import axios from 'axios';

// export const ProModal: React.FC = () => {
//   const proModal = useProModal();
//   const [loading, setLoading] = useState(false);

//   const onSubscribe = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('/api/stripe');

//       window.location.href = response.data.url; // Redirect to Stripe
//     } catch (error) {
//       toast.error('Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
//             <div className="flex items-center gap-x-2 font-bold text-xl">
//               الاشتراك في احد الباقات التالية 
//             </div>
//           </DialogTitle>
//         </DialogHeader>
//         <DialogFooter>
//           <Button disabled={loading} onClick={onSubscribe} size="lg" className="w-full">
//             اشترك
//             <Zap className="w-4 h-4 ml-2 fill-white" />
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };
