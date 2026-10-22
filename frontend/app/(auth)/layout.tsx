import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      <div className="auth-container">
       <img src="/logo-farmgate.svg" alt="FarmGate" width={200} />
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  );
}
