import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * Brasão da B Adm QGEx carregado diretamente da pasta public.
 * Mantém a mesma API do componente anterior para que frente, verso,
 * visualização e exportação do certificado usem a imagem oficial.
 */
export const BAdmQgexEmblem: React.FC<EmblemProps> = ({ className = '', size = 80 }) => {
  return (
    <img
      src="/badmqgex2.png"
      alt="Brasão B Adm QGEx"
      width={size}
      style={{ width: `${size}px`, height: 'auto', objectFit: 'contain' }}
      className={`drop-shadow-sm select-none ${className}`}
      draggable={false}
    />
  );
};
