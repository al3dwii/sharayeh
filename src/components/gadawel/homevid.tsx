// components/RepeatingVideo.tsx
import React from 'react';

interface RepeatingVideoProps {
    src: string; // URL of the video
    className?: string; // Optional additional Tailwind CSS classes
}

const Hvideo: React.FC<RepeatingVideoProps> = ({ src, className }) => {
    return (
        <div className={className}>
            <video src={src} className="max-w-full h-auto" loop autoPlay muted playsInline>
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default Hvideo;
