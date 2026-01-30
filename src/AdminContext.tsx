import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { PinModal } from './PinModal';

interface AdminContextType {
    isAdmin: boolean;
    unlock: (pin: string) => boolean;
    lock: () => void;
    showPinPrompt: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const unlock = (pin: string) => {
        if (pin === '2026') {
            setIsAdmin(true);
            setIsModalOpen(false);
            return true;
        }
        return false;
    };

    const lock = () => {
        setIsAdmin(false);
    };

    const showPinPrompt = () => {
        if (isAdmin) return;
        setIsModalOpen(true);
    };

    return (
        <AdminContext.Provider value={{ isAdmin, unlock, lock, showPinPrompt }}>
            {children}
            <PinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUnlock={unlock} />
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
