import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Tag,
  DollarSign,
  Calendar,
  ChevronRight,
  RotateCcw,
  Loader2,
  AlertCircle,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PAGE_LIMIT = 20;

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CategoryBadge({ category }) {
  const colors = [
    'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-teal-500/20 text-teal-300 border-teal-500/30',
  ];
  const idx = category.charCodeAt(0) % colors.length;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[idx]}`}>
      <Tag size={10} />
      {category}
    </span>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cursorStack, setCursorStack] = useState([null]); // stack of cursors; index = page number
  const [currentPage, setCurrentPage] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (cursor) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/products?limit=${PAGE_LIMIT}${cursor ? `&cursor=${cursor}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(null);
  }, [fetchPage]);

  const handleNext = () => {
    if (!nextCursor) return;
    const newStack = [...cursorStack, nextCursor];
    setCursorStack(newStack);
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    fetchPage(nextCursor);
  };

  const handleReset = () => {
    setCursorStack([null]);
    setCurrentPage(0);
    fetchPage(null);
  };

  const startRecord = currentPage * PAGE_LIMIT + 1;
  const endRecord = currentPage * PAGE_LIMIT + products.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-sm bg-slate-950/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">CodeVector Products</h1>
              <p className="text-slate-500 text-xs">200,000 records · Cursor pagination</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 text-sm font-medium">API Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Package} label="Total Records" value="200,000" color="bg-violet-500/80" />
          <StatCard icon={TrendingUp} label="Current Page" value={`Page ${currentPage + 1}`} color="bg-indigo-500/80" />
          <StatCard icon={DollarSign} label="Showing" value={products.length > 0 ? `#${startRecord} – #${endRecord}` : '—'} color="bg-cyan-500/80" />
        </div>

        {/* Table card */}
        <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-violet-400" />
              <span className="text-slate-200 font-semibold text-sm">Product Catalog</span>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-3 px-6 py-5 bg-rose-500/10 border-b border-rose-500/20 text-rose-400">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">Failed to fetch: {error}</span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-6 py-3.5 text-slate-500 font-medium uppercase tracking-wider text-xs">#</th>
                  <th className="text-left px-6 py-3.5 text-slate-500 font-medium uppercase tracking-wider text-xs">
                    <div className="flex items-center gap-1.5"><Package size={11} />Product Name</div>
                  </th>
                  <th className="text-left px-6 py-3.5 text-slate-500 font-medium uppercase tracking-wider text-xs">
                    <div className="flex items-center gap-1.5"><Tag size={11} />Category</div>
                  </th>
                  <th className="text-right px-6 py-3.5 text-slate-500 font-medium uppercase tracking-wider text-xs">
                    <div className="flex items-center justify-end gap-1.5"><DollarSign size={11} />Price</div>
                  </th>
                  <th className="text-right px-6 py-3.5 text-slate-500 font-medium uppercase tracking-wider text-xs">
                    <div className="flex items-center justify-end gap-1.5"><Calendar size={11} />Added On</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500">
                      <Loader2 size={28} className="animate-spin mx-auto mb-3 text-violet-500" />
                      <p className="text-sm">Fetching products…</p>
                    </td>
                  </tr>
                ) : products.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">No products found.</td>
                  </tr>
                ) : (
                  products.map((product, i) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {startRecord + i}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-100 font-medium group-hover:text-white transition-colors">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <CategoryBadge category={product.category} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-400 font-semibold tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs tabular-nums">
                        {product.createdAt ? formatDate(product.createdAt) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={handleReset}
              disabled={loading || currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              <RotateCcw size={14} />
              Reset to Page 1
            </button>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">
                {products.length > 0 ? `Records ${startRecord}–${endRecord}` : ''}
              </span>
              <button
                onClick={handleNext}
                disabled={loading || !nextCursor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200 active:scale-95"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Next Page
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-700 text-xs pb-4">
          Cursor-based pagination · PostgreSQL + Prisma · Neon hosted · 200k records
        </p>
      </main>
    </div>
  );
}
