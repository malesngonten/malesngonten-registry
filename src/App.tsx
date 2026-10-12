import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Code2, 
  Package, 
  Cpu, 
  Zap, 
  Smartphone, 
  X
} from 'lucide-react';
import registryData from '../registry.json';

interface RegistryFile {
  path: string;
  type: string;
}

interface ComponentEntry {
  name: string;
  description: string;
  type: string;
  dependencies: string[];
  files: RegistryFile[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Components', icon: Layers },
  { id: 'typography', label: 'Text Animation', icon: Sparkles },
  { id: 'backgrounds', label: 'Backgrounds', icon: Zap },
  { id: 'transitions', label: 'Transitions', icon: Cpu },
  { id: 'mockups', label: 'Phone Mockups', icon: Smartphone },
  { id: 'ui', label: 'UI Components', icon: Code2 },
];

export function categorizeComponent(path: string, name: string): string {
  if (path.includes('backgrounds') || name.toLowerCase().includes('shader') || name.toLowerCase().includes('gradient') || name.toLowerCase().includes('crt') || name.toLowerCase().includes('vhs')) {
    return 'backgrounds';
  }
  if (path.includes('typography') || path.includes('caption') || name.toLowerCase().includes('text') || name.toLowerCase().includes('blur') || name.toLowerCase().includes('typing') || name.toLowerCase().includes('letters')) {
    return 'typography';
  }
  if (path.includes('transitions') || name.toLowerCase().includes('zoom') || name.toLowerCase().includes('wipe') || name.toLowerCase().includes('turn') || name.toLowerCase().includes('pan')) {
    return 'transitions';
  }
  if (path.includes('mockups') || name.toLowerCase().includes('phone') || name.toLowerCase().includes('chat') || name.toLowerCase().includes('polaroid') || name.toLowerCase().includes('github')) {
    return 'mockups';
  }
  return 'ui';
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState<[string, ComponentEntry] | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const componentsList = useMemo(() => {
    return Object.entries(registryData.components || {}) as [string, ComponentEntry][];
  }, []);

  const filteredComponents = useMemo(() => {
    return componentsList.filter(([key, comp]) => {
      const primaryFile = comp.files[0]?.path || '';
      const cat = categorizeComponent(primaryFile, comp.name);
      const matchesCategory = selectedCategory === 'all' || cat === selectedCategory;
      const matchesSearch = 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [componentsList, selectedCategory, searchQuery]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner / Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Remotion Component Library</h1>
              <p className="text-xs text-slate-400">Production-ready motion primitives for Remotion</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {componentsList.length} Components Available
            </span>
            <a
              href="https://github.com/malesngonten/malesngonten-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-medium transition-colors text-slate-200"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Studio Integration & CLI Ready</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Cinematic Motion for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Remotion</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Explore a curated collection of production-ready text animations, backgrounds, transitions, and mockups. Add them instantly to your Remotion project.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search components (e.g. karaoke, lens zoom, terminal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-2xl text-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map(([key, comp]) => {
            const primaryFile = comp.files[0]?.path || '';
            const cat = categorizeComponent(primaryFile, comp.name);
            return (
              <div
                key={key}
                onClick={() => setSelectedComponent([key, comp])}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {cat}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{comp.files.length} files</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                    {comp.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                    <Package className="w-3.5 h-3.5" />
                    <span>{comp.dependencies.length} deps</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                    <span>View Details</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-20">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-1">No components found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search query or category filter.</p>
          </div>
        )}
      </main>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {categorizeComponent(selectedComponent[1].files[0]?.path || '', selectedComponent[1].name)}
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{selectedComponent[1].name}</h3>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-slate-300 text-base leading-relaxed">{selectedComponent[1].description}</p>
              </div>

              {/* Install CLI */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Installation</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between font-mono text-sm">
                  <div className="flex items-center space-x-2 text-indigo-300 overflow-x-auto">
                    <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>npx github:malesngonten/malesngonten add {selectedComponent[0]}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(`npx github:malesngonten/malesngonten add ${selectedComponent[0]}`, 'install')}
                    className="ml-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    {copiedKey === 'install' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'install' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComponent[1].dependencies.map((dep) => (
                    <span key={dep} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              {/* Component Files */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Included Files</h4>
                <div className="space-y-2">
                  {selectedComponent[1].files.map((file) => (
                    <div key={file.path} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-300">
                      <span>{file.path}</span>
                      <span className="text-slate-500 uppercase text-[10px]">{file.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <a
                href={`https://github.com/malesngonten/malesngonten-registry/tree/main/${selectedComponent[1].files[0]?.path.split('/')[0] === 'components' ? '' : 'components/'}${selectedComponent[1].files[0]?.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>View Source on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>Remotion Component Library — Powered by Remotion & GitHub Pages.</p>
      </footer>
    </div>
  );
}
