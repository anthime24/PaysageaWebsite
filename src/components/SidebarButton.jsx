import React from 'react';

const SidebarButton = ({ icon: Icon, label, onClick, active, highlight, inactive }) => {
    return (
        <button
            onClick={onClick}
            disabled={inactive}
            className={`
        w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
        ${active
                    ? 'bg-[var(--color-nature)]/10 text-[var(--color-nature)] border border-[var(--color-nature)]/20'
                    : 'text-[var(--color-structure)] hover:bg-white hover:shadow-md border border-transparent'}
        ${highlight
                    ? '!bg-[var(--color-action)] !text-white !shadow-lg !shadow-[#b26c2e]/30 !mt-auto hover:brightness-110'
                    : ''}
        ${inactive ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
        >
            <Icon size={22} className={`transition-transform duration-300 ${!inactive && 'group-hover:scale-110'}`} />
            <span className="font-medium tracking-wide">{label}</span>
        </button>
    );
};

export default SidebarButton;
