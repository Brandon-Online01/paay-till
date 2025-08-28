import { ReactNode } from 'react';
import PageWrapper from '@/components/page-wrapper';
import ToastProvider from './toast.provider';

interface BaseProviderProps {
    children: ReactNode;
}

export default function BaseProvider({ children }: BaseProviderProps) {
    return (
        <PageWrapper>
            {children}
            <ToastProvider />
        </PageWrapper>
    );
}
