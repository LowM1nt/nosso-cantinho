// Acima de "mobile" (>= 768px) liberamos a versão com joguinhos pixelados.
export const isDesktop = (win = window) =>
  !!(win.matchMedia && win.matchMedia('(min-width: 768px)').matches);
