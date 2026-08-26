import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * Brasão do SGEx carregado diretamente da pasta public.
 * Mantém a mesma API do componente anterior para que frente, verso,
 * visualização e exportação do certificado usem a imagem oficial.
 */
export const SGExEmblem: React.FC<EmblemProps> = ({ className = '', size = 80 }) => {
  return (
    <img
      src="/segexsf.png"
      alt="Brasão SGEx"
      width={size}
      style={{ width: `${size}px`, height: 'auto', objectFit: 'contain' }}
      className={`drop-shadow-sm select-none ${className}`}
      draggable={false}
    />
  );
};
