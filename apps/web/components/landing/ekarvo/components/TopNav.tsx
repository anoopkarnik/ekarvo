import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface TopNavProps {
  onNavigateScene: (sceneId: string) => void;
  onOpenModal: (modal: 'contact' | 'platform' | 'solutions' | 'company') => void;
}

const navigation = [
  ['Platform', 'scene-05'], ['Pulse', 'scene-06'], ['Drive', 'scene-07'],
  ['Workflows', 'scene-08'], ['Capabilities', 'scene-10'], ['Governance', 'scene-11'],
] as const;

export function TopNav({ onNavigateScene, onOpenModal }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (id: string) => {
    setMenuOpen(false);
    onNavigateScene(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-12 bg-[#090D11]/95 border-b border-[#26333C] text-[#EEF3F0]">
      <a href="#scene-01" onClick={(event) => { event.preventDefault(); navigate('scene-01'); }} className="font-display text-base font-extrabold tracking-[0.2em] shrink-0">EKARVO</a>
      <nav aria-label="Primary navigation" className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#8C9A9F]">
        {navigation.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); navigate(id); }} className="inline-flex min-h-11 items-center hover:text-[#EEF3F0] transition-colors">{label}</a>)}
      </nav>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { setMenuOpen(false); onOpenModal('contact'); }} className="min-h-11 px-3 sm:px-4 text-xs font-semibold tracking-wide bg-[#5DDEC4] text-[#090D11] rounded-lg hover:bg-[#4bcbb1] whitespace-nowrap cursor-pointer">Talk to EKARVO</button>
        <button type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="ekarvo-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="xl:hidden flex size-11 items-center justify-center rounded-lg border border-[#26333C] cursor-pointer">{menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}</button>
      </div>
      {menuOpen && <nav id="ekarvo-mobile-navigation" aria-label="Mobile navigation" onKeyDown={(event) => { if (event.key === 'Escape') { setMenuOpen(false); (event.currentTarget.previousElementSibling?.lastElementChild as HTMLButtonElement)?.focus(); } }} className="xl:hidden absolute top-full inset-x-0 grid gap-1 border-b border-[#26333C] bg-[#090D11] p-4 shadow-xl">
        {navigation.map(([label, id]) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); navigate(id); }} className="flex min-h-11 items-center rounded-lg px-4 text-sm hover:bg-[#121A20]">{label}</a>)}
      </nav>}
    </header>
  );
}
